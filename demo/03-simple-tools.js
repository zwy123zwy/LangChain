/**
 * Demo 03: 简单工具（Tools）示例
 *
 * 演示内容：
 * - 使用 @langchain/core/tools 定义工具（tool）
 * - 将工具绑定到模型，让模型决定是否调用工具
 * - 若有 tool_calls，执行工具并把结果交给模型生成最终回答
 *
 * 运行：node demo/03-simple-tools.js  或  npm run demo:tools
 * 前置：本地已运行 Ollama，并已拉取模型 qwen3-coder:480b-cloud
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
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "./ollama-config.js";

const getWeather = tool(
  async ({ city }) => {
    const mock = { 北京: "晴 25°C", 上海: "多云 22°C", 东京: "阴 20°C" };
    return mock[city] || `${city}：天气数据暂无`;
  },
  {
    name: "get_weather",
    description: "根据城市名称查询该城市当前天气，输入为城市名。",
    schema: z.object({
      city: z.string().describe("城市名称，例如：北京、上海、东京"),
    }),
  }
);

async function main() {
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0,
  });

  const modelWithTools = model.bindTools([getWeather]);

  console.log("========== 用户问需要查天气的问题 ==========\n");
  const messages = [
    new SystemMessage(
      "你是助手。若用户问天气，请调用 get_weather 工具获取后再回答。"
    ),
    new HumanMessage("北京今天天气怎么样？"),
  ];

  const response = await modelWithTools.invoke(messages);
  console.log(
    "模型回复 (可能包含 tool_calls):",
    JSON.stringify(response, null, 2)
  );

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
    const final = await model.invoke(nextMessages);
    console.log("\n最终回答:", final.content);
  } else {
    console.log("\n直接回答:", response.content);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
