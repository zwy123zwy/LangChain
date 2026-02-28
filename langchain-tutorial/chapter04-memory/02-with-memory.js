/**
 * 第四章：Memory - 带记忆的对话
 *
 * 手动维护 messages 列表，将历史对话传给模型
 *
 * 运行：node langchain-tutorial/chapter04-memory/02-with-memory.js
 */

import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "../../demo/ollama-config.js";

async function main() {
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0.5,
  });

  const messages = [
    new SystemMessage("你是人工智能的助手"),
    new HumanMessage("我叫张三，请记住我的名字。"),
  ];

  console.log("========== 带记忆：累积消息列表 ==========\n");

  let res = await model.invoke(messages);
  console.log("第1轮 模型回复:", res.content);
  messages.push(new AIMessage(res.content));
  messages.push(new HumanMessage("我叫什么？"));

  res = await model.invoke(messages);
  console.log("\n第2轮 模型回复（知道名字）:", res.content);
}

main().catch(console.error);
