/**
 * 第五章：Tools - 多工具绑定与循环调用
 * 对应课件：05-LangChain使用之Tools.pdf 工具集、模型选择工具
 *
 * 绑定多个工具，模型可能返回多次 tool_calls，循环执行并回传直到模型不再调用工具。
 *
 * 运行：node langchain-tutorial/chapter05-tools/04-multi-tools.js
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
    schema: z.object({ city: z.string() }),
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

const tools = [getWeather, addNumber];
const toolsByName = Object.fromEntries(tools.map((t) => [t.name, t]));

async function main() {
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0,
  });

  const modelWithTools = model.bindTools(tools);

  const messages = [
    new SystemMessage(
      "你有 get_weather（查天气）和 add_number（两数相加）两个工具。请根据用户问题选择调用。"
    ),
    new HumanMessage("北京天气怎么样？再算一下 10 加 20 等于多少。"),
  ];

  console.log("========== 多工具绑定、循环执行 tool_calls ==========\n");

  let response = await modelWithTools.invoke(messages);
  const allMessages = [...messages, response];

  while (response.tool_calls && response.tool_calls.length > 0) {
    for (const tc of response.tool_calls) {
      const tool = toolsByName[tc.name];
      if (!tool) continue;
      const result = await tool.invoke(tc.args);
      allMessages.push(
        new ToolMessage({
          content: String(result),
          tool_call_id: tc.id,
        })
      );
    }
    response = await modelWithTools.invoke(allMessages);
    allMessages.push(response);
  }

  console.log("最终回答:", response.content);
}

main().catch(console.error);
