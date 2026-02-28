/**
 * 第五章：Tools - 工具与模型配合
 *
 * 模型绑定工具后，可返回 tool_calls，应用执行后回传 ToolMessage
 *
 * 运行：node langchain-tutorial/chapter05-tools/02-tool-with-model.js
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
    const mock = { 北京: "晴 25°C", 上海: "多云 22°C", 东京: "阴 20°C" };
    return mock[city] || `${city}：天气数据暂无`;
  },
  {
    name: "get_weather",
    description: "根据城市名称查询该城市当前天气",
    schema: z.object({
      city: z.string().describe("城市名称，例如：北京、上海"),
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

  const messages = [
    new SystemMessage("若用户问天气，请调用 get_weather 工具获取后再回答。"),
    new HumanMessage("北京今天天气怎么样？"),
  ];

  console.log("========== 模型 + 工具调用 ==========\n");
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
  console.log("最终回答:", response.content);
}

main().catch(console.error);
