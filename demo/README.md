# LangChain.js 实战 Demo

本目录包含多个 LangChain.js 示例，配合根目录下 `docs/LANGCHAIN_JS_入门.md` 文档学习。

## 前置条件

- Node.js 18+
- 已安装依赖：在项目根目录执行 `npm install`
- **本地已安装并运行 Ollama**，且已拉取模型：`ollama pull qwen3-coder:480b-cloud`

Demo 使用本地 Ollama，无需 API Key。若 Ollama 不在本机或端口非 11434，可在 `.env` 中设置 `OLLAMA_BASE_URL`。

## Demo 列表

| 文件 | 说明 | 命令 |
|------|------|------|
| `01-basic-chat.js` | 基础对话、系统角色、提示模板与 LCEL 链 | `npm run demo:chat` 或 `node demo/01-basic-chat.js` |
| `02-streaming.js` | 流式输出（逐 token 打印） | `npm run demo:stream` 或 `node demo/02-streaming.js` |
| `03-simple-tools.js` | 定义工具并让模型调用（Tool + 模拟 Agent 流程） | `npm run demo:tools` 或 `node demo/03-simple-tools.js` |
| `04-filesystem-agent/` | **文件系统 Agent**：对沙箱目录内文件/文件夹读、写、创建、删除 | `npm run demo:filesystem` 或 `node demo/04-filesystem-agent/agent.js [指令]` |
| `05-langgraph-simple.js` | **LangGraph**：StateGraph + MessagesAnnotation 单节点图 | `npm run demo:langgraph` 或 `node demo/05-langgraph-simple.js` |

## 怎么知道该用哪个 Demo / Agent？

按**你想做的事**来选：

| 你想… | 用哪个 | 命令 |
|--------|--------|------|
| 只和模型对话、看 LCEL 链怎么写 | **01 基础对话** | `npm run demo:chat` |
| 看模型一个字一个字输出（流式） | **02 流式输出** | `npm run demo:stream` |
| 看模型如何“调用工具”（如查天气） | **03 简单工具** | `npm run demo:tools` |
| 让模型帮你操作本机文件/文件夹（读、写、建、删） | **04 文件系统 Agent** | `npm run demo:filesystem` 或带一句指令 |
| 用 LangGraph 构建状态图（节点、边、消息状态） | **05 LangGraph** | `npm run demo:langgraph` |

- **01、02**：没有工具，只是“模型 + 提示/流式”，适合学基础。
- **03**：有工具（天气），模型会决定是否调工具，适合学「Agent = 模型 + 工具」。
- **04**：真正的**文件系统 Agent**，带 6 个文件/目录工具，用自然语言指挥它操作沙箱里的文件。
- **05**：**LangGraph** 示例，用 `StateGraph` + `MessagesAnnotation` 构建图并执行。

不确定时：想**动本机文件**就用 **04**，想**学 LangGraph 图**用 **05**，想**学链和工具**就从 **01 → 03** 按顺序跑一遍。

## 运行方式

在**项目根目录**（即包含 `package.json` 的目录）执行：

```bash
# 安装依赖（首次）
npm install

# 运行任意 demo
npm run demo:chat
# 或
node demo/01-basic-chat.js
```

确保本机已运行 Ollama 并拉取模型 `qwen3-coder:480b-cloud`，否则会报错。

## 文档

- 入门知识：`docs/LANGCHAIN_JS_入门.md`
- 官方文档：https://js.langchain.com
