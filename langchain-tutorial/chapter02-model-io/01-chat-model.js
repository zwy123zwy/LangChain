/**
 * 第二章：Model I/O - 对话模型调用
 *
 * 参考 langchain/03-代码/LangChain-tutorial/chapter02-model IO
 * API 以 js.langchain.com 为准
 *
 * 运行：node langchain-tutorial/chapter02-model-io/01-chat-model.js
 */

import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "../../demo/ollama-config.js";

async function main() {
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0.7,
  });

  console.log("========== 单条消息 ==========\n");
  const res1 = await model.invoke([new HumanMessage("你好")]);
  console.log(res1.content);
  console.log();

  console.log("========== 多条消息（含系统角色） ==========\n");
  const res2 = await model.invoke([
    new SystemMessage("你是编程助手，回答简短。"),
    new HumanMessage("什么是 REST API？"),
  ]);
  console.log(res2.content);
}

main().catch(console.error);
