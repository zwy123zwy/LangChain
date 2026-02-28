# 大模型的流式输出

流式输出（Streaming）指大模型**边生成边返回**，而不是等整段回答完成后再一次性返回。用户能更快看到首字、打字机式体验，适合对话、长文生成等场景。

## 一、两种常用方式

### 1. 链的流式：`chain.stream()`

当使用 **LCEL 链**（如 `prompt.pipe(model).pipe(parser)`）时，对**整条链**调用 `.stream()`，得到的是**解析后的结果流**（例如字符串块）。适合「模板 + 模型 + 解析器」一条龙。

```javascript
import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatOllama({ model: "qwen3-coder:480b-cloud" });
const prompt = PromptTemplate.fromTemplate("用三句话介绍一下{topic}，每句简短。");
const parser = new StringOutputParser();
const chain = prompt.pipe(model).pipe(parser);

// 流式：逐块得到字符串
const stream = await chain.stream({ topic: "区块链" });
process.stdout.write("回复: ");
for await (const chunk of stream) {
  process.stdout.write(chunk);
}
process.stdout.write("\n");
```

- **优点**：写法简单，直接拿到最终类型（如字符串）的流。
- **适用**：单轮问答、固定模板 + 模型 + 解析器的流水线。

### 2. 模型的流式：`model.stream()`

直接对**聊天模型**调用 `.stream(messages)`，得到的是 **AIMessageChunk** 的异步迭代器，每块里通常带 `content` 字段（可能为空或部分文本）。

```javascript
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const model = new ChatOllama({ model: "qwen3-coder:480b-cloud" });
const messages = [
  new SystemMessage("你是一个简洁的助手。"),
  new HumanMessage("用两句话介绍什么是流式输出。"),
];

const stream = await model.stream(messages);
process.stdout.write("回复: ");
for await (const chunk of stream) {
  if (chunk.content) process.stdout.write(chunk.content);
}
process.stdout.write("\n");
```

- **优点**：不依赖链和解析器，适合多轮对话、自定义消息结构。
- **注意**：每块是 `AIMessageChunk`，需要从 `chunk.content` 取文本（可能多块才组成一个完整 token）。

## 二、对比小结

| 方式 | 调用 | 迭代得到 | 典型用法 |
|------|------|----------|----------|
| 链流式 | `chain.stream(input)` | 解析后结果（如字符串块） | 模板 + 模型 + 解析器 |
| 模型流式 | `model.stream(messages)` | `AIMessageChunk`（用 `chunk.content`） | 多轮对话、纯消息输入 |

## 三、运行本仓库 Demo

```bash
# 链流式（推荐先看这个）
npm run demo:stream
# 或
node demo/02-streaming.js
```

前置：本地已运行 Ollama，并已拉取模型（如 `ollama pull qwen3-coder:480b-cloud`）。

## 四、在 HTTP/API 里做流式

若要在 Web 接口中返回流式响应（如 SSE）：

- 用 `chain.stream()` 或 `model.stream()` 得到异步迭代器。
- 按所选协议（如 Server-Sent Events）按块写进响应体，每块可只发 `chunk` 或 `chunk.content`（并做编码/安全处理）。
- 具体实现依赖框架（Express、Fastify、Next.js 等），可参考各框架的流式响应文档。

## 五、参考

- 本仓库示例：`demo/02-streaming.js`
- LangChain.js 文档：[Chat streaming](https://js.langchain.com/docs/how_to/chat_streaming)
