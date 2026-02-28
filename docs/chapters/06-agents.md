# 第六章：Agents（智能体）

> 参考 `langchain/01-课件` 与 `langchain/03-代码/LangChain-tutorial/chapter06-agents`，以 [LangChain.js 官方文档](https://js.langchain.com) 最新 API 为准。

## 一、Agent 概述

**Agent** 根据用户问题和可用**工具**，自主决定是否调用工具、调用哪一个、如何组合结果再回答。

流程：**用户问题 → Agent → 选择 Tool → 执行 → 再交给模型 → 最终回答**

## 二、单工具调用（bindTools）

模型绑定工具后，可返回 `tool_calls`，应用负责执行并回传结果。

```javascript
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";

const getWeather = tool(
  async ({ city }) => `北京: 晴 25°C`,
  {
    name: "get_weather",
    description: "根据城市查询天气",
    schema: z.object({ city: z.string() }),
  }
);

const modelWithTools = model.bindTools([getWeather]);
const messages = [
  new SystemMessage("若用户问天气，请调用 get_weather"),
  new HumanMessage("北京今天天气如何？"),
];

let response = await modelWithTools.invoke(messages);
const toolCalls = response.tool_calls || [];

if (toolCalls.length > 0) {
  const nextMessages = [...messages, response];
  for (const tc of toolCalls) {
    const result = await getWeather.invoke(tc.args);
    nextMessages.push(new ToolMessage({
      content: String(result),
      tool_call_id: tc.id,
    }));
  }
  response = await model.invoke(nextMessages);
}
console.log(response.content);
```

## 三、多工具与 ReAct

当有多个工具时，模型会自行选择调用哪个。**ReAct**（Reasoning + Acting）是常见模式：模型先“思考”，再“行动”（调用工具）。

### 3.1 使用 LangGraph 构建 Agent（推荐）

LangChain 官方推荐使用 **LangGraph** 或 **createAgent** 构建 Agent，替代已弃用的 `AgentExecutor`。

```javascript
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const searchTool = tool(
  async ({ query }) => "搜索结果...",
  { name: "search", description: "搜索", schema: z.object({ query: z.string() }) }
);

const agent = createReactAgent({
  llm: model,
  tools: [searchTool],
});
const result = await agent.invoke({ messages: [new HumanMessage("查询北京天气")] });
```

### 3.2 手动循环调用

若使用 `bindTools`，需在循环中处理多次 tool_calls，直到模型不再调用工具。

## 四、带记忆的 Agent

将历史消息加入 `messages`，Agent 即可拥有对话上下文：

```javascript
const messages = [
  new SystemMessage("你是助手"),
  ...previousMessages, // 历史
  new HumanMessage("继续上一个问题..."),
];
const response = await modelWithTools.invoke(messages);
```

## 五、与课件 06-LangChain使用之Agents.pdf 对应

| 课件章节 | 内容 | 示例文件 |
|----------|------|----------|
| §1 Agent 与 Chain 区别 | 动态决策 vs 固定流程 | 见上文概述 |
| §2 Agent、AgentExecutor | create_react_agent + 执行器 | `02-react-agent.js` |
| §3 单工具使用 | bindTools、执行、回传 | `01-single-tool.js` |
| ReAct / Function Call 模式 | 多工具选择、推理+行动 | `02-react-agent.js`、`03-multi-tool-agent.js` |

详见：`langchain-tutorial/chapter06-agents/README.md`。

## 六、运行示例

```bash
node langchain-tutorial/chapter06-agents/01-single-tool.js
node langchain-tutorial/chapter06-agents/02-react-agent.js
node langchain-tutorial/chapter06-agents/03-multi-tool-agent.js
```
