---
title: 'Prompt Cache 到底缓存了什么？和 KV Cache 有什么区别？'
description: '从 Prefill、Decode 与 Attention 出发，拆解 KV Cache 和 Prompt Cache 的原理、差异与 Agent 工程实践。'
publishDate: 2026-09-26
tags: ['LLM', 'Transformer', 'KV Cache', 'Prompt Cache', 'Inference']
draft: false
comment: true
---

很多人第一次听到 **Prompt Cache（提示词缓存）**，会把它理解成“服务器把上次答案存下来，下次遇到相同问题直接返回”。这其实更接近 Response Cache，而不是大模型推理中的 Prompt Cache。

更准确地说，Prompt Cache 复用的是**模型处理相同提示前缀后产生的中间状态**。对于标准 Transformer，这些状态通常就是各层 Attention 的 Key / Value（KV）状态。OpenAI 当前文档也明确说明：Prompt Cache 保存的是可复用前缀对应的 KV tensors，而不是答案，也不是简单保存一份 Prompt 文本。

要理解它，先把 Prefill、Decode、Attention、KV Cache 和 Prefix/Prompt Cache 串起来。

## 1. 一次 LLM 推理分成什么阶段？

典型自回归推理可以粗略分为两个阶段：

~~~text
Prompt → Prefill → 初始 KV states → Decode → Output
~~~

### Prefill：先处理完整输入

假设输入有 3000 个 token。Prefill 会并行处理输入上下文，为 Transformer 各层计算隐藏状态以及 Attention 所需的 K/V 状态。长 Prompt 因此会影响 **Time To First Token（TTFT）**：开始输出第一个 token 前，模型必须先完成必要的输入处理。

### Decode：逐 token 生成

Prefill 后进入 Decode。模型每一步生成一个新 token，并产生这个 token 的 Q/K/V；新的 Query 需要关注此前可见的 token。

这里有一个常见但不够严谨的说法：“每生成一个 token，都要把前面的所有 token 从头重新计算一次。”在**没有 KV Cache 的朴素实现**里可以这样理解，但现代 LLM 推理通常使用 KV Cache。历史 token 的 K/V 不需要重复计算，这正是 KV Cache 的价值。

## 2. Attention 中 Q、K、V 分别是什么？

Scaled Dot-Product Attention 的经典形式是：

$$
Attention(Q,K,V)=softmax\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V
$$

| 向量 | 直观理解 |
|---|---|
| Query | 我现在想找什么？ |
| Key | 我这里有什么信息可以被匹配？ |
| Value | 真正要被取走的信息是什么？ |

当前 Query 与历史 Key 计算匹配分数，经缩放和 Softmax 得到权重，再对 Value 做加权汇总。

## 3. KV Cache 到底缓存什么？

在 Decode 时生成第 N+1 个 token，模型仍然需要历史 token 的 K 和 V。如果每一步都重新计算历史 K/V，会产生大量重复工作，于是推理引擎保存已经算好的状态：

~~~text
KV Cache
token 1 → K1, V1
token 2 → K2, V2
...
token N → Kn, Vn
~~~

生成新 token 后，只需要把新的 K/V 追加进去。**KV Cache 的核心目标，是避免同一个请求在自回归 Decode 过程中反复计算历史 token 的 K/V。**

### 为什么通常不缓存 Q？

对于标准 causal self-attention 的增量 Decode，当前步骤需要“当前 token 的 Query × 所有历史 Keys”，然后用权重读取历史 Values。历史 K/V 会在后续很多步反复访问；某个旧 token 的 Query 在它自己的步骤完成后通常不会再次使用。因此典型实现缓存 K/V，而不是完整的 Q/K/V。

## 4. KV Cache 对复杂度的影响要怎么理解？

原始笔记里用“Decode 从 O(N²) 降到 O(N)”帮助理解方向是可以的，但工程上需要更精确。

