# LangChain.js 基础入门

## 一、简介

**LangChain.js** 是一个用于构建由大语言模型（LLM）驱动的应用的开源框架。它使用 TypeScript 编写，支持：

- **Node.js**（18.x、19.x、20.x）
- **浏览器**
- **Next.js**、Cloudflare Workers 等环境

通过 LangChain，你可以用很少的代码连接 OpenAI、Anthropic、Google 等模型，并组合提示词、模型、工具、记忆等模块，快速搭建对话、RAG、Agent 等应用。

### 核心价值

| 能力 | 说明 |
|------|------|
| **统一模型接口** | 不同厂商 API 各异，LangChain 统一调用方式，便于切换模型、避免厂商锁定 |
| **可组合的链** | 用 LCEL（LangChain 表达式语言）把提示、模型、解析器像管道一样串联 |
| **Agent 与工具** | 内置 Agent 抽象，可让 LLM 调用“工具”（如查天气、查数据库），实现自主决策 |
| **可观测性** | 配合 LangSmith 可追踪请求、调试 Agent 行为、评估输出 |

---

## 二、安装

### 环境要求

- Node.js 18.x 及以上
- npm 或 yarn

### 安装核心包

```bash
npm install langchain @langchain/core
```

### 按需安装模型/集成包

使用**本地 Ollama**（本项目 Demo 默认）：

```bash
npm install @langchain/ollama
```

使用 OpenAI：

```bash
npm install @langchain/openai
```

使用 Anthropic：

```bash
npm install @langchain/anthropic
```

加载环境变量（推荐用 dotenv）：

```bash
npm install dotenv
```

使用本地 Ollama 时无需 API Key；若使用云端模型，在项目根目录创建 `.env` 文件（不要提交到 Git）并填入对应 Key。

---

## 三、核心概念

### 1. 模型（Models）

LangChain 将“与 LLM 对话”抽象成统一的接口，常用的是 **Chat Models**（聊天模型），输入/输出都是“消息”格式。

- **ChatOpenAI**：OpenAI GPT 系列
- **ChatAnthropic**：Anthropic Claude 系列
- **ChatOllama**：本地 Ollama（如 qwen3-coder、llama 等）
- **ChatGoogleGenerativeAI**：Google Gemini 等

示例（本地 Ollama）：

```javascript
const { ChatOllama } = require("@langchain/ollama");

const model = new ChatOllama({
  model: "qwen3-coder:480b-cloud",
  baseUrl: "http://localhost:11434",
  temperature: 0.7,
});

const res = await model.invoke("你好，请用一句话介绍你自己");
console.log(res.content);
```

### 2. 消息（Messages）

对话由多条“消息”组成，常见类型：

- **HumanMessage**：用户输入
- **AIMessage**：模型回复
- **SystemMessage**：系统提示（角色设定、规则等）

```javascript
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

await model.invoke([
  new SystemMessage("你是一个友好的编程助手，回答要简短。"),
  new HumanMessage("什么是 REST API？"),
]);
```

### 3. 提示模板（Prompt Templates）

把“带占位符的提示词”和“变量”分开，便于复用和维护。

```javascript
const { PromptTemplate } = require("@langchain/core/prompts");

const prompt = PromptTemplate.fromTemplate(
  "请用{tone}的语气，写一句关于{topic}的句子。"
);

const formatted = await prompt.format({ tone: "幽默", topic: "猫" });
// "请用幽默的语气，写一句关于猫的句子。"

const msg = await prompt.formatMessages({ tone: "正式", topic: "人工智能" });
// 可用于 invoke
```

### 4. 链（Chains）与 LCEL

**LCEL**（LangChain Expression Language）用 `.pipe()` 把多步串联成一条“链”，例如：**提示模板 → 模型 → 解析器**。

```javascript
const { PromptTemplate } = require("@langchain/core/prompts");
const { ChatOllama } = require("@langchain/ollama");
const { StringOutputParser } = require("@langchain/core/output_parsers");

const prompt = PromptTemplate.fromTemplate("用一句话介绍：{topic}");
const model = new ChatOllama({ model: "qwen3-coder:480b-cloud" });
const parser = new StringOutputParser();

const chain = prompt.pipe(model).pipe(parser);

const result = await chain.invoke({ topic: "量子计算" });
console.log(result); // 字符串
```

要点：

- `prompt.pipe(model)`：先填模板，再调模型
- `.pipe(parser)`：把模型输出解析成字符串（或 JSON 等）
- `chain.invoke({ topic: "..." })`：传入变量并执行整条链

