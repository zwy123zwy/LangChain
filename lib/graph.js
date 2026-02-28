/**
 * 共享 LangGraph 图（消息对话）
 * 供本机 LangGraph 服务 API 与 demo 使用
 */

import "dotenv/config";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "../demo/ollama-config.js";

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

export function getRunnable() {
  return runnable;
}

/** 将 API 格式的 messages 转为 LangChain 消息 */
export function apiMessagesToLc(apiMessages) {
  if (!Array.isArray(apiMessages)) return [];
  return apiMessages.map((m) => {
    const role = (m.role || m.type || "").toLowerCase();
    const content = m.content ?? m.text ?? "";
    if (role === "human" || role === "user") return new HumanMessage(content);
    if (role === "ai" || role === "assistant") return new AIMessage(content);
    return new HumanMessage(String(content));
  });
}

/** 将 LangChain 消息转为 API 可序列化格式 */
export function lcMessagesToApi(messages) {
  if (!messages || !Array.isArray(messages)) return [];
  return messages.map((m) => {
    const type = m._getType?.() ?? m.constructor?.name ?? "human";
    const role = type === "AIMessage" || type === "ai" ? "assistant" : "human";
    return { role, content: m.content ?? "", type: role === "assistant" ? "ai" : "human" };
  });
}