没有缓存时，朴素实现可能为了下一个 token 重新运行整个长度为 N 的前缀，其中 self-attention 包含二次复杂度计算。使用 KV Cache 后，不再重新构造全部历史 K/V；但当前 Query 仍需与约 N 个历史 Keys 做 Attention，因此**单层标准 Attention 的当前 Decode step 仍随上下文长度近似线性增长**。

所以更准确的结论是：KV Cache 用显存/内存换计算，消除了历史状态的重复投影与重复计算，但没有让长上下文 Attention 变成常数复杂度。

这也解释了为什么 KV Cache 本身会成为推理系统的重要资源：上下文越长、并发越高，需要保存的 KV 状态越多，框架会进一步采用分页、量化、淘汰等内存管理技术。

## 5. Prompt Cache 又是什么？

考虑一个 Agent 请求，每一轮前面都有大量相同内容：

~~~text
System Prompt
Tool / MCP Definitions
Few-shot Examples
Reference Context
Conversation History
-------------------- 共享前缀
本轮 User Message
~~~

第一次请求已经为公共前缀完成 Prefill 并产生 KV states。第二次请求如果具有相同前缀，再从头 Prefill 就产生重复计算。

Prompt Cache / Prefix Cache 的思路就是：**把这部分已经计算过的前缀状态建立跨请求复用机制。** 新请求命中相同前缀时，可以复用对应 KV states，只处理新增 suffix，再继续 Decode。

vLLM 的 Automatic Prefix Caching 也是这个思路：缓存已经处理过请求的 KV-cache blocks，新请求共享相同前缀时复用这些 blocks，跳过共享部分的重复计算。

## 6. Prompt Cache 缓存的不是答案

假设两个请求共享 10000 token 的 System、Tools 和文档，但用户问题不同。第二个请求可以复用前面公共前缀的计算结果，却仍然必须处理新的 User Message 并重新 Decode。

所以：

~~~text
Prompt Cache Hit ≠ Response Cache Hit
~~~

| 类型 | 缓存对象 | 命中后发生什么 |
|---|---|---|
| Response Cache | 最终答案 | 可以直接返回已有结果 |
| Prompt / Prefix Cache | 可复用前缀的模型中间状态 | 跳过共享前缀的重复处理，继续推理 |

## 7. KV Cache vs Prompt Cache

| 维度 | KV Cache | Prompt / Prefix Cache |
|---|---|---|
| 核心复用范围 | 单次生成过程 | 跨请求的相同前缀 |
| 主要优化阶段 | Decode | Prefill |
| 常见缓存内容 | 已处理 token 的 K/V states | 可复用前缀对应的 K/V states |
| 解决的问题 | Decode 不重复计算历史 K/V | 新请求不重复 Prefill 相同前缀 |
| 是否直接返回答案 | 否 | 否 |
| 典型收益 | 提高逐 token 生成效率 | 降低 TTFT、Prefill 计算与缓存输入成本 |
| 生命周期 | 通常跟随请求/序列，由引擎管理 | 可跨请求复用，TTL/淘汰取决于具体实现 |

> **KV Cache 解决“这次生成时，历史 K/V 别重复算”；Prompt Cache 解决“下一次请求遇到相同前缀时，这段 K/V 也别重新算”。**

## 8. 为什么强调“前缀”匹配？

假设：

~~~text
请求 A：[A][B][C][D][X]
请求 B：[A][B][C][D][Y]
~~~

前面的 A-B-C-D 可以成为共享前缀。但如果 B 请求变成 A-B-Z-D-Y，从变化位置开始，后续状态通常不能直接沿用旧缓存，因为 Transformer 后续 token 的状态依赖前面的上下文。

这带来一个非常实用的 Prompt 组织原则：

> **Static First, Dynamic Last：稳定内容放前面，动态内容尽量放后面。**

