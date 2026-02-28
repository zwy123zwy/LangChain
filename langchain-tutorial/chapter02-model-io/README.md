# 第二章：Model I/O（JS 版）

对应课件：**langchain/01-课件/02-LangChain使用之Model IO.pdf**

以下为课件章节与本地 JS 示例的对应关系，API 以 [LangChain.js 官方文档](https://js.langchain.com) 为准。

| 课件章节 | 内容概要 | 示例文件 |
|----------|----------|----------|
| §2 Model I/O 之调用模型 | 对话模型 ChatModel、环境变量 / .env | `01-chat-model.js`、`08-env-and-ollama.js` |
| §3.1 关于 Message | SystemMessage、HumanMessage、AIMessage | `03-messages-multiturn.js` |
| §3.2 多轮对话与上下文记忆 | 消息列表传入 invoke | `03-messages-multiturn.js` |
| §3.3 模型调用方法 | invoke、stream、batch | `04-invoke-stream-batch.js` |
| §4.3 PromptTemplate | 多变量、partial、invoke | `05-prompt-template-advanced.js` |
| §4.4 ChatPromptTemplate | fromMessages、format_messages、结合 LLM | `06-chat-prompt-template.js` |
| §5 Output Parsers | StrOutputParser、JsonOutputParser、CommaSeparatedListOutputParser | `07-output-parsers.js` |
| §6 调用本地模型 | Ollama、baseUrl | `08-env-and-ollama.js` |

## 运行方式

```bash
# 从项目根目录执行
npm run tutorial:02
# 或指定具体示例
node langchain-tutorial/chapter02-model-io/01-chat-model.js
node langchain-tutorial/chapter02-model-io/03-messages-multiturn.js
node langchain-tutorial/chapter02-model-io/04-invoke-stream-batch.js
node langchain-tutorial/chapter02-model-io/05-prompt-template-advanced.js
node langchain-tutorial/chapter02-model-io/06-chat-prompt-template.js
node langchain-tutorial/chapter02-model-io/07-output-parsers.js
node langchain-tutorial/chapter02-model-io/08-env-and-ollama.js
```

## 依赖与配置

- 使用本地 Ollama：需安装并运行 Ollama，模型名等见 `demo/ollama-config.js`。
- 使用 OpenAI 等：在 `.env` 中配置 `OPENAI_API_KEY`、`OPENAI_BASE_URL`，并将示例中的 `ChatOllama` 换为 `ChatOpenAI`。
