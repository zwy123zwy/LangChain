/**
 * 第六章：Agents - ReAct Agent（LangGraph 预构建）
 *
 * 使用 createReactAgent 构建带工具调用的 Agent
 * API 以 js.langchain.com 为准
 *
 * 运行：node langchain-tutorial/chapter06-agents/02-react-agent.js
 */

import "dotenv/config";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { HumanMessage } from "@langchain/core/messages";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "../../demo/ollama-config.js";

const getWeather = tool(
  async ({ city }) => {
    const mock = { 北京: "晴 25°C", 上海: "多云 22°C", 东京: "阴 20°C" };
    return mock[city] || `${city}：天气数据暂无`;
  },
  {
    name: "get_weather",
    description: "根据城市名称查询天气",
    schema: z.object({
      city: z.string().describe("城市名称"),
    }),
  }
);

async function main() {
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0,
  });

  const agent = createReactAgent({
    llm: model,
    tools: [getWeather],
  });

  console.log("========== ReAct Agent ==========\n");
  const result = await agent.invoke({
    messages: [new HumanMessage("北京和上海今天天气怎么样？")],
  });

  const lastMessage = result.messages[result.messages.length - 1];
  console.log("最终回答:", lastMessage.content);
}

main().catch(console.error);
