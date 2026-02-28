/**
 * 第四章：Memory - 无记忆的对话
 *
 * 每次 invoke 只看到当前消息，模型无法获知历史
 *
 * 运行：node langchain-tutorial/chapter04-memory/01-without-memory.js
 */

import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "../../demo/ollama-config.js";

async function main() {
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0.5,
  });

  console.log("========== 无记忆：每次独立调用 ==========\n");
  const res1 = await model.invoke([
    new HumanMessage("我叫张三，请记住我的名字。"),
  ]);
  console.log("第1轮 模型回复:", res1.content);
  console.log();

  // 第二次调用没有带上历史，模型不知道"张三"
  const res2 = await model.invoke([
    new HumanMessage("我叫什么？"),
  ]);
  console.log("第2轮 模型回复（无法知道名字）:", res2.content);
}

main().catch(console.error);
