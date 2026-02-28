# LangChain + LangGraph 后端服务

本项目为 **同时支持 LangChain �?LangGraph** 的后端服务：提供统一 API 与简单前端，既可调用本地 LangChain 文件系统 Agent，也可通过 `@langchain/langgraph-sdk` 连接已部署的 LangGraph 图服务�?

## 内容概览

- **后端服务**：`npm start` 启动，默认端�?**2024**。agent-ui 直接�?`http://localhost:2024` 即可�?
- **LangChain**：本�?Ollama + 文件系统 Agent，无需额外服务�?
- **LangGraph**：本后端会代理到 `LANGGRAPH_API_URL`（默�?`http://localhost:8123`），需在该端口�?LangGraph 服务�?
- **文档�?Demo**：[docs/LANGCHAIN_JS_入门.md](docs/LANGCHAIN_JS_入门.md)、[demo/README.md](demo/README.md)�?

## 快速开�?

```bash
# 1. 安装依赖
npm install

# 2. 本地 Ollama（LangChain 文件系统 Agent 需要）
ollama pull qwen3-coder:480b-cloud

# 3. 启动后端
npm start
# 浏览器打开 http://localhost:2024 ；agent-ui �?Deployment URL �?http://localhost:2024 即可
```

- 仅用 **LangChain 文件系统 Agent**：无需改配置，首页「LangChain �?文件系统 Agent」即可用�?
- 使用 **LangGraph**：在 `.env` 中设�?`LANGGRAPH_API_URL`（默�?`http://localhost:8123`，即 LangGraph 服务实际地址），按需设置 `LANGGRAPH_API_KEY` �?`LANGGRAPH_DEFAULT_ASSISTANT_ID`�?

## API 说明

### LangChain

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/langchain/filesystem-agent` | 请求�?`{ "message": "指令" }`，返�?`{ "answer": "..." }` |

### LangGraph（需远程图服务）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/langgraph/assistants` | 列出 Assistants |
| POST | `/api/langgraph/threads` | 创建 Thread，返�?`{ "threadId", "thread" }` |
| POST | `/api/langgraph/run` | 请求�?`{ "assistantId", "threadId?", "input" }`，等�?Run 结束，返�?`{ "threadId", "values" }` |
| POST | `/api/langgraph/chat` | 请求�?`{ "message", "assistantId?", "threadId?" }`，自动包�?messages 并返�?`{ "threadId", "answer", "values" }` |

未传 `assistantId` 时，使用环境变量 `LANGGRAPH_DEFAULT_ASSISTANT_ID`�?

## 环境变量

| 变量 | 说明 | 默认 |
|------|------|------|
| `PORT` | 本后端服务端�?| 2024 |
| `OLLAMA_BASE_URL` | Ollama 地址（LangChain 用） | http://localhost:11434 |
| `LANGGRAPH_API_URL` | LangGraph 服务地址（本后端代理目标�?| http://localhost:8123 |
| `LANGGRAPH_API_KEY` | LangGraph API Key（若需要） | 可选，也可�?LANGSMITH / LANGCHAIN API KEY |
| `LANGGRAPH_DEFAULT_ASSISTANT_ID` | 默认 Assistant ID�?chat 等） | �?|

## 环境要求

- Node.js 18+
- 使用 LangChain 文件系统 Agent：本�?[Ollama](https://ollama.com) 与模�?**qwen3-coder:480b-cloud**
- 使用 LangGraph 接口：在 **另一端口**（如 8123）跑 LangGraph 服务，并设置 `LANGGRAPH_API_URL=http://localhost:8123`�?

## 对接已有前端 agent-ui

agent-ui �?**Deployment URL 直接�?`http://localhost:2024`** 即可（本后端就在 2024 端口）�?

1. �?chain 目录 `npm start`，本后端监听 **2024**�?
2. LangGraph 服务跑在其它端口（如 8123），�?`.env` 里设 `LANGGRAPH_API_URL=http://localhost:8123`，本后端会代理过去�?
3. 启动 agent-ui，在页面�?**Deployment URL**：`http://localhost:2024`�?*Assistant / Graph ID** 填你的图 ID�?

## 参�?

- [LangChain.js](https://js.langchain.com)
- [LangGraph](https://langchain-ai.github.io/langgraphjs/)
