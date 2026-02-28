/**
 * 第三章：Chains - SimpleSequentialChain 风格：统一用 input 传参
 * 对应课件：03-LangChain使用之Chains.pdf §2.2.2 举例1
 *
 * 链A 详细解释某话题，链B 将解释内容简短总结；调用时用 input 传入问题。
 */

import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "../../demo/ollama-config.js";

async function main() {
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0.5,
  });
  const parser = new StringOutputParser();

  // 链A：详细解释
  const chainATemplate = ChatPromptTemplate.fromMessages([
    ["system", "你是一位精通各领域知识的知名教授"],
    ["human", "请你尽可能详细地解释一下：{input}"],
  ]);
  const chainA = chainATemplate.pipe(model).pipe(parser);

  // 链B：简短总结（输入为链A的输出）
  const chainBTemplate = ChatPromptTemplate.fromMessages([
    ["system", "你非常善于提取文本中的重要信息，并做出简短的总结"],
    ["human", "这是针对一个提问的完整解释说明内容：{input}"],
    ["human", "请你根据上述说明，尽可能简短地输出重要结论，请控制在 20 个字以内"],
  ]);
  const chainB = chainBTemplate.pipe(model).pipe(parser);

  console.log("========== SimpleSequentialChain 风格：input → 解释 → 总结 ==========\n");

  const inputQuestion = "什么是 LangChain？";
  const description = await chainA.invoke({ input: inputQuestion });
  console.log("链A 解释（前 200 字）:", description.slice(0, 200) + "...\n");

  const output = await chainB.invoke({ input: description });
  console.log("链B 结论（20 字内）:", output);
}

main().catch(console.error);
