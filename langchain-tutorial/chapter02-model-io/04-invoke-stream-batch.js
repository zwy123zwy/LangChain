/**
 * 第二章 Model I/O - 模型调用方法：invoke、stream、batch
 * 对应课件：02-LangChain使用之Model IO.pdf §3.3 关于模型调用的方法、§3.3.1 流式与非流式、§3.3.2 批量调用
 *
 * invoke：单条输入，等待完整推理后返回
 * stream：流式响应，逐块输出
 * batch：批量输入，返回数组
 */

import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "../../demo/ollama-config.js";

async function main() {
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0.5,
  });

  console.log("========== 1. invoke（非流式） ==========\n");
  const messages = [
    new SystemMessage("你是一位乐于助人的智能小助手"),
    new HumanMessage("请用一句话介绍什么是机器学习"),
  ];
  const response = await model.invoke(messages);
  console.log("回复:", response.content);

  console.log("\n========== 2. stream（流式） ==========\n");
  process.stdout.write("回复: ");
  const stream = await model.stream(messages);
  for await (const chunk of stream) {
    if (chunk.content) process.stdout.write(chunk.content);
  }
  process.stdout.write("\n");

  console.log("\n========== 3. batch（批量） ==========\n");
  const batchInputs = [
    [
      new SystemMessage("你是乐于助人的助手"),
      new HumanMessage("请用一句话介绍什么是机器学习"),
    ],
    [
      new SystemMessage("你是乐于助人的助手"),
      new HumanMessage("请用一句话介绍什么是 AIGC"),
    ],
  ];
  const batchResponses = await model.batch(batchInputs);
  batchResponses.forEach((r, i) => {
    console.log(`第 ${i + 1} 个回复:`, r.content?.slice(0, 80) + "...");
  });
}

main().catch(console.error);
