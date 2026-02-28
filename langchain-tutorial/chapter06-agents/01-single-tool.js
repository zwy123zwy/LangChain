/**
 * 第六章：Agents - 单工具调用
 *
 * 即 demo/03-simple-tools.js 的 Agent 雏形
 *
 * 运行：node langchain-tutorial/chapter06-agents/01-single-tool.js
 */

import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "../../demo/ollama-config.js";

const getWeather = tool(
  async ({ city }) => {
    const mock = { 北京: "晴 25°C", 上海: "多云 22°C" };
    return mock[city] || `${city}：天气数据暂无`;
  },
  {
    name: "get_weather",
    description: "根据城市查询天气",
    schema: z.object({ city: z.string() }),
  }
);

async function main() {
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0,
  });

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
      nextMessages.push(
        new ToolMessage({
          content: String(result),
          tool_call_id: tc.id,
        })
      );
    }
    response = await model.invoke(nextMessages);
  }
  console.log(response.content);
}

main().catch(console.error);
