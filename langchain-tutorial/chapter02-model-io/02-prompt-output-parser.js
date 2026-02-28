/**
 * 第二章：Model I/O - 提示词模板 + 输出解析器
 *
 * 参考 langchain/03-代码/LangChain-tutorial/chapter02-model IO
 * API 以 js.langchain.com 为准
 *
 * 运行：node langchain-tutorial/chapter02-model-io/02-prompt-output-parser.js
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

  console.log("========== LCEL 链：Prompt → Model → Parser ==========\n");
  const result = await chain.invoke({
    question: "1 + 2 * 3 = ?",
  });
  console.log("解析后结果（字符串）:", result);
}

main().catch(console.error);
