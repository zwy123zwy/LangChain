/**
 * 第二章 Model I/O - ChatPromptTemplate 与结合 LLM
 * 对应课件：02-LangChain使用之Model IO.pdf §4.4 具体使用：ChatPromptTemplate
 *
 * fromMessages：元组 (role, content)、format_messages / invoke、结合 chat_model.invoke
 */

import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "../../demo/ollama-config.js";

async function main() {
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0.5,
  });

  console.log("========== 1. fromMessages 元组 (role, content) ==========\n");
  const chatTemplate = ChatPromptTemplate.fromMessages([
    ["system", "你是一个数学家，你可以计算任何算式"],
    ["human", "我的问题：{question}"],
  ]);
  const messages = await chatTemplate.formatMessages({
    question: "我今年18岁，舅舅38岁，我和舅舅一共多少岁？",
  });
  console.log("formatMessages 条数:", messages.length);

  console.log("\n========== 2. 结合 LLM 调用 ==========\n");
  const response = await model.invoke(messages);
  console.log("回复:", response.content);

  console.log("\n========== 3. 多角色 + 占位符 ==========\n");
  const template2 = ChatPromptTemplate.fromMessages([
    ["system", "你是{product}的客服助手，你的名字叫{name}"],
    ["human", "你好吗？"],
    ["ai", "我很好，谢谢！"],
    ["human", "{query}"],
  ]);
  const messages2 = await template2.formatMessages({
    product: "AGI课堂",
    name: "Bob",
    query: "你是谁？",
  });
  const res2 = await model.invoke(messages2);
  console.log("回复:", res2.content);
}

main().catch(console.error);
