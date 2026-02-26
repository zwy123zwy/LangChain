/**
 * Demo 02: 流式输出（Streaming）
 *
 * 演示内容：
 * - 使用 chain.stream() 对整条链进行流式输出（逐 token 打印）
 *
 * 运行：node demo/02-streaming.js  或  npm run demo:stream
 * 前置：本地已运行 Ollama，并已拉取模型 qwen3-coder:480b-cloud
 */

import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "./ollama-config.js";

async function main() {
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0.5,
  });

  console.log("========== 流式输出：逐 token 打印 ==========\n");

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
  process.stdout.write("\n\n完成。\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
