# 第三章：Chains（链）

> 参考 `langchain/01-课件` 与 `langchain/03-代码/LangChain-tutorial/chapter03-chains`，以 [LangChain.js 官方文档](https://js.langchain.com) 最新 API 为准。

## 一、LCEL 链式调用（推荐）

LangChain Expression Language（LCEL）用 `pipe()` 串联组件：

```
Prompt → Model → Parser
```

### 1.1 单链示例

```javascript
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOllama } from "@langchain/ollama";
import { StringOutputParser } from "@langchain/core/output_parsers";

const prompt = PromptTemplate.fromTemplate(
  "你是一个数学高手，帮我解决如下的数学问题：{question}"
);
const model = new ChatOllama({ model: "qwen3-coder:480b-cloud" });
const parser = new StringOutputParser();

const chain = prompt.pipe(model).pipe(parser);
const result = await chain.invoke({ question: "1 + 2 * 3 = ?" });
```

### 1.2 ChatPromptTemplate 链

```javascript
import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "你是技术助手"],
  ["human", "{question}"],
]);
const chain = prompt.pipe(model).pipe(parser);
```

## 二、多步顺序链

将多个链按顺序执行，前一步输出作为后一步输入。

```javascript
const chain1 = prompt1.pipe(model).pipe(parser);
const chain2 = prompt2.pipe(model).pipe(parser);

// 手动串联
const step1Result = await chain1.invoke({ question: "..." });
const step2Result = await chain2.invoke({ input: step1Result });
```

## 三、RunnableSequence

LCEL 的 `pipe` 等同于 `RunnableSequence`，支持更多组合方式。

```javascript
import { RunnableSequence } from "@langchain/core/runnables";

const chain = RunnableSequence.from([
  prompt,
  model,
  parser,
]);
```

## 四、传统 Chain 与 LCEL 对应关系

| Python 传统 API | LangChain.js 对应 |
|------------------|-------------------|
| LLMChain | `prompt.pipe(model)` |
| SimpleSequentialChain | 多步 `pipe` 或手动串联 |

**注意**：LangChain.js 推荐使用 LCEL，传统 `LLMChain` 已逐步被 `pipe` 替代。

## 五、运行示例（对应课件 03-LangChain使用之Chains.pdf）

| 课件章节 | 示例文件 |
|----------|----------|
| LCEL、分步 vs 管道 | `01-lcel-chain.js` |
| 多步顺序（概括→总结） | `02-sequential-chain.js` |
| SimpleSequentialChain（剧名→大纲→剧评） | `03-simple-sequential-chain.js` |
| SequentialChain（翻译→总结→语言→评论） | `04-sequential-chain.js` |
| 解释→简短总结（input 传参） | `05-simple-sequential-input-key.js` |

```bash
node langchain-tutorial/chapter03-chains/01-lcel-chain.js
node langchain-tutorial/chapter03-chains/02-sequential-chain.js
node langchain-tutorial/chapter03-chains/03-simple-sequential-chain.js
node langchain-tutorial/chapter03-chains/04-sequential-chain.js
node langchain-tutorial/chapter03-chains/05-simple-sequential-input-key.js
```

更多说明见 `langchain-tutorial/chapter03-chains/README.md`。
