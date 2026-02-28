/**
 * 第二章 Model I/O - Message 类型与多轮对话
 * 对应课件：02-LangChain使用之Model IO.pdf §3.1 关于对话模型的 Message、§3.2 多轮对话与上下文记忆
 *
 * Message 类型：SystemMessage、HumanMessage、AIMessage
 * 多轮对话：将历史消息列表传入 invoke，模型基于完整对话历史生成回复
 */

import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "../../demo/ollama-config.js";

async function main() {
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0.5,
  });

  console.log("========== 1. 消息类型：System + Human ==========\n");
  const messages1 = [
    new SystemMessage("我是人工智能助手，我的名字叫小智"),
    new HumanMessage("猫王是一只猫吗？"),
  ];
  let res = await model.invoke(messages1);
  console.log("回复:", res.content);
  console.log("类型:", res.constructor?.name ?? "AIMessage");

  console.log("\n========== 2. 多轮对话：含 AI 历史 ==========\n");
  const messages2 = [
    new SystemMessage("我是人工智能助手，我的名字叫小智"),
    new HumanMessage("人工智能英文怎么说？"),
    new AIMessage("AI"),
    new HumanMessage("你叫什么名字？"),
  ];
  res = await model.invoke(messages2);
  console.log("回复（应能答出「小智」）:", res.content);
}

main().catch(console.error);
