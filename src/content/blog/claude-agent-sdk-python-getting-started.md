---
title: 'Claude Agent SDK Python 入门指南'
description: '从核心模块、工具注册、Skill、Plugin、权限到会话持久化，系统认识 claude-agent-sdk-python 并搭建自己的 Agent。'
publishDate: 2026-08-05
tags: ['Claude Agent SDK', 'AI Agent', 'Python', 'MCP']
draft: false
comment: true
---

如果普通大模型 API 解决的是“输入一段话，返回一段话”，那么 Claude Agent SDK 解决的是另一类问题：

> 让 Claude 在 Python 程序中持续对话、调用工具、读取 Skill，并由应用控制权限、会话和执行过程。

本文结合当前项目中的实现，帮助第一次接触 `claude-agent-sdk-python` 的读者快速认识核心模块，并搭建一个可继续扩展的 Agent。

读完本文，你应该能够回答这些问题：

- 什么时候使用 `query()`，什么时候使用 `ClaudeSDKClient`？
- Python 函数如何变成 Claude 可以调用的 MCP 工具？
- Skill、Plugin、MCP 各自解决什么问题？
- Hook、`can_use_tool` 和 `AskUserQuestion` 应该如何选择？
- 长任务中的用户确认、结构化输出和会话恢复应该由谁管理？
- 沙箱、文件检查点和密钥注入分别保护什么？

> 本文基于当前仓库中的 SDK 文档快照编写。SDK 版本、bundled CLI、字段和运行行为可能继续变化，正式项目应以实际安装版本为准。

推荐阅读顺序：先读第 2～7 节跑通最小 Agent，再读第 8～9 节理解能力与权限，最后按需阅读第 10～15 节的生产实践。

## 1. 最快跑起来

如果从空项目开始，可以安装 SDK：

```bash
uv add claude-agent-sdk
```

当前项目已经在 `pyproject.toml` 中声明依赖，完成相应的 Claude 认证配置后可以直接运行：

```bash
uv sync
uv run python main.py
```

入口会启动一个持续对话的命令行 Agent，并注册“获取时间”和“数字求和”两个示例工具。

## 2. 先理解整体调用链

```text
用户输入
   ↓
你的 Python 应用
   ↓
ClaudeSDKClient（连接与会话）
   ↓
Claude Agent 循环
   ├─ 生成回答
   ├─ 调用内置工具
   ├─ 调用自定义 MCP 工具
   └─ 按需加载 Skill
   ↓
消息流返回 Python 应用
```

SDK 不只是替你调用模型，它还管理了 Agent 的多轮执行、工具调用和消息事件。你的应用则负责业务状态、用户界面、权限规则以及结果持久化。

## 3. 最常用的模块

| 模块 | 作用 | 什么时候使用 |
|---|---|---|
| `query()` | 执行一次独立任务 | 脚本、批处理、无需连续上下文 |
| `ClaudeSDKClient` | 保持连接和多轮会话 | 聊天助手、持续任务、交互式 Agent |
| `ClaudeAgentOptions` | 集中配置模型、提示词、工具、权限等 | 创建客户端之前 |
| `AssistantMessage` | Claude 的过程消息 | 获取文本、工具调用等内容块 |
| `ResultMessage` | 一轮执行的最终结果 | 获取结果、会话 ID、成本、错误信息 |
| `StreamEvent` | 文本增量事件 | 实现打字机式流式输出 |
| `@tool` | 把异步 Python 函数定义成工具 | 给 Agent 增加业务能力 |
| `create_sdk_mcp_server()` | 将多个工具组装为进程内 MCP Server | 把 Python 工具注册给 Claude |
| `skills` | 启用 SDK 已发现的 Skill | 复用操作规范和专业流程 |
| `plugins` | 从本地目录加载扩展包 | 一次引入一组 Skill、MCP 等资源 |
| `hooks` / `can_use_tool` | 检查行为和处理权限 | 危险操作拦截、用户审批、审计 |
| `output_format` | 用 JSON Schema 约束最终结果 | 工作流节点输出、程序间数据交换 |
| `session_store` | 将会话记录镜像到外部存储 | 多机器、容器和长时间会话恢复 |
| `sandbox` | 限制 Bash 的文件、网络和系统访问 | 执行脚本、FFmpeg 等本地命令 |

