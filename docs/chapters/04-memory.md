# 第四章：Memory（记忆）

> 参考 `langchain/01-课件` 与 `langchain/03-代码/LangChain-tutorial/chapter04-memory`，以 [LangChain.js 官方文档](https://js.langchain.com) 最新 API 为准。

## 一、使用 Memory 之前

无记忆时，每次调用模型都是独立的，模型无法获知历史对话。

```javascript
// 每次 invoke 只看到当前这一条消息
const res1 = await model.invoke([new HumanMessage("我叫张三")]);
const res2 = await model.invoke([new HumanMessage("我叫什么？")]);
// 模型不知道你叫张三
```

## 二、使用 Memory 之后

需要将会话历史累积到 `messages` 中，再传给模型。

### 2.1 手动维护消息列表

```javascript
const messages = [
  new SystemMessage("你是助手"),
  new HumanMessage("我叫张三"),
  new AIMessage("你好张三！"),
  new HumanMessage("我叫什么？"),
];
const res = await model.invoke(messages);
messages.push(new AIMessage(res.content)); // 追加到历史
```

### 2.2 使用 ChatMessageHistory

```javascript
import { ChatMessageHistory } from "@langchain/core/chat_history";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const history = new ChatMessageHistory();
await history.addUserMessage("我叫张三");
await history.addAIChatMessage((await model.invoke(history.messages)).content);

await history.addUserMessage("我叫什么？");
const res = await model.invoke(await history.getMessages());
```

### 2.3 使用 RunnableWithMessageHistory

可将记忆集成到 LCEL 链中，适用于需要“带上下文”的对话链。

```javascript
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";

const chain = prompt.pipe(model).pipe(parser);
const withHistory = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory: async () => new InMemoryChatMessageHistory(),
  inputMessagesKey: "input",
  historyMessagesKey: "history",
});
```

## 三、记忆类型概览

| 类型 | 说明 |
|------|------|
| **ConversationBufferMemory** | 保存全部历史，简单直接 |
| **ConversationBufferWindowMemory** | 只保留最近 N 轮 |
| **ConversationSummaryMemory** | 用模型总结历史，节省 token |

在 LangChain.js 中，记忆通常通过 `ChatMessageHistory` 或消息列表实现。

## 四、与课件 04-LangChain使用之Memory.pdf 对应

| 课件章节 | 内容 | 示例文件 |
|----------|------|----------|
| §1 为什么需要 Memory | 模型不记忆，需额外模块 | `01-without-memory.js` |
| §1.4 不使用 Memory 时 | 用 messages 追加历史 | `02-with-memory.js` |
| §2.2 ChatMessageHistory | 存储消息、对接 LLM | `03-chat-message-history.js` |
| §2.3 ConversationBufferMemory | 完整历史、与链结合 | 同上或 RunnableWithMessageHistory |

详见：`langchain-tutorial/chapter04-memory/README.md`。

## 五、运行示例

```bash
node langchain-tutorial/chapter04-memory/01-without-memory.js
node langchain-tutorial/chapter04-memory/02-with-memory.js
node langchain-tutorial/chapter04-memory/03-chat-message-history.js
```
