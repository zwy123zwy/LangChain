/**
 * Demo 05: LangGraph 简单图
 *
 * 使用 @langchain/langgraph 的 StateGraph + MessagesAnnotation 构建一个「用户消息 → 模型回复」的图并执行。
 *
 * 运行：node demo/05-langgraph-simple.js  或  npm run demo:langgraph
 * 前置：Ollama 已运行并拉取模型 qwen3-coder:480b-cloud
 */

import "dotenv/config";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "./ollama-config.js";

const model = new ChatOllama({
  model: OLLAMA_MODEL,
  baseUrl: OLLAMA_BASE_URL,
  temperature: 0.5,
});

async function agentNode(state) {
  const response = await model.invoke(state.messages);
  return { messages: [response] };
}

const graph = new StateGraph(MessagesAnnotation)
  .addNode("agent", agentNode)
  .addEdge("__start__", "agent")
  .addEdge("agent", "__end__");

const runnable = graph.compile();

async function main() {
  const input = {
    messages: [new HumanMessage("用一句话介绍 LangGraph。")],
  };
  console.log("输入:", input.messages[0].content);
  console.log("\n执行图...\n");

  const result = await runnable.invoke(input);

  console.log("输出 messages 数量:", result.messages?.length ?? 0);
  const last = result.messages?.[result.messages.length - 1];
  if (last?.content) {
    console.log("模型回复:", last.content);
  } else {
    console.log("结果:", result);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
