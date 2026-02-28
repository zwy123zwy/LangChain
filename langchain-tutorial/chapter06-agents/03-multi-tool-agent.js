/**
 * 第六章：Agents - 多工具 ReAct Agent
 * 对应课件：06-LangChain使用之Agents.pdf 工具集、ReAct 多工具选择
 *
 * createReactAgent 绑定多个工具，由模型自主选择调用哪个、按何顺序调用。
 *
 * 运行：node langchain-tutorial/chapter06-agents/03-multi-tool-agent.js
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
    description: "根据城市名称查询该城市当前天气",
    schema: z.object({ city: z.string().describe("城市名称") }),
  }
);

const addNumber = tool(
  async ({ a, b }) => a + b,
  {
    name: "add_number",
    description: "计算两个整数的和",
    schema: z.object({
      a: z.number().describe("第一个数"),
      b: z.number().describe("第二个数"),
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
    tools: [getWeather, addNumber],
  });

  console.log("========== 多工具 ReAct Agent ==========\n");
  const result = await agent.invoke({
    messages: [
      new HumanMessage("北京和上海天气分别怎样？再帮我算 15 加 27。"),
    ],
  });

  const lastMessage = result.messages[result.messages.length - 1];
  console.log("最终回答:", lastMessage.content);
}

main().catch(console.error);
