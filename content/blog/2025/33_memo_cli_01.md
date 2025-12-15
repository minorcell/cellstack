---
date: 2025-12-11
title: 手搓 ReAct Agent：从试水到能跑起来
description: 分享手写 ReAct Agent 的完整实现过程，从 MVP 到分层架构，涵盖协议设计、状态机、工具调用、日志系统等核心要点，以及踩坑经验和未来规划。
author: mcell
tags:
  - AI 工程
  - ReAct
  - Agent
  - CLI
  - 架构设计
  - 状态机
  - 协议设计
  - 工具调用
  - 分层架构
  - 工程实践
keywords:
  - ReAct Agent
  - 智能代理
  - 工具调用
  - JSON 协议
  - 状态机设计
  - Core/Tools/UI 分层
  - CLI 开发
  - AI 工程化
  - 提示工程
  - LLM 应用
  - 自主代理
  - 软件架构
  - 协议解析
  - 日志系统
  - 开发者工具
---

最近两周，下班和周末都泡在一个"小而全"的目标里：自己手搓一个 ReAct agent。理由很简单：不想一开始就被框架带着走，底层协议、状态机、日志、工具调用这些关键点必须亲手过一遍，踩过坑才算真正"会用"。最早的 MVP 是 XML 协议 + 粗暴循环，能跑但非常脆；后来参考了 gemini CLI 的分层设计，终于把它拉成了一套能跑、还能稍微承载复杂任务的架构。

## 为什么必须自己造一次轮子

框架再好也是黑箱，一旦模型输出怪异或工具报错，调试就靠运气。我想掌控协议、状态机、日志和守卫。
ReAct 的核心 loop 其实不复杂：构造 prompt → 模型输出 action/final → 执行工具 → 喂 observation → 直到 final。把这套状态机自己写完，再换协议、换模型、加安全阀都更从容。
参考 gemini CLI 的四层架构（CLI/Core/Tools/External）后，彻底确认“UI 只是薄壳”这件事——CLI、VSCode 插件、桌面、Web 都可以共用一份 Core，复用性和调试体验会好很多。

## 这次的分层设计

我把 gemini CLI 的思路收敛成三层，薄厚分明：

- **UI（packages/ui）**：极简 TUI，readline REPL，--once 单轮退出。只负责交互和事件渲染，不做业务决策。
- **Core（packages/core）**：Session/Turn 状态机 + JSON 协议解析 + token 计数 + 日志落盘 + 默认依赖装配。UI 不需要知道工具实现细节。
- **Tools（packages/tools）**：内置工具集合与契约定义，统一 schema + execute，方便后续增/删工具而不动 Core。

## 现在已经"能跑"的部分

- **严格的 JSON 协议**：模型只能给出 `{"thought": "...","action": {...}}` 或 `{"final": "..."}`，少了就当异常处理；未知工具会提示"未知工具: name"，再喂回去让模型自纠。
- **可复用的 Session/Turn API**：`createAgentSession` 暴露 `runTurn`，UI 决定跑几轮，既能 REPL 也能 `--once`。
- **工具集**：`bash`/`read`/`write`/`edit`/`glob`/`grep`/`webfetch`（HTML 自动转纯文本）、`save_memory`、`todo` 等，遵守 ReAct 协议写 observation。
- **日志与可观察性**：事件粒度到 `session_start`/`turn_start`/`assistant`/`action`/`observation`/`final`/`turn_end`，全部 JSONL，默认落到 `~/.memo/sessions/<cwd>/...jsonl`，方便回放和调试。
- **token 管理**：本地 `tiktoken` 预估 + LLM usage 对账，超限可预警/拒绝；目前主要用 DeepSeek（OpenAI 兼容），命中缓存时成本体感友好。
- **配置体验**：第一次跑会交互式写 `~/.memo/config.toml`，如果环境变量已有 key 会自动写入；支持多 provider/模型切换。

## 快速体验：

```bash
bun start "帮我对比市面上的 agent 产品，给改进建议" --once
```

> 没配 provider 会引导写 `~/.memo/config.toml`

能看到 LLM 分步输出、工具调用日志、最终回答和 token 用量。

## 架构与实现的关键节点

- **状态机守卫**：`max_steps` 默认 100，防止模型卡死；工具异常会原样写 observation，让模型尝试自纠。
- **提示词策略**：系统 prompt 写成 JSON 协议的"合同"，尽量消除模型幻觉；实际测试中，强约束 JSON 比 XML 或多段输出更稳。
- **历史与落盘**：以工作目录分桶写 JSONL，切项目不会串日志；后面可以直接喂 JSONL 做回放或分析。
- **默认依赖装配**：Core 会自动补齐工具集、LLM client、tokenizer、prompt、history sink，UI 只传回调即可；配置来源是 `~/.memo/config.toml`，也支持覆盖。

## 过程中踩过的坑

- **协议易碎**：早期 XML/多段输出经常残缺，解析灾难。改成 JSON 后，解析和纠错路径都简单很多。
- **工具输出过长**：`webfetch` 必须截断纯文本，否则上下文炸掉；DeepSeek 缓存能减轻负担，但上下文管理还是刚需。
- **路径与安全**：目前工具还没有路径白名单/只读模式，理论上存在误删/误写风险，需要尽快补护栏。
- **交互反馈**：TUI 只做了最小日志输出，复杂任务时缺乏彩色、折叠、进度提示，调试体验一般。

## 还缺的能力（短板清单）

- **UI 仍是"素 TUI"**：没有彩色流式、折叠/展开，也没有多前端（桌面/Web/VSCode）。
- **权限与隔离**：缺路径白名单、只读模式、网络/超时限流。
- **上下文管理**：没有摘要/截断策略，现在基本靠 DeepSeek 的缓存顶着。
- **可观测性**：只有 JSONL 落盘，没有 stdout sink/远端日志，更没有 metrics/trace。
- **工具生态**：时间/env/size/hash 等常用工具未补齐，输入校验和错误提示还不统一。
- **插件化**：还没定义第三方工具的加载/隔离方式。

## 下一步

- **Core**：补全 hook/事件（`onTurnStart`/`onAction`/`onObservation`/`onFinal`），把上下文截断策略做成可插拔；token 预算超限要有清晰的策略回调。
- **Tools**：加安全护栏（路径白名单、只读模式、统一错误码），补齐通用工具（`time`/`env`/`size`/`hash`/`curl-ish`）。
- **可观测性**：给 history sink 增加 stdout/远端选项，后面接 metrics/trace。
- **UI**：基于 Ink 做一版流式彩色渲染，工具输出折叠，token 用量/步骤提示；再做一个最小 REST/WS demo 验证"纯 Core"。
- **测试与 CI**：继续用 `bun test` 覆盖解析、工具、session 流程，mock LLM；CI 安装 `rg` 等必需依赖。
- **长期**：考虑插件协议、VSCode 插件、桌面/Web 前端，以及 `save_memory` 向量化、长记忆管理。

## 心态吧

自己写一遍状态机+协议，最大的收获是"看到边界"——什么地方会炸、模型输出会怎么偏、工具怎么自纠。

gemini CLI 的分层设计给了很大启发：Core/Tools 先成型，再考虑 UI；UI 只是壳，真正要稳的是协议、日志和守卫。

即使现在的成品还很早期（UI 简陋、无权限、无上下文管理），但方向明确、循环跑通，后面就是"填坑"工程。

写到这里，这个小项目算是从"能跑"迈向"能用"的路上。接下来就是把安全性、可观测性和多前端体验一块块补齐，再找朋友一起"折腾"看看。
