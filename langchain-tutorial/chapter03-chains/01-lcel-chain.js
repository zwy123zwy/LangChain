/**
 * 第三章：Chains - LCEL 链式调用
 * 对应课件：03-LangChain使用之Chains.pdf §1 Chains 基本使用、§1.4 使用举例
 *
 * 1. 分步调用：prompt.invoke → model.invoke → parser.invoke
 * 2. LCEL 管道：chain = prompt | model | parser，统一 invoke
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
    temperature: 0.7,
  });

  const promptTemplate = PromptTemplate.fromTemplate(
    "给我讲一个关于{topic}话题的简短笑话"
  );
  const parser = new StringOutputParser();

  console.log("========== 情况1：分步调用（无 chain） ==========\n");
  const promptValue = await promptTemplate.invoke({ topic: "冰淇淋" });
  const modelResult = await model.invoke(promptValue);
  const outPut = await parser.invoke(modelResult);
  console.log(outPut);
  console.log("类型:", typeof outPut);

  console.log("\n========== 情况2：使用 LCEL 管道 ==========\n");
  const chain = promptTemplate.pipe(model).pipe(parser);
  const result = await chain.invoke({ topic: "ice cream" });
  console.log(result);
  console.log("类型:", typeof result);
}

main().catch(console.error);
