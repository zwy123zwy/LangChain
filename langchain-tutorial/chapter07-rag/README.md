# 第七章：RAG（检索增强生成）- JS 版

对应课件：**langchain/01-课件/07-LangChain使用之Retrieval.pdf**

## 课件与示例对应

| 课件章节 | 内容概要 | 示例文件 |
|----------|----------|----------|
| §1.4 Retrieval 流程 | Source → Load → Transform → Embed → Store → Retrieve | 见 doc |
| §2 文档加载器 | TextLoader、PyPDF、CSV、JSON 等 | `01-document-loader.js` |
| Document 对象 | page_content、metadata | `01-document-loader.js` |
| §3 文档拆分 | Text Splitters、chunkSize/chunkOverlap | `03-text-splitter.js` |
| §4 Embed、§5 Store、§6 Retrieve | 嵌入、向量存储、检索 + 生成 | `02-rag-chain.js`、`04-embed-vectorstore.js` |

## 运行

```bash
node langchain-tutorial/chapter07-rag/01-document-loader.js
node langchain-tutorial/chapter07-rag/02-rag-chain.js
node langchain-tutorial/chapter07-rag/03-text-splitter.js
node langchain-tutorial/chapter07-rag/04-embed-vectorstore.js
```

或：`npm run tutorial:07`

## 说明

- **01**：用 Node.js `fs` 加载文本为 `Document`，与课件 TextLoader 用法对应。
- **02**：完整 RAG 链（加载 → 可选拆分 → 嵌入 → 向量存储 → 检索 → 提示 + 模型生成）。需安装 `@langchain/community`、`@langchain/textsplitters` 等以使用 TextLoader/MemoryVectorStore/RecursiveCharacterTextSplitter。
