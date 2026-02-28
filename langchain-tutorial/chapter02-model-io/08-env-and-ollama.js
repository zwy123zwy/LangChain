/**
 * 第二章 Model I/O - 环境变量配置与 Ollama 本地模型
 * 对应课件：02-LangChain使用之Model IO.pdf §2.3 参数位置、§2.3.5 使用 .env、§6 调用本地模型
 *
 * 推荐：使用 dotenv 加载 .env，避免密钥硬编码
 * 本地：ChatOllama + baseUrl（默认 http://localhost:11434）
 */

import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";

// 方式 1：使用项目内封装的配置（推荐）
const { OLLAMA_MODEL, OLLAMA_BASE_URL } = await import("../../demo/ollama-config.js");

async function main() {
  // 方式 2：若用 .env，可写 OLLAMA_BASE_URL=http://localhost:11434
  const baseUrl = process.env.OLLAMA_BASE_URL || OLLAMA_BASE_URL;
  const modelName = process.env.OLLAMA_MODEL || OLLAMA_MODEL;

  const model = new ChatOllama({
    model: modelName,
    baseUrl,
    temperature: 0.7,
    // maxTokens: 512,  // 可选：限制生成长度
  });

  console.log("使用模型:", modelName);
  console.log("Ollama 地址:", baseUrl);
  console.log("---\n");

  const res = await model.invoke([
    new HumanMessage("你好，请用一句话介绍你自己"),
  ]);
  console.log("回复:", res.content);
}

main().catch(console.error);
