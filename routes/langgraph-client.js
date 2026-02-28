/**
 * LangGraph SDK 客户端单例
 * 用于连接已部署的 LangGraph 服务（如 LangGraph Studio 或自建图服务）
 */

import { Client } from "@langchain/langgraph-sdk";
import { config } from "../config.js";

let client = null;

export function getLangGraphClient() {
  if (!client) {
    client = new Client({
      apiUrl: config.langgraph.apiUrl,
      apiKey: config.langgraph.apiKey,
    });
  }
  return client;
}

export function getDefaultAssistantId() {
  return config.langgraph.defaultAssistantId;
}
