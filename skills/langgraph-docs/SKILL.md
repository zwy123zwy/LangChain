---
name: langgraph-docs
description: 回答与 LangGraph 相关的问题，提供文档与实现指引。当用户询问 LangGraph、状态图、多节点 Agent 时使用。
---

# LangGraph 文档技能

## 概述

本技能用于根据用户问题，提供与 LangGraph 相关的概念说明与实现指引。

## 执行步骤

1. **确认问题范围**：是概念（StateGraph、节点、边）还是实现（如何加条件边、多 Agent）。
2. **给出简明定义**：LangGraph 是用于多步、有状态 Agent 的图执行框架。
3. **按需说明**：节点即可调用单元、边为流转、条件边可根据状态分支。
4. **若涉及代码**：可给出 JS/TS 示例（如 StateGraph、addNode、addEdge）。

## 参考要点

- StateGraph：状态图，节点 + 边
- MessagesAnnotation：消息状态注解，常用于对话
- 条件边：根据返回值或状态决定下一节点
- 官方文档：https://js.langchain.com 与 LangGraph 文档

## 输出

用中文简洁回答，必要时附带短代码示例。
