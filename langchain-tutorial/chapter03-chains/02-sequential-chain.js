/**
 * 第三章：Chains - 多步顺序链
 *
 * 参考 langchain/03-代码/LangChain-tutorial/chapter03-chains
 * API 以 js.langchain.com 为准
 *
 * 运行：node langchain-tutorial/chapter03-chains/02-sequential-chain.js
 */

import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "../../demo/ollama-config.js";

async function main() {
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0,
  });
  const parser = new StringOutputParser();

  const prompt1 = PromptTemplate.fromTemplate(
    "用一句话概括：{topic}"
  );
  const prompt2 = PromptTemplate.fromTemplate(
    "把下面内容用三个要点总结：\n{input}"
  );

  const chain1 = prompt1.pipe(model).pipe(parser);
  const chain2 = prompt2.pipe(model).pipe(parser);

  console.log("========== 多步顺序链 ==========\n");
  const step1 = await chain1.invoke({ topic: "人工智能的发展历程" });
  console.log("步骤1 输出:", step1);

  const step2 = await chain2.invoke({ input: step1 });
  console.log("\n步骤2 输出:", step2);
}

main().catch(console.error);
