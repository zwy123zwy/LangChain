# 第六章：Agents（智能体）- JS 版

对应课件：**langchain/01-课件/06-LangChain使用之Agents.pdf**

## 课件与示例对应

| 课件章节 | 内容概要 | 示例文件 |
|----------|----------|----------|
| §1 Agent 与 Chain 区别 | 动态决策 vs 固定流程 | 见 doc |
| §2 Agent、AgentExecutor | create_react_agent + 执行器 | `02-react-agent.js` |
| §3 单工具使用 | bindTools、执行工具、回传结果 | `01-single-tool.js` |
| ReAct 模式 | Reasoning + Acting，单工具 | `02-react-agent.js` |
| 多工具 Agent | 工具集、模型自主选择与顺序 | `03-multi-tool-agent.js` |

## 运行

```bash
node langchain-tutorial/chapter06-agents/01-single-tool.js
node langchain-tutorial/chapter06-agents/02-react-agent.js
node langchain-tutorial/chapter06-agents/03-multi-tool-agent.js
```

或：`npm run tutorial:06`

## 说明

- **单工具**：`model.bindTools([tool])`，处理一次 `tool_calls` 后再调用模型得到最终回答。
- **多工具 ReAct**：使用 LangGraph 的 `createReactAgent`，由模型自主选择工具与调用顺序，等价于课件的 AgentExecutor + create_react_agent。
