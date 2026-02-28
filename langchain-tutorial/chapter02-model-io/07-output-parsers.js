/**
 * 第二章 Model I/O - 输出解析器：Str、Json、CommaSeparatedList
 * 对应课件：02-LangChain使用之Model IO.pdf §5 Model I/O之Output Parsers
 */

import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  StringOutputParser,
  JsonOutputParser,
  CommaSeparatedListOutputParser,
} from "@langchain/core/output_parsers";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "../../demo/ollama-config.js";

async function main() {
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0.3,
  });

  console.log("========== 1. StrOutputParser ==========\n");
  const strParser = new StringOutputParser();
  const prompt1 = PromptTemplate.fromTemplate("将以下英文翻译成中文：{text}");
  const chain1 = prompt1.pipe(model).pipe(strParser);
  const strResult = await chain1.invoke({ text: "It's a nice day today." });
  console.log("解析结果:", strResult);
  console.log("类型:", typeof strResult);

  console.log("\n========== 2. JsonOutputParser ==========\n");
  const jsonParser = new JsonOutputParser();
  const prompt2 = PromptTemplate.fromTemplate(
    "回答用户问题，严格只返回一个 JSON 对象，包含两个键：q（问题）、a（答案）。\n用户问题：{question}"
  );
  const chain2 = prompt2.pipe(model).pipe(jsonParser);
  const jsonResult = await chain2.invoke({
    question: "人工智能用英文怎么说？",
  }).catch(() => ({ q: "解析失败时返回默认", a: "AI" }));
  console.log("解析结果:", jsonResult);
  console.log("类型:", typeof jsonResult);

  console.log("\n========== 3. CommaSeparatedListOutputParser ==========\n");
  const listParser = new CommaSeparatedListOutputParser();
  const formatInstructions = listParser.getFormatInstructions();
  const prompt3 = PromptTemplate.fromTemplate(
    "生成 5 个与「{topic}」相关的词，用英文逗号分隔，不要编号。\n{format_instructions}"
  );
  const chain3 = prompt3.pipe(model).pipe(listParser);
  const listResult = await chain3
    .invoke({ topic: "电影", format_instructions: formatInstructions })
    .catch(() => []);
  console.log("解析结果:", listResult);
  console.log("类型:", Array.isArray(listResult) ? "array" : typeof listResult);
}

main().catch(console.error);
