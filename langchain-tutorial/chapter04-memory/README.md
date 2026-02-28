# 第四章：Memory（记忆）- JS 版

对应课件：**langchain/01-课件/04-LangChain使用之Memory.pdf**

## 课件与示例对应

| 课件章节 | 内容概要 | 示例文件 |
|----------|----------|----------|
| §1 为什么需要 Memory | 模型不记忆，需额外模块保存上下文 | `01-without-memory.js` |
| §1.4 不使用 Memory 时 | 用 messages 变量追加历史 | `02-with-memory.js` |
| §2.2 ChatMessageHistory | 存储与管理对话消息，对接 LLM | `03-chat-message-history.js` |
| §2.3 ConversationBufferMemory | 完整存储、save_context/load_memory_variables | 同 02，或使用 RunnableWithMessageHistory |

## 运行

```bash
node langchain-tutorial/chapter04-memory/01-without-memory.js
node langchain-tutorial/chapter04-memory/02-with-memory.js
node langchain-tutorial/chapter04-memory/03-chat-message-history.js
```

或：`npm run tutorial:04`（默认跑 02-with-memory.js）

## 说明

- **无记忆**：每次只传当前一条消息，模型无法获知历史。
- **有记忆**：将历史 HumanMessage/AIMessage 累积到列表中，每次调用时整段传入。
- **ChatMessageHistory**：LangChain.js 中可用 `@langchain/core` 的 `InMemoryChatMessageHistory`，本目录用简单对象模拟 `addUserMessage` / `addAIChatMessage` / `getMessages`，与课件用法一致。
