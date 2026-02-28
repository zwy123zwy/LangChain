# 第一章：LangChain 使用概述

> 参考 `langchain/01-课件` 与 `langchain/03-代码/LangChain-tutorial/chapter01-summary`，以 [LangChain.js 官方文档](https://js.langchain.com) 最新 API 为准。

## 一、获取大模型

LangChain.js 将大模型抽象成统一接口，支持 OpenAI、Anthropic、Ollama（本地）等。

### 1.1 使用本地 Ollama（推荐入门）

```javascript
import { ChatOllama } from "@langchain/ollama";

const model = new ChatOllama({
  model: "qwen3-coder:480b-cloud",
  baseUrl: "http://localhost:11434",
  temperature: 0.7,
});

const response = await model.invoke("什么是大模型？");
console.log(response.content);
```

### 1.2 使用环境变量

```javascript
import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  // OPENAI_API_KEY 和 OPENAI_BASE_URL 从 .env 加载
});
```

## 二、使用提示词模板

将“带占位符的提示词”与“变量”分离，便于复用与维护。

```javascript
import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "你是世界级的技术文档编写者"],
  ["human", "{input}"],
]);

const formatted = await prompt.formatMessages({
  input: "大模型中的 LangChain 是什么?",
});
const response = await model.invoke(formatted);
```

## 三、核心要点

| 概念 | 说明 |
|------|------|
| **Chat Models** | 输入/输出为消息格式，推荐使用 |
| **Messages** | HumanMessage、AIMessage、SystemMessage |
| **PromptTemplate / ChatPromptTemplate** | 提示模板，支持占位符 |
| **LCEL** | `pipe()` 串联 prompt → model → parser |

## 四、运行示例

```bash
node langchain-tutorial/chapter01-summary/01-hello-world.js
```