例如 Agent 可以优先组织为：稳定系统指令 → 稳定 Tool Definitions → Few-shot → 历史上下文 → 动态 User Input。不要在最前面插入每次变化的时间戳、随机 ID 等内容，否则会很早破坏公共前缀。

OpenAI 当前 Prompt Caching 文档同样强调，复用依赖渲染后的完整前缀匹配；工具定义、开发者消息、对话历史以及相关请求设置发生变化，都可能改变可复用边界。

## 9. 真实实现并不是“一整块 KV 永久放显存”

原始笔记把 Prompt Cache 描述成“跨请求长期存在显存中、按 LRU 过期”，这个描述适合作为直觉，但不能当成所有实现的统一定义。

以 vLLM 为例，Automatic Prefix Caching 以 **KV cache block** 为基本单位，对 token block 及其前缀建立哈希，从 block pool 中寻找可复用的最长共享前缀，并配合引用计数和淘汰机制管理缓存。

而云服务的存储位置、TTL、路由和淘汰策略又可能不同。OpenAI 当前文档明确指出缓存条目不会永久保存，生命周期取决于模型和 retention 设置。因此更严谨的说法是：**Prompt Cache 是对可复用前缀中间状态的跨请求管理机制，而不是某一种固定的显存数据结构。**

## 10. 为什么 Agent 场景尤其适合 Prompt Cache？

Agent 每轮请求往往包含系统指令、几十个 Tool/MCP Schema、Skill/Policy、历史消息，真正变化的可能只有最后一小段。

假设：

~~~text
System + Tools + Rules = 8000 tokens
User Input             =  200 tokens
~~~

如果每轮都重新处理前 8000 tokens，会产生大量重复 Prefill。命中公共前缀后，推理系统可以复用这部分状态，只处理新增内容。

因此 Prompt 的组织方式不仅影响模型效果，也影响**缓存命中率、TTFT、吞吐和推理成本**。对于 Agent 开发，这已经是值得专门考虑的工程优化。

## 11. 三个容易混淆的问题

### Prompt Cache 是不是把 Prompt 文本存起来？

服务端需要识别某个前缀能否复用，但从模型计算复用的核心对象看，真正有价值的是已经计算的 KV states，而不是“少读取一次字符串”。

### KV Cache 能不能跨请求？

与其绝对地说“KV Cache 只能单请求”，更严谨的说法是：普通 KV Cache 描述增量生成中的状态复用；当推理系统进一步对这些状态建立跨请求索引、匹配和生命周期管理时，就形成了 Prefix/Prompt Caching。

### Prompt Cache 会改变模型输出吗？

正确的 Prefix Cache 复用的是相同前缀本来就应该得到的计算状态。它优化的是计算路径和资源消耗，而不是把模型变成数据库查表。

## 12. 最后把两者串起来

~~~text
第一次请求
Prompt → Prefill → Prefix K/V ──→ Prompt/Prefix Cache
                    │
                    └──────────→ 当前请求 KV Cache → Decode

后续请求
相同 Prefix？
  ├─ Yes → 复用 Prefix K/V ─┐
  └─ No  → 正常 Prefill ────┤
                            ↓
                     处理新增 suffix
                            ↓
                          Decode
~~~

如果只记住两句话：

> **KV Cache：缓存历史 token 的 K/V，让当前请求的 Decode 不必反复计算历史状态。**

> **Prompt Cache：让后续请求复用相同 Prompt 前缀已经计算好的状态，从而减少重复 Prefill。**

理解这两层缓存，也就理解了为什么现代推理系统如此关注 **KV cache memory、prefix matching、cache hit rate、TTFT 和 prompt organization**。

## 参考资料

- [OpenAI API — Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)
- [vLLM — Automatic Prefix Caching](https://docs.vllm.ai/en/latest/features/automatic_prefix_caching/)
- [vLLM — Prefix Caching Design](https://docs.vllm.ai/en/latest/design/prefix_caching/)
