---
title: 'Hermes Agent — AI 智能体框架深度解析'
description: '全面解析 Nous Research 开源项目 Hermes Agent 的核心特性、技术架构与生态对比'
publishDate: 2026-07-06
tags: ['AI Agent', 'Hermes', '开源', '框架对比']
draft: false
comment: true
---

Hermes Agent 是由 **Nous Research** 开发的开源 AI 智能体框架。它可以在终端（CLI/TUI）、原生桌面应用、20+ 消息平台（Telegram、Discord、飞书、Slack 等）以及 IDE（VS Code、JetBrains）中运行，是一个真正意义上的"全平台 AI 智能体"。

与 Claude Code（Anthropic）、Codex（OpenAI）等产品属于同一赛道——**自主编码与任务执行的 AI Agent**，但 Hermes 有几个鲜明的差异化特征。

## 一、项目概述

### 为什么选择 Hermes？

- **技能自进化**：从经验中学习，自动保存可复用的工作流程为 Skill，越用越聪明
- **持久记忆**：跨会话记住你是谁、你的偏好、环境细节和学到的教训
- **多平台网关**：同一 Agent 实例可同时在 20+ 消息平台上运行，共享全部工具能力
- **模型无关**：支持 OpenRouter、Anthropic、OpenAI、DeepSeek、xAI 等 20+ 提供商，可随时切换
- **多 Profile 隔离**：运行多个独立 Hermes 实例，每个实例拥有隔离的配置、会话和记忆
- **高度可扩展**：支持插件、MCP 服务器、自定义工具、Webhook 触发器和定时任务

### 安装

一行命令即可在 macOS、Windows 和 Linux 上完成部署：

```bash
# macOS / Linux
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

# Windows (PowerShell)
irm https://hermes-agent.nousresearch.com/install.ps1 | iex
```

## 二、核心特性

### 1. 技能自进化 (Skills)

这是 Hermes Agent 最独特的特性。传统 Agent 每次对话都是"一张白纸"，但 Hermes 可以将解决复杂问题、发现工作流或被纠正的经验，持久化为 Skill 文档。

这些 Skill 会在未来的会话中自动加载，让 Agent 在特定任务和环境上越来越好。Skill 系统由后台 **Curator** 自动维护——跟踪使用频率、标记闲置技能、归档过期技能，并支持 Pin 保护重要技能不被自动清理。

**Skill 生命周期**：
1. **发现**：Agent 在完成复杂任务后自动识别可复用的模式
2. **保存**：将识别到的模式持久化为结构化的 Skill 文档
3. **复用**：在未来会话中自动加载匹配的 Skill
4. **维护**：Curator 后台自动管理 Skill 的活跃度与相关性
5. **归档**：长期未使用的 Skill 被自动归档，保持技能库的简洁高效

### 2. 持久记忆 (Memory)

Hermes 拥有跨会话的持久记忆系统。它记住了你是谁、你的偏好、环境细节和学到的教训。记忆会注入每一次对话的上下文中，因此你不需要一遍又一遍地重复自己。

记忆按目标分为两种类型：

- **Memory（通用笔记）**：你的个人笔记、环境约定、工具使用技巧
- **User Profile（用户画像）**：你是谁、你的角色、偏好、语言习惯

记忆后端支持热插拔：内置 SQLite、Honcho、Mem0 等。

### 3. 多平台网关 (Gateway)

Hermes 的网关系统是它与其他 Agent 框架最大的区别之一。同一个 Agent 核心可以在 20+ 消息平台上运行，拥有完整的工具访问权限——不只是聊天。

支持的平台包括：Telegram、Discord、Slack、WhatsApp、iMessage、Signal、飞书、钉钉、微信、Google Chat、Microsoft Teams、Email、Matrix、Mattermost、LINE、SimpleX、Home Assistant、Raft（Agent 网络）等。

每个平台连接器是一个插件（Gateway Plugin），Hermes 提供了清晰的 SDK 来编写自定义连接器。

### 4. 模型无关架构

Hermes Agent 不绑定任何模型提供商。你可以在同一工作流中随时切换模型和提供商，无需更改任何其他配置。

**配置文件示例：**

```yaml
default:
  provider: openrouter
  model: deepseek/deepseek-v4-flash
  fallbacks:
    - provider: anthropic
      model: claude-sonnet-4
    - provider: openai
      model: gpt-4o
```