## 4. `query()` 还是 `ClaudeSDKClient`？

一次性任务可以直接使用 `query()`：

```python
from claude_agent_sdk import query

async for message in query(prompt="解释这个项目的目录结构"):
    print(message)
```

如果希望用户继续追问，并让 Claude 记住前文，使用 `ClaudeSDKClient`：

```python
from claude_agent_sdk import ClaudeSDKClient

async with ClaudeSDKClient() as client:
    await client.query("记住：项目代号是 Aurora")
    async for message in client.receive_response():
        print(message)

    await client.query("项目代号是什么？")
    async for message in client.receive_response():
        print(message)
```

每次 `query()` 后，都要完整消费 `receive_response()`。不要为了提前结束显示而直接 `break`，否则可能影响本轮异步清理和下一轮请求。

## 5. 用 `ClaudeAgentOptions` 组装 Agent

大部分能力都从这个配置对象进入：

```python
from claude_agent_sdk import ClaudeAgentOptions

options = ClaudeAgentOptions(
    cwd="./workspace",
    system_prompt={
        "type": "file",
        "path": "./prompts/system.md",
    },
    model="你的模型名称",
    max_turns=10,
    include_partial_messages=True,
    skills="all",
)
```

几个容易混淆的字段：

- `tools`：决定向 Claude 提供哪些工具。
- `allowed_tools`：哪些工具无需再次询问即可执行，并不代表“只允许这些工具”。
- `disallowed_tools`：明确禁止的工具或调用规则。
- `cwd`：Agent 工作目录，文件工具通常围绕它工作。
- `system_prompt`：定义 Agent 的角色、边界和工作原则。
- `include_partial_messages=True`：开启真正的文本增量事件。

## 6. 给 Agent 注册 Python 工具

### 第一步：定义工具

```python
from typing import Any
from claude_agent_sdk import tool


@tool("calculate_sum", "计算两个数字的和", {"a": float, "b": float})
async def calculate_sum(args: dict[str, Any]) -> dict[str, Any]:
    result = args["a"] + args["b"]
    return {
        "content": [
            {"type": "text", "text": str(result)}
        ]
    }
```

`@tool` 主要声明三件事：工具名称、工具描述和输入结构。描述应清楚说明“何时使用”，否则 Claude 很难正确选择工具。

### 第二步：创建进程内 MCP Server

```python
from claude_agent_sdk import create_sdk_mcp_server

server = create_sdk_mcp_server(
    name="app_tools",
    version="1.0.0",
    tools=[calculate_sum],
)
```

“进程内”表示工具服务器和 Agent 运行在同一个 Python 进程中，不需要单独启动端口或子服务，适合封装当前项目里的数据库查询、业务 API 和计算逻辑。

### 第三步：交给客户端

```python
options = ClaudeAgentOptions(
    mcp_servers={"app": server},
    allowed_tools=["mcp__app__calculate_sum"],
)
```

工具的完整名称遵循：

```text
mcp__<mcp_servers 中的别名>__<工具名称>
```

这里使用的是别名 `app`，所以工具名是 `mcp__app__calculate_sum`。

## 7. 如何读取回答、工具调用和最终结果

SDK 返回的不是单一字符串，而是一系列不同类型的消息：

```python
from claude_agent_sdk import (
    AssistantMessage,
    ResultMessage,
    TextBlock,
    ToolUseBlock,
)
from claude_agent_sdk.types import StreamEvent

async for message in client.receive_response():
    if isinstance(message, StreamEvent):
        # 原始增量事件，适合流式 UI
        pass

    elif isinstance(message, AssistantMessage):
        for block in message.content:
            if isinstance(block, TextBlock):
                print(block.text)
            elif isinstance(block, ToolUseBlock):
                print("调用工具：", block.name, block.input)

    elif isinstance(message, ResultMessage):
        print("会话 ID：", message.session_id)
        print("最终结果：", message.result)
        print("本轮成本：", message.total_cost_usd)
```

可以把它们简单理解为：

- `AssistantMessage`：Agent 执行过程中的内容。
- `StreamEvent`：更细粒度的文本增量。
- `ResultMessage`：本轮结束标志和汇总信息。

