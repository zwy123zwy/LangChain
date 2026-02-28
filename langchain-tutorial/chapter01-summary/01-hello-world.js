/**
 * 第一章：LangChain 使用概述 - Hello World
 *
 * 参考 langchain/03-代码/LangChain-tutorial/chapter01-summary
 * API 以 js.langchain.com 为准
 *
 * 运行：node langchain-tutorial/chapter01-summary/01-hello-world.js
 * 前置：Ollama 已运行，ollama pull qwen3-coder:480b-cloud
 */

import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "../../demo/ollama-config.js";

async function main() {
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0.7,
  });

  console.log("========== 1. 直接调用大模型 ==========\n");
  const response = await model.invoke("什么是大模型？");
  console.log("模型回复:", response.content);
  console.log();

  console.log("========== 2. 使用 ChatPromptTemplate ==========\n");
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "你是世界级的技术文档编写者"],
    ["human", "{input}"],
  ]);
  const chain = prompt.pipe(model);
  const msg = await chain.invoke({
    input: "大模型中的 LangChain 是什么?",
  });
  console.log("模型回复:", msg.content);
}

main().catch(console.error);
