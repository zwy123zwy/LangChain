# 官方 LangGraph 后端服务

使用 **LangGraph CLI** 启动的官方支持的后端服务，提供本地 API 与 [LangGraph Studio](https://docs.langchain.com/langgraph-platform/local-server) 调试界面。

## 前置

- Node.js 20+
- 已安装并运行 [Ollama](https://ollama.com)，并拉取模型：`ollama pull qwen3-coder:480b-cloud`（或设置 `OLLAMA_MODEL`）
- **想在 LangSmith 里看到 runs（连载/追踪）**：在 `langgraph-server/.env` 中配置 `LANGSMITH_API_KEY`（见下方「LangSmith 与 Runs」）

## 安装与启动

```bash
cd langgraph-server
npm install
# 若没有 .env，复制一份（CLI 要求 .env 存在）
cp .env.example .env   # 或新建空 .env，可选填 OLLAMA_*、LANGSMITH_API_KEY
npx langgraph dev
```

或使用项目根目录的脚本（需先 `cd langgraph-server && npm install`）：

```bash
npm run langgraph:dev
```

启动成功后：

- **API**：http://localhost:2024  
- **API 文档**：http://localhost:2024/docs  
- **Studio**：在 [LangSmith Studio](https://smith.langchain.com/studio/) 中连接 `baseUrl=http://127.0.0.1:2024` 进行调试  

### 在 Studio 里用 Chat（为什么只能 Graph 不能 Chat）

Studio 有 **Graph（图表）** 和 **Chat（聊天）** 两个标签。若 Chat 用不了，多半是**还没选助理**：

1. 打开 [LangSmith Studio](https://smith.langchain.com/studio/)，连接 `baseUrl=http://127.0.0.1:2024`（或你本机启动的地址）。
2. 在 Studio 里点左下角 **「Settings」/「Manage Assistants」**（或顶部助理相关入口）。
3. 在助理列表中**选一个助理**：选 **`chat`** 或 **`agent`**（本仓库两个都指向同一图），并确认该助理处于 **Active/启用** 状态。
4. 再切到 **「Chat 聊天」** 标签，即可在输入框发消息、收到回复。

未选助理时，Chat 会不可用或灰掉；选好 `chat` 或 `agent` 后即可正常聊天。

### LangSmith 与 Runs（没看到 LangSmith 的连载？）

若提示 **"Not seeing LangSmith runs?" / "LangSmith API key is missing"**，说明本地未配置 API Key，LangSmith 无法上报本次运行的追踪。

**处理步骤：**

1. 打开 [LangSmith](https://smith.langchain.com) 并登录。
2. 进入 **Settings → API Keys**，点击 **Create API Key**，复制生成的 key（形如 `lsv2_pt_...`）。
3. 在 **`langgraph-server/.env`** 中新增或修改一行（不要用引号）：
   ```env
   LANGSMITH_API_KEY=lsv2_pt_你的密钥
   ```
4. 重启本地服务：先停止 `langgraph dev`，再重新执行 `npx langgraph dev`。

配置成功后，在 LangSmith 的 Projects / Traces 中即可看到每次调用的 runs（连载）。

### Failed to extract schema for "agent"

若启动或打开 Studio 时出现 **"Failed to extract schema for 'agent'"**，多半是 CLI 在解析图结构时**超时**（默认 30 秒）。加载模型/工具依赖或解析类型时会较慢，可能超过该时间。

**处理：** 在 `langgraph-server/.env` 中增加（单位毫秒，例如 2 分钟）：

```env
LANGGRAPH_SCHEMA_RESOLVE_TIMEOUT_MS=120000
```

保存后重启 `langgraph dev`。若仍报错或机器内存较小，可同时增大 Node 内存再启动，例如：

```bash
set NODE_OPTIONS=--max-old-space-size=4096
npx langgraph dev
```

## Agent 模式

当前图为 **ReAct Agent**（`createReactAgent`）：模型可自主选择调用工具，多轮 tool 调用后返回最终回答。

- **内置工具**：`get_weather`（按城市查天气）、`add_number`（两数相加）。
- **assistant_id** 可用 `agent` 或 `chat`，二者指向同一图。
- 多轮对话：请求里传入历史消息数组即可，例如 `[{ role: "human", content: "北京天气怎么样？" }, { role: "assistant", content: "..." }, { role: "human", content: "再算 10+20" }]`。

## 调用示例

**1. Chat 流式（推荐）**

```bash
curl -s -X POST "http://localhost:2024/runs/stream" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant_id": "chat",
    "input": {
      "messages": [{ "role": "human", "content": "你好，用一句话介绍你自己" }]
    },
    "stream_mode": "messages-tuple"
  }'
```

**2. Agent 非流式（会触发工具，如天气/加法）**

```bash
curl -s -X POST "http://localhost:2024/runs/wait" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant_id": "agent",
    "input": {
      "messages": [{ "role": "human", "content": "北京天气怎么样？再算一下 10 加 20 等于多少。" }]
    }
  }'
```

**3. JS SDK 流式 Chat**

```js
import { Client } from "@langchain/langgraph-sdk";

const client = new Client({ apiUrl: "http://localhost:2024" });

const stream = client.runs.stream(null, "chat", {
  input: { messages: [{ role: "user", content: "你好" }] },
  streamMode: "messages-tuple",
});

for await (const chunk of stream) {
  console.log(chunk.event, chunk.data);
}
```

**4. 多轮 Chat（带历史）**

```js
const history = [
  { role: "user", content: "我叫小明" },
  { role: "assistant", content: "你好小明！" },
  { role: "user", content: "我叫什么？" },
];
const out = await client.runs.wait(null, "chat", { input: { messages: history } });
```

## 与自建 Express 的区别

| 项目 | 说明 |
|------|------|
| **本目录（LangGraph CLI）** | 官方后端，`langgraph dev` 启动，带 Studio、标准 API、可部署到 LangGraph Platform |
| **根目录 server.js** | 自建 Express，自定义路由（如 `/api/langchain`、`/api/langgraph`），可同时代理或调用本服务 |

两者可并存：本地用 `langgraph dev` 跑图，Express 通过 `@langchain/langgraph-sdk` 请求 `http://localhost:2024`。