## 8. Skill、Plugin 和 MCP 的区别

这三个概念承担不同职责：

| 概念 | 可以理解为 | 主要内容 |
|---|---|---|
| Skill | 操作说明书 | 某类任务应该如何完成 |
| MCP Tool | 可执行能力 | 查询数据库、调用 API、处理文件 |
| Plugin | 扩展包 | 可组合 Skill、MCP、子 Agent 等资源 |

`skills="all"` 表示启用所有已发现的 Skill，也可以只启用指定名称：

```python
ClaudeAgentOptions(
    skills=["video-prompt", "storyboard"],
)
```

`skills` 不是 Skill 文件路径，也不是把所有 Skill 全文一次性塞入提示词，而是限定本次会话可以使用哪些已发现的 Skill，Claude 会在需要时通过 `Skill` 工具加载。

如果你显式覆盖了 `tools`，记得将 `"Skill"` 放入工具列表，否则 Skill 可能无法被调用。

Plugin 则通过本地目录加载：

```python
ClaudeAgentOptions(
    plugins=[
        {"type": "local", "path": "./video-plugin"},
    ],
    skills="all",
)
```

当前 Python SDK 的 `SdkPluginConfig` 只支持 `type="local"`。可以把 Plugin 理解为扩展能力的“安装包”，而 Skill 是其中某一项具体工作方法。加载 Plugin 后，仍需通过 `skills`、工具权限等配置决定本次会话实际能使用哪些能力。当前 API 快照只给出了插件加载配置，没有展开插件目录的完整规范。

如果设置 `strict_mcp_config=True`，只会使用 `mcp_servers` 中显式传入的 MCP Server，插件或其他配置来源提供的 MCP Server 会被忽略。

## 9. 权限、Hook 和用户提问怎么选

- `allowed_tools`：低风险工具可以直接执行。
- `disallowed_tools`：明确禁止某类工具或调用。
- `PreToolUse` hook：每次匹配的工具执行前都检查，适合强制安全规则。
- `can_use_tool`：当权限系统需要询问时，由你的应用返回允许或拒绝。
- `AskUserQuestion`：Claude 发现任务信息不足时主动提问，不适合代替强制审批。

常见的 `permission_mode`：

| 模式 | 简要含义 |
|---|---|
| `default` | 使用标准权限评估，适合配合 `can_use_tool` |
| `acceptEdits` | 自动接受文件编辑，不适合要求每次编辑都审批的场景 |
| `plan` | 以规划和探索为主，限制编辑行为 |
| `dontAsk` | 未预先批准的调用直接拒绝，不弹出询问 |
| `bypassPermissions` | 绕过大部分权限检查，生产环境慎用 |
| `auto` | 由模型分类器批准或拒绝工具调用 |

如果要求“删除、付费生成等操作必须经用户确认”，推荐的职责组合是：

```text
PreToolUse 强制拦截
        ↓
can_use_tool 将审批交给你的 UI
        ↓
用户允许或拒绝
```

不要只在 System Prompt 中写“操作前请确认”。提示词属于行为指导，不能替代程序化权限控制。

### 9.1 `can_use_tool` 不是每次都会执行

这是权限开发中最容易踩的坑。`can_use_tool` 是交互式权限提示的程序化替代，只有权限评估最终得到“需要询问”时才会调用。

以下情况通常会在它之前被处理：

- `allowed_tools` 或设置中的允许规则已经批准调用；
- `disallowed_tools` 已经拒绝调用；
- `permission_mode` 已经能够决定；
- `PreToolUse` hook 已经拒绝或修改调用。

因此，需要 `can_use_tool` 审批的工具不要同时放进 `allowed_tools`。如果要求“无论是否已获权限，每次调用都必须检查”，应使用 `PreToolUse` hook。

```python
from claude_agent_sdk import (
    ClaudeAgentOptions,
    HookMatcher,
    PermissionResultAllow,
    PermissionResultDeny,
)


async def require_confirmation(input_data, tool_use_id, context):
    return {
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "ask",
            "permissionDecisionReason": "该工具执行前必须由用户确认",
        }
    }


async def permission_handler(tool_name, input_data, context):
    approved = await show_approval_in_your_ui(tool_name, input_data)
    if approved:
        return PermissionResultAllow()
    return PermissionResultDeny(message="用户拒绝了此次操作")


options = ClaudeAgentOptions(
    permission_mode="default",
    hooks={
        "PreToolUse": [
            HookMatcher(
                matcher="Bash|Write|Edit|mcp__video__generate",
                hooks=[require_confirmation],
            )
        ]
    },
    can_use_tool=permission_handler,
)
```

