# LangChain.js 七章教程

参考 `langchain/01-课件` 与 `langchain/03-代码/LangChain-tutorial`，以 [LangChain.js 官网](https://js.langchain.com) 最新 API 为准。

## 结构

| 章节 | 目录 | 说明 |
|------|------|------|
| 01 | chapter01-summary | 概述、Hello World、ChatPromptTemplate |
| 02 | chapter02-model-io | 模型调用、提示词、输出解析器 |
| 03 | chapter03-chains | LCEL 链、顺序链 |
| 04 | chapter04-memory | 无记忆 vs 带记忆对话 |
| 05 | chapter05-tools | 自定义工具、tool() |
| 06 | chapter06-agents | 单工具、ReAct Agent |
| 07 | chapter07-rag | 文档加载、RAG 链 |

## 运行

在项目根目录执行：

```bash
npm install
```

确保 Ollama 已运行并拉取模型：

```bash
ollama pull qwen3-coder:480b-cloud
```

RAG 章节如需完整向量检索，可安装：

```bash
npm install @langchain/community @langchain/textsplitters
ollama pull nomic-embed-text
```

### 示例命令

```bash
node langchain-tutorial/chapter01-summary/01-hello-world.js
node langchain-tutorial/chapter02-model-io/01-chat-model.js
node langchain-tutorial/chapter02-model-io/02-prompt-output-parser.js
node langchain-tutorial/chapter03-chains/01-lcel-chain.js
node langchain-tutorial/chapter03-chains/02-sequential-chain.js
node langchain-tutorial/chapter04-memory/01-without-memory.js
node langchain-tutorial/chapter04-memory/02-with-memory.js
node langchain-tutorial/chapter05-tools/01-custom-tool.js
node langchain-tutorial/chapter05-tools/02-tool-with-model.js
node langchain-tutorial/chapter06-agents/01-single-tool.js
node langchain-tutorial/chapter06-agents/02-react-agent.js
node langchain-tutorial/chapter07-rag/01-document-loader.js
node langchain-tutorial/chapter07-rag/02-rag-chain.js
```

## 文档

对应文档位于 `docs/chapters/`：

- [01-summary.md](../docs/chapters/01-summary.md)
- [02-model-io.md](../docs/chapters/02-model-io.md)
- [03-chains.md](../docs/chapters/03-chains.md)
- [04-memory.md](../docs/chapters/04-memory.md)
- [05-tools.md](../docs/chapters/05-tools.md)
- [06-agents.md](../docs/chapters/06-agents.md)
- [07-rag.md](../docs/chapters/07-rag.md)
