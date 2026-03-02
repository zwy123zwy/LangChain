/**
 * Agent 组成部分 1/3：模型（LLM）
 * 负责与 Ollama 对话，作为 Agent 的“大脑”，决定何时调用工具、如何组织回复。
 */
import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3-coder:480b-cloud";
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

export const model = new ChatOllama({
  model: OLLAMA_MODEL,
  baseUrl: OLLAMA_BASE_URL,
  temperature: 0,
});
