/**
 * Demo 02: 大模型流式输出（Streaming）
 *
 * 演示两种方式：
 * 1) chain.stream()：整条链流式，得到解析后的字符串块（推荐）
 * 2) model.stream(messages)：直接对模型流式，得到 AIMessageChunk，从 chunk.content 取文本
 *
 * 运行：node demo/02-streaming.js  或  npm run demo:stream
 * 前置：本地已运行 Ollama，并已拉取模型 qwen3-coder:480b-cloud
 */

import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "./ollama-config.js";

const model = new ChatOllama({
  model: OLLAMA_MODEL,
  baseUrl: OLLAMA_BASE_URL,
  temperature: 0.5,
});

async function streamWithChain() {
  console.log("========== 1. 链流式 chain.stream() ==========\n");

  const prompt = PromptTemplate.fromTemplate(
    "用三句话介绍一下{topic}，每句简短。"
  );
  const parser = new StringOutputParser();
  const chain = prompt.pipe(model).pipe(parser);

  const stream = await chain.stream({ topic: "区块链" });
  process.stdout.write("回复: ");
  for await (const chunk of stream) {
    process.stdout.write(chunk);
  }
  process.stdout.write("\n");
}

async function streamWithModel() {
  console.log("\n========== 2. 模型流式 model.stream(messages) ==========\n");

  const messages = [
    new SystemMessage("你是一个简洁的助手。"),
    new HumanMessage("用两句话介绍什么是流式输出。"),
  ];

  const stream = await model.stream(messages);
  process.stdout.write("回复: ");
  for await (const chunk of stream) {
    if (chunk.content) process.stdout.write(chunk.content);
  }
  process.stdout.write("\n");
}

async function main() {
  await streamWithChain();
  await streamWithModel();
  console.log("\n完成。");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
