# 第二章：Model I/O（模型输入输出）

> 参考 `langchain/01-课件` 与 `langchain/03-代码/LangChain-tutorial/chapter02-model IO`，以 [LangChain.js 官方文档](https://js.langchain.com) 最新 API 为准。

## 一、模型调用的分类

### 角度 1：按模型功能

- **非对话模型（LLMs）**：输入输出为字符串
- **对话模型（Chat Models）**：输入输出为消息（推荐）
- **嵌入模型（Embeddings）**：用于 RAG 等场景（第七章）

### 角度 2：参数配置方式

- 硬编码：参数写在代码中
- 环境变量：`.env` 中使用 `OPENAI_API_KEY`、`OLLAMA_BASE_URL` 等
- 配置文件：统一管理（推荐生产环境）

### 角度 3：API 调用

- LangChain 提供的 API（推荐）
- 厂商原生 API

## 二、对话模型调用

```javascript
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const model = new ChatOllama({ model: "qwen3-coder:480b-cloud" });

// 单条消息
const res = await model.invoke([new HumanMessage("你好")]);

// 多条消息（含系统角色）
const res2 = await model.invoke([
  new SystemMessage("你是编程助手，回答简短。"),
  new HumanMessage("什么是 REST API？"),
]);
```

## 三、提示词模板

### 3.1 PromptTemplate（简单模板）

```javascript
import { PromptTemplate } from "@langchain/core/prompts";

const prompt = PromptTemplate.fromTemplate(
  "你是一个数学高手，帮我解决：{question}"
);
const formatted = await prompt.format({ question: "1 + 2 * 3 = ?" });
```

### 3.2 ChatPromptTemplate（消息模板）

```javascript
import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "你是助手"],
  ["human", "{input}"],
]);
const messages = await prompt.formatMessages({ input: "你好" });
```

## 四、输出解析器

将模型输出的消息解析为所需类型。

| 解析器 | 用途 |
|--------|------|
| `StringOutputParser` | 转成字符串 |
| `JsonOutputParser` | 转成 JSON |
| `StructuredOutputParser` | 按 Zod schema 解析 |

```javascript
import { StringOutputParser } from "@langchain/core/output_parsers";

const parser = new StringOutputParser();
const chain = prompt.pipe(model).pipe(parser);
const result = await chain.invoke({ input: "你好" }); // 得到字符串
```

## 五、异步调用

```javascript
const results = await Promise.all([
  model.invoke("问题1"),
  model.invoke("问题2"),
]);
```

## 六、运行示例

```bash
node langchain-tutorial/chapter02-model-io/01-chat-model.js
node langchain-tutorial/chapter02-model-io/02-prompt-output-parser.js
```