实际项目中的 `show_approval_in_your_ui()` 可以连接网页、桌面端或消息队列。回调返回 `PermissionResultAllow()` 或 `PermissionResultDeny()`，而不是让模型自行猜测用户是否同意。

### 9.2 `AskUserQuestion` 用于补充信息

`AskUserQuestion` 是 Claude 的内置工具。当模型认为任务缺少关键信息时，它可以主动提出 1～4 个问题，例如询问视频比例、目标平台或风格。

是否调用主要由 Claude 根据用户提示、System Prompt 和当前上下文判断。你可以用提示词影响这种行为，但不能把它当作强制审批机制：

```text
只有缺失的信息会显著影响结果或造成风险时，才使用 AskUserQuestion；
无关紧要的细节使用合理默认值。
```

简单选择规则：

| 需求 | 应使用 |
|---|---|
| Claude 缺少任务信息，需要向用户澄清 | `AskUserQuestion` |
| 权限系统要求应用批准或拒绝 | `can_use_tool` |
| 每次匹配的工具调用都必须检查 | `PreToolUse` hook |
| 多阶段作品审核、修改和版本选择 | 应用状态机和业务 UI |

## 10. 会话和业务状态要分开管理

`ResultMessage.session_id` 可用于恢复 Claude 会话：

```python
options = ClaudeAgentOptions(resume=saved_session_id)
```

SDK transcript 是用户消息、Claude 回复、工具调用和工具结果等会话记录。`session_store` 可以把本地 transcript 镜像到外部存储，方便跨机器或容器恢复。

但会话记录不应该代替业务数据库。例如一个视频生成 Agent，数据库仍应明确保存：

```text
workflow_id
current_stage
approved_prompt
selected_storyboard_id
video_status
claude_session_id
```

Claude 会话负责“记住交流上下文”，业务状态机负责“决定流程现在能走到哪一步”。

### 10.1 长流程应由应用状态机编排

以视频生成任务为例：

```text
生成提示词
   ↓
等待用户确认或修改
   ↓
生成分镜图
   ↓
等待用户确认、重试或选择历史版本
   ↓
生成视频
```

不要让一个 Agent 调用从头运行到尾，并期待它在进程内无限期等待用户。更可靠的方式是将每个阶段作为独立的一轮执行：

```python
await client.query("只生成视频提示词，完成后停止，不要生成分镜")
prompt_result = await receive_stage_result(client)

# 展示给用户；等待时间可能是几分钟，也可能是几天
approved_prompt = await wait_for_user_approval(prompt_result)

await client.query(
    f"用户确认的提示词如下：\n{approved_prompt}\n"
    "现在只生成分镜方案，完成后停止"
)
storyboard_result = await receive_stage_result(client)
```

真实 Web 服务通常不会一直保持连接。阶段完成后应保存 `session_id` 和业务状态，释放客户端；用户回来后通过 `resume` 恢复会话，再进入下一阶段。

```python
options = ClaudeAgentOptions(
    resume=workflow.claude_session_id,
)
```

### 10.2 生成内容应使用版本管理

图片、音频和视频不适合使用 file checkpointing 管理版本。重新生成时应保留每个产物：

```text
storyboard_v1.png
storyboard_v2.png
storyboard_v3.png
```

业务数据库只需要记录当前选择：

```python
{
    "workflow_id": "video-123",
    "storyboard_versions": ["v1", "v2", "v3"],
    "selected_storyboard_id": "v1",
}
```

这样用户生成第三张后仍可选择第一张。`rewind_files(user_message_id)` 更适合恢复 Agent 对工作区文件的修改，不应替代媒体资产版本系统。

## 11. 用 JSON Schema 获得结构化结果

长流程中不要依赖模型返回一段自由文本后再用正则解析。SDK 提供 `output_format`，可以用 JSON Schema 验证一轮执行的最终结果：