支持自动的密钥池化（同一提供商的多个 API 密钥自动轮换）和失败回退。

### 5. 多 Profile 隔离

Profiles 是 Hermes 的另一项独特设计——你可以运行多个完全独立的 Hermes 实例，每个拥有独立的：

- 配置（模型、提供商、工具集）
- 会话历史
- 技能集合
- 记忆存储
- 定时任务（Cron Jobs）
- 插件

非常适合在同一台机器上管理不同的角色或项目。

## 三、技术架构

Hermes Agent 的架构设计遵循"**一个核心，多个表面**"的原则。核心引擎处理 Agent 循环、工具调用和上下文管理；表面的多样性（CLI、TUI、桌面应用、Web Dashboard、ACP 服务器）共享同一个核心。

### 核心架构组件

- **Agent Core**：核心引擎，负责推理循环、工具编排和上下文管理
- **Skills System**：技能发现、保存、匹配和加载的生命周期管理
- **Memory System**：跨会话持久化存储，支持 SQLite 等多种后端
- **Gateway**：多平台消息路由，将同一 Agent 核心映射到多个平台
- **Plugin System**：插件系统，支持 MCP 服务器、自定义工具等
- **Profile Manager**：多实例隔离管理
- **Cron Scheduler**：内置定时任务调度器
- **ACP Server**：Agent Communication Protocol 服务器，允许外部进程与 Agent 通信

### Agent 循环流程

1. 接收输入（终端、消息平台、API 等）
2. 加载当前 Profile 的配置、Skill 和 Memory
3. 构建上下文（系统提示 + 记忆 + 相关 Skill + 会话历史）
4. LLM 推理生成响应（文本或工具调用）
5. 执行工具调用（若需），将结果注入上下文
6. LLM 再次推理，整合工具结果
7. 返回最终响应给用户
8. 异步更新 Memory 和 Skill

### 四大后台系统

- **Curator**：Skill 生命周期管理，自动维护技能库的健康度
- **Memory Manager**：记忆的写入、检索和过期管理
- **Gateway Router**：消息的分发与聚合
- **Cron Scheduler**：定时任务的调度和执行

## 四、生态与对比

### 与同类框架的对比

| 维度 | Hermes Agent | Claude Code | OpenAI Codex | AutoGen |
|------|-------------|-------------|--------------|---------|
| **开源** | ✅ 完全开源 | ❌ 闭源 | ❌ 闭源 | ✅ MIT |
| **技能进化** | ✅ 自动进化 | ❌ | ❌ | ❌ |
| **持久记忆** | ✅ 跨会话 | ❌ | ❌ | ❌ |
| **多平台** | ✅ 20+ 平台 | ❌ 仅终端 | ❌ 仅 IDE | ❌ |
| **多模型** | ✅ 20+ 提供商 | ❌ Claude 限定 | ❌ OpenAI 限定 | ✅ |
| **多 Profile** | ✅ 内置 | ❌ | ❌ | ❌ |
| **定时任务** | ✅ 内置 | ❌ | ❌ | ❌ |
| **插件系统** | ✅ MCP + 插件 | ❌ | ❌ | ✅ |
| **安装复杂度** | ⭐ 一行命令 | ⭐ 一行命令 | ⭐⭐ IDE 集成 | ⭐⭐⭐ Python |

### 适用场景

- **个人 AI 助手**：全平台接入，跨设备共享上下文
- **编码 Agent**：代码编写、调试、重构、代码审查
- **DevOps 自动化**：服务器监控、部署、告警响应
- **研究助手**：论文分析、文献综述、实验跟踪
- **多角色管理**：同一机器上运行多个独立 Agent 实例
- **团队协作**：网关共享给整个团队使用

## 五、相关链接

- [Hermes Agent 官网](https://hermes-agent.nousresearch.com)
- [GitHub 仓库](https://github.com/NousResearch/hermes-agent)
- [官方文档](https://hermes-agent.nousresearch.com/docs)
- [Nous Research](https://nousresearch.com)
- [Discord 社区](https://discord.gg/nousresearch)

---

*本文档基于 Hermes Agent 官方资料整理 · 数据更新于 2026 年 7 月*
