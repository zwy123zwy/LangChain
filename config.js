/**
 * 后端服务配置
 * 支持 LangChain（本地 Ollama + 文件系统 Agent）与 LangGraph（连接远程 LangGraph API）
 */

const LANGGRAPH_API_URL = process.env.LANGGRAPH_API_URL || "http://localhost:8123";
const LANGGRAPH_API_KEY = process.env.LANGGRAPH_API_KEY || process.env.LANGSMITH_API_KEY || process.env.LANGCHAIN_API_KEY;
const LANGGRAPH_DEFAULT_ASSISTANT_ID = process.env.LANGGRAPH_DEFAULT_ASSISTANT_ID || "";

export const config = {
  port: Number(process.env.PORT) || 2024,
  langgraph: {
    apiUrl: LANGGRAPH_API_URL.replace(/\/$/, ""),
    apiKey: LANGGRAPH_API_KEY,
    defaultAssistantId: LANGGRAPH_DEFAULT_ASSISTANT_ID,
  },
};
