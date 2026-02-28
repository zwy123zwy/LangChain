/**
 * 第二章 Model I/O - PromptTemplate 进阶：多变量、partial、invoke
 * 对应课件：02-LangChain使用之Model IO.pdf §4.3 具体使用：PromptTemplate
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
    temperature: 0.5,
  });
  const parser = new StringOutputParser();

  console.log("========== 1. 单变量 fromTemplate ==========\n");
  const t1 = PromptTemplate.fromTemplate("请简要描述{topic}的应用。");
  const prompt1 = await t1.format({ topic: "机器学习" });
  console.log("提示词:", prompt1);

  console.log("\n========== 2. 多变量 ==========\n");
  const t2 = PromptTemplate.fromTemplate(
    "请评价{product}的优缺点，包括{aspect1}和{aspect2}。"
  );
  const prompt2 = await t2.format({
    product: "智能手机",
    aspect1: "电池续航",
    aspect2: "拍照质量",
  });
  console.log("提示词:", prompt2);

  console.log("\n========== 3. partial（部分预填） ==========\n");
  const fullTemplate = "你是一个{role}，请用{style}风格回答：\n问题：{question}\n答案：";
  const partialTemplate = PromptTemplate.fromTemplate(fullTemplate).partial({
    role: "资深厨师",
    style: "专业但幽默",
  });
  const prompt3 = await partialTemplate.format({ question: "如何煎牛排？" });
  console.log("提示词:", prompt3);

  console.log("\n========== 4. invoke() 替代 format() ==========\n");
  const t4 = PromptTemplate.fromTemplate("用一句话介绍：{topic}");
  const promptValue = await t4.invoke({ topic: "量子计算" });
  const str = typeof promptValue?.toString === "function" ? promptValue.toString() : String(promptValue);
  console.log("invoke 得到 PromptValue，转字符串:", str.slice(0, 60) + "...");

  console.log("\n========== 5. 结合 LLM 链 ==========\n");
  const chain = t2.pipe(model).pipe(parser);
  const result = await chain.invoke({
    product: "电脑",
    aspect1: "性能",
    aspect2: "电池",
  });
  console.log("链调用结果（前 200 字）:", result.slice(0, 200) + "...");
}

main().catch(console.error);
