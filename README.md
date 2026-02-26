# LangChain.js 入门与实战

本项目包含 **LangChain.js 基础入门文档** 与 **可运行的实战 Demo**，便于快速上手 LangChain.js。

## 内容概览

- **文档**：[docs/LANGCHAIN_JS_入门.md](docs/LANGCHAIN_JS_入门.md)  
  介绍：简介、安装、核心概念（Models、Messages、Prompt、LCEL、Tools/Agent）、Demo 说明与延伸学习。

- **实战 Demo**：`demo/` 目录  
  - `01-basic-chat.js`：基础对话 + 提示模板 + LCEL 链  
  - `02-streaming.js`：流式输出  
  - `03-simple-tools.js`：工具（Tools）与模型调用示例  

  详细说明见 [demo/README.md](demo/README.md)。

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 本地安装并运行 Ollama，拉取模型
ollama pull qwen3-coder:480b-cloud

# 3. 运行任意 demo
npm run demo:chat
npm run demo:stream
npm run demo:tools
```

## 环境要求

- Node.js 18+
- 本地 [Ollama](https://ollama.com) 与模型 **qwen3-coder:480b-cloud**（无需 API Key）

## 参考

- [LangChain.js 官方文档](https://js.langchain.com)