### 5. 输出解析器（Output Parsers）

把模型输出的“消息”转成你需要的类型：

- **StringOutputParser**：转成字符串
- **JsonOutputParser**：转成 JSON
- **StructuredOutputParser**：按指定结构（如 Zod schema）解析

### 6. 工具（Tools）与 Agent

**Tool** 是给模型调用的“函数”（如查天气、查数据库）。**Agent** 会根据用户问题和可用工具，决定是否调用、调用哪个、如何组合结果再回答。

简单流程：**用户问题 → Agent → 选择 Tool → 执行 → 再交给模型 → 最终回答**。

---

## 四、实战 Demo 说明

本仓库在 `demo/` 目录下提供了三个由浅入深的示例：

| 文件 | 内容 |
|------|------|
| `01-basic-chat.js` | 基础对话 + 提示模板 + LCEL 链 |
| `02-streaming.js` | 流式输出（打字机效果） |
| `03-simple-tools.js` | 定义工具并交给模型调用（Agent 雏形） |
| `04-filesystem-agent/` | **文件系统 Agent**：对沙箱内文件/文件夹读、写、创建、删除 |
| `05-langgraph-simple.js` | **LangGraph**：StateGraph + MessagesAnnotation 单节点图 |

**怎么选？** 只对话用 01；要看流式用 02；学“模型+工具”用 03；要**操作本机文件**用 **04**；学 **LangGraph 图**用 **05**。详见 `demo/README.md`。

运行前请先：

1. 在项目根目录执行 `npm install`
2. 本地安装并运行 [Ollama](https://ollama.com)，拉取模型：`ollama pull qwen3-coder:480b-cloud`
3. 在项目根目录执行：`node demo/01-basic-chat.js`（或 02、03）

Demo 使用本地 **Ollama** 与模型 **qwen3-coder:480b-cloud**，无需 API Key。若需自定义 Ollama 地址，可在 `.env` 中设置 `OLLAMA_BASE_URL`。

---

## 五、LangGraph 相关 SDK

本项目已安装：

- **@langchain/langgraph**：在代码中构建图（StateGraph、Annotation、节点与边）、编译并执行。适合在应用内直接跑图。
- **@langchain/langgraph-sdk**：连接**已部署的 LangGraph 服务**（如 LangGraph Studio 或自建 LangGraph 服务）。通过 HTTP 与运行在例如 `http://localhost:2024` 的图服务通信，需配置该服务的地址与 API Key（若部署需要）。

使用 **LangGraph 框架**写图示例：运行 `npm run demo:langgraph`（见 `demo/05-langgraph-simple.js`）。  
使用 **LangGraph SDK** 连接远程图服务时，请参考官方文档配置 base URL 与认证。

## 六、七章教程

参考 `langchain/01-课件` 与 `langchain/03-代码/LangChain-tutorial`，已添加对应七章内容（API 以官网最新为准）：

| 章节 | 文档 | 示例代码 |
|------|------|----------|
| 01 概述 | [01-summary.md](chapters/01-summary.md) | `langchain-tutorial/chapter01-summary/` |
| 02 Model I/O | [02-model-io.md](chapters/02-model-io.md) | `langchain-tutorial/chapter02-model-io/` |
| 03 Chains | [03-chains.md](chapters/03-chains.md) | `langchain-tutorial/chapter03-chains/` |
| 04 Memory | [04-memory.md](chapters/04-memory.md) | `langchain-tutorial/chapter04-memory/` |
| 05 Tools | [05-tools.md](chapters/05-tools.md) | `langchain-tutorial/chapter05-tools/` |
| 06 Agents | [06-agents.md](chapters/06-agents.md) | `langchain-tutorial/chapter06-agents/` |
| 07 RAG | [07-rag.md](chapters/07-rag.md) | `langchain-tutorial/chapter07-rag/` |

运行示例：`node langchain-tutorial/chapter01-summary/01-hello-world.js`（详见 `langchain-tutorial/README.md`）

---

## 七、延伸学习

- 官方文档（JS）：[https://js.langchain.com](https://js.langchain.com)
- 教程：Chat 模型与提示模板、RAG、Agent、LangGraph 等
- LangSmith：配置 `LANGSMITH_TRACING=true` 与 API Key 可做链路追踪与评估

---

*文档随 LangChain.js 版本更新，如有差异以官方文档为准。*
