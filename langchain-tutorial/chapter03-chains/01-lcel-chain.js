/**
 * 第三章：Chains - LCEL 链式调用
 *
 * 参考 langchain/03-代码/LangChain-tutorial/chapter03-chains
 * API 以 js.langchain.com 为准
 *
 * 运行：node langchain-tutorial/chapter03-chains/01-lcel-chain.js
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

  const prompt = PromptTemplate.fromTemplate(
    "你是一个数学高手，帮我解决如下的数学问题：{question}"
  );
  const parser = new StringOutputParser();

  const chain = prompt.pipe(model).pipe(parser);

  console.log("========== 单链调用 ==========\n");
  const result = await chain.invoke({ question: "1 + 2 * 3 = ?" });
  console.log(result);
}

main().catch(console.error);