```python
stage_schema = {
    "type": "object",
    "properties": {
        "stage": {
            "type": "string",
            "enum": ["prompt", "storyboard", "video"],
        },
        "status": {
            "type": "string",
            "enum": ["completed", "waiting_approval", "failed"],
        },
        "content": {"type": "string"},
        "message": {"type": "string"},
    },
    "required": ["stage", "status", "content", "message"],
    "additionalProperties": False,
}

options = ClaudeAgentOptions(
    output_format={
        "type": "json_schema",
        "schema": stage_schema,
    }
)
```

从最终的 `ResultMessage.structured_output` 读取已经通过结构验证的数据：

```python
async for message in client.receive_response():
    if isinstance(message, ResultMessage):
        if message.subtype == "success":
            stage_result = message.structured_output
        elif message.subtype == "error_max_structured_output_retries":
            raise RuntimeError("模型多次未能生成符合 Schema 的结果")
```

需要注意：

- 它约束的是一轮 Agent 执行的最终结果，不保证所有流式片段和中间消息都是 JSON；
- `structured_output` 是给程序消费的数据，`result` 是最终文本，两者用途不同；
- 收到结果后仍建议用 Pydantic 等业务模型再次校验；
- 不同阶段差异很大时，可以为每个阶段重新创建带不同 Schema 的客户端，并用 `resume=session_id` 延续原会话；也可以设计一个统一 Schema。

## 12. 上下文压缩与会话恢复

长对话会不断积累用户消息、工具调用和结果。当上下文接近模型限制时，系统可以将较早内容压缩为摘要，再结合近期消息继续执行：

```text
完整历史记录
    ↓ 压缩
历史摘要 + 最近消息 + 当前请求
```

Python SDK 提供 `PreCompact` hook，用来观察压缩发生前的事件：

```python
async def before_compact(input_data, tool_use_id, context):
    print("压缩触发方式：", input_data["trigger"])  # auto 或 manual
    return {}


options = ClaudeAgentOptions(
    hooks={
        "PreCompact": [HookMatcher(hooks=[before_compact])]
    }
)
```

上下文压缩和会话记录不是一回事：

- transcript 可以保留完整历史；
- 模型下一轮实际看到的上下文可能是摘要加近期消息；
- `resume=session_id` 是恢复会话状态，不是由你的代码把所有原始消息拼成一个大提示词重新发送。

因此，早期聊天中出现过的关键业务事实仍应写入业务数据库，不能只依赖压缩摘要。

## 13. 将会话持久化到外部存储

单机开发时，只要本地会话文件仍然存在，通常保存 `session_id` 后就可以恢复。以下场景则适合配置 `session_store`：

- 容器重启后本地文件会丢失；
- 请求可能落到不同服务器；
- 需要集中备份或跨主机恢复会话。

```python
options = ClaudeAgentOptions(
    session_store=my_session_store,
    session_store_flush="batched",
)
```

当前仓库中的 API 快照只列出了 `SessionStore` 配置入口，没有展开自定义存储接口的全部方法；真正接入 Redis、对象存储或数据库时，应以实际 SDK 版本对应的 SessionStore 接口文档为准。

刷新策略有两种：

- `batched`：默认值，每轮结束或缓冲区满时刷新，写入次数较少；
- `eager`：每个数据帧后触发后台刷新，数据更及时但存储操作更多。

建议同时维护两个层面的持久化：

| 数据 | 存储位置 |
|---|---|
| Claude 消息、工具调用、会话 transcript | `SessionStore` |
| 工作流阶段、审批结果、媒体版本、业务错误 | 业务数据库 |
| 两者之间的关联 | 数据库中的 `claude_session_id` |

## 14. 沙箱保护什么

沙箱主要限制 Agent 通过 Bash 执行的进程能够访问哪些文件、网络和系统资源。它适用于 Agent 会运行以下操作的场景：

- 使用 FFmpeg 合成视频；
- 运行 Python 图像处理脚本；
- 下载素材或模型；
- 创建、移动和删除临时文件。

```python
options = ClaudeAgentOptions(
    sandbox={
        "enabled": True,
        "autoAllowBashIfSandboxed": True,
        "allowUnsandboxedCommands": False,
        "network": {
            "allowedDomains": ["api.example.com", "cdn.example.com"],
        },
        "failIfUnavailable": True,
    }
)
```

