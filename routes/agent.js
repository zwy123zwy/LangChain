/**
 * 后端 API：ReAct Agent（多工具）
 * POST /api/agent/react - body: { message }，使用 createReactAgent 绑定天气+计算器工具
 */

import { Router } from "express";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { HumanMessage } from "@langchain/core/messages";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "../demo/ollama-config.js";

const router = Router();

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

let agent = null;

function getAgent() {
  if (!agent) {
    const model = new ChatOllama({
      model: OLLAMA_MODEL,
      baseUrl: OLLAMA_BASE_URL,
      temperature: 0,
    });
    agent = createReactAgent({
      llm: model,
      tools: [getWeather, addNumber],
    });
  }
  return agent;
}

router.post("/react", async (req, res) => {
  const message = req.body?.message?.trim();
  if (!message) {
    return res.status(400).json({ error: "请提供 message 字段" });
  }
  try {
    const runner = getAgent();
    const result = await runner.invoke({
      messages: [new HumanMessage(message)],
    });
    const lastMessage = result.messages[result.messages.length - 1];
    const answer = lastMessage?.content?.toString?.() ?? String(lastMessage?.content ?? "");
    res.json({ answer });
  } catch (err) {
    console.error("[agent/react]", err);
    res.status(500).json({ error: err.message || "Agent 执行失败" });
  }
});

export default router;
