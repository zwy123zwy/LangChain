# LangChain.js 实战 Demo

本目录包含三个由浅入深的 LangChain.js 示例，配合根目录下 `docs/LANGCHAIN_JS_入门.md` 文档学习。

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