当前文档特别提醒：Python SDK 中如果沙箱无法启动，默认可能只输出警告并在沙箱外运行。安全要求较高时应设置 `failIfUnavailable=True`，并检查错误类型。

沙箱不是业务审批系统。如果“生成视频会收费，必须让用户确认”，仍应使用状态机或 `PreToolUse + can_use_tool`。

如果 Agent 只调用受控的进程内 MCP/API，而不运行 Bash 或本地脚本，SDK 命令沙箱的重要性相对较低；此时更关键的是 MCP 服务内部的鉴权、参数校验和密钥隔离。

## 15. `.env`、`options.env` 和密钥隔离

`ClaudeAgentOptions.env` 会把指定环境变量合并到 CLI 子进程继承的环境中：

```python
options = ClaudeAgentOptions(
    env={
        "IMAGE_PROVIDER_API_KEY": provider_key,
        "API_TIMEOUT_MS": "120000",
    }
)
```

如果项目要求“父进程禁止持有 Provider 密钥”，通常是指不要通过 `load_dotenv()` 将所有密钥长期写入主进程的 `os.environ`。更稳妥的方式是从加密数据库或 Secret Manager 按任务读取，再通过 `options.env` 显式注入当前 SDK/CLI 子进程。

但必须认识到：CLI 启动的 Bash 子进程也可能继承这些变量。因此 `options.env` 只是缩小密钥的暴露范围，并不意味着 Agent 永远看不到密钥。推荐：

- 只注入当前任务需要的最少密钥；
- 使用短期、低权限 Token；
- 限制 Bash 和网络访问；
- 更理想地让受控 MCP 服务持有 Provider 密钥，Agent 只传递业务参数。

```text
Agent → MCP 工具 → 受控业务服务 → Provider API
                  服务端读取密钥
```

## 16. 本项目提供的最小 Agent 结构

当前项目已经把底层 SDK 消息封装成了更稳定的应用事件：

```text
agent/
  core.py       # 客户端生命周期、配置、流式事件
  tools.py      # 示例 MCP 工具
prompts/
  system.md     # Agent 的系统提示词
main.py         # 命令行聊天入口
```

使用方式：

```python
from agent import ClaudeAgent
from agent.tools import calculate_sum, get_current_time

agent = ClaudeAgent(
    cwd=".",
    system_prompt_file="prompts/system.md",
    skills="all",
)

agent.register_tool(calculate_sum)
agent.register_tool(get_current_time)

async with agent:
    async for event in agent.stream("计算 18.5 与 23.4 的和"):
        if event.type == "text_delta" and event.text:
            print(event.text, end="", flush=True)
```

工具需要在 Agent 启动前注册，因为进程内 MCP Server 会在创建客户端时统一构建。

## 17. 搭建自己的 Agent，建议按这个顺序

1. 先确定 Agent 的职责和 System Prompt。
2. 使用 `ClaudeSDKClient` 跑通多轮文本对话。
3. 将业务函数包装成 MCP 工具。
4. 统一解析消息，向上层输出稳定事件。
5. 再增加 Skill、权限 Hook 和用户审批。
6. 最后接入会话持久化、结构化输出、子 Agent 和沙箱。

不要一开始就把所有高级配置放进去。一个可靠的 Agent，通常是从“一个客户端、一个提示词、一个工具、一条完整消息流”逐步生长出来的。

## 18. 下一步可以扩展什么

- 使用 `output_format` 和 JSON Schema 约束最终结果。
- 使用 `agents` 定义负责不同任务的子 Agent。
- 使用 `max_turns`、`max_budget_usd` 控制执行边界。
- 使用 `sandbox` 限制 Bash 的文件和网络访问。
- 使用 `session_store` 支持分布式会话恢复。
- 使用应用状态机实现“生成—用户确认—继续执行”的长任务。

到这里，你已经掌握了 Claude Agent SDK 最重要的主线：

> `ClaudeSDKClient` 管会话，`ClaudeAgentOptions` 管配置，消息类型管过程，MCP 管工具，Skill 管方法，Hook 和权限回调管边界，业务数据库管真实流程。

围绕这条主线扩展，就可以逐步搭建出适合自己业务的 Agent。
