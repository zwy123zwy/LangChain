/**
 * Demo 01: 基础对话 + 提示模板 + LCEL 链
 *
 * 演示内容：
 * - 使用本地 Ollama（qwen3-coder:480b-cloud）进行简单对话
 * - 使用 PromptTemplate 格式化提示词
 * - 使用 LCEL 的 pipe 组合：prompt -> model -> parser
 *
 * 运行：在项目根目录执行
 *   node demo/01-basic-chat.js
 * 或：npm run demo:chat
 *
 * 前置：本地已运行 Ollama，并已拉取模型 qwen3-coder:480b-cloud
 */

import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "./ollama-config.js";

// 
async function main() {
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0.7,
  });

  console.log("========== 1. 简单单轮对话 ==========\n");
  const simpleRes = await model.invoke("用一句话说明什么是 LangChain。");
  console.log("模型回复:", simpleRes.content);
  console.log();

  console.log("========== 2. 带系统角色的对话 ==========\n");
  const withSystem = await model.invoke([
    new SystemMessage("你是一个简洁的技术文档助手，回答控制在两句话内。"),
    new HumanMessage("REST 和 GraphQL 的主要区别是什么？"),
  ]);
  console.log("模型回复:", withSystem.content);
  console.log();

  console.log("========== 3. 提示模板 + LCEL 链 ==========\n");
  const prompt = PromptTemplate.fromTemplate(
    "请用{style}的风格，用一句话介绍：{topic}。"
  );
  const parser = new StringOutputParser();
  const chain = prompt.pipe(model).pipe(parser);

  const chainRes = await chain.invoke({
    style: "幽默",
    topic: "人工智能",
  });
  console.log("链式调用结果:", chainRes);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
