/**
 * 第四章：Memory - ChatMessageHistory 风格存储
 * 对应课件：04-LangChain使用之Memory.pdf §2.2 ChatMessageHistory
 *
 * 使用消息列表充当“存储器”，addUserMessage / addAIMessage 追加，getMessages 供模型调用。
 * LangChain.js 中可用 @langchain/core 的 InMemoryChatMessageHistory，此处用简单数组模拟同一用法。
 */

import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "../../demo/ollama-config.js";

// 模拟 ChatMessageHistory：存消息列表，提供 addUserMessage、addAIChatMessage、getMessages
function createChatMessageHistory() {
  const messages = [];
  return {
    addUserMessage(content) {
      messages.push(new HumanMessage(content));
    },
    addAIChatMessage(content) {
      messages.push(new AIMessage(content));
    },
    getMessages: () => Promise.resolve([...messages]),
  };
}

async function main() {
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0.5,
  });

  const history = createChatMessageHistory();
  await history.addAIChatMessage("我是一个无所不能的小智");
  await history.addUserMessage("你好，我叫小明，请介绍一下你自己");
  await history.addUserMessage("我是谁呢？");

  console.log("========== ChatMessageHistory 风格：存储 + 传给 LLM ==========\n");
  const messages = await history.getMessages();
  const response = await model.invoke(messages);
  console.log("回复:", response.content);
}

main().catch(console.error);
