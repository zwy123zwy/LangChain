# 第七章：RAG（检索增强生成）

> 参考 `langchain/01-课件` 与 `langchain/03-代码/LangChain-tutorial/chapter07-RAG`，以 [LangChain.js 官方文档](https://js.langchain.com) 最新 API 为准。

## 一、RAG 流程概述

1. **文档加载**：从 TXT、PDF、HTML 等加载为 `Document`
2. **文档拆分**：按 chunk_size、chunk_overlap 切分
3. **文档嵌入**：用 Embedding 模型转为向量
4. **向量存储**：存入向量库（Chroma、FAISS、Memory 等）
5. **检索**：根据用户问题检索相关文档
6. **生成**：将检索结果作为上下文，生成回答

## 二、文档加载器

不同格式使用不同加载器：

| 格式 | 加载器 | 包 |
|------|--------|-----|
| txt | TextLoader | @langchain/community |
| pdf | PyPDFLoader | @langchain/community |
| csv | CSVLoader | @langchain/community |
| json | JSONLoader | @langchain/community |
| html | CheerioWebBaseLoader | @langchain/community |
| 目录 | DirectoryLoader | @langchain/community |

```javascript
// 安装: npm install langchain 或 @langchain/community
import { TextLoader } from "langchain/document_loaders/fs/text";

const loader = new TextLoader("./asset/load/01-langchain-utf-8.txt", {
  encoding: "utf-8",
});
const docs = await loader.load();
console.log(docs[0].pageContent, docs[0].metadata);
```

**注意**：文档加载器位于 `langchain` 或 `@langchain/community`，以 [js.langchain.com](https://js.langchain.com) 为准。

## 三、文档拆分器

```javascript
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const documents = await splitter.splitDocuments(docs);
```

## 四、嵌入与向量存储

### 4.1 嵌入模型

```javascript
import { OllamaEmbeddings } from "@langchain/ollama";

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434",
});
```

### 4.2 向量存储（内存）

```javascript
// 安装: npm install @langchain/community
import { MemoryVectorStore } from "@langchain/community/vectorstores/memory";

const vectorStore = await MemoryVectorStore.fromDocuments(
  documents,
  embeddings
);
```

## 五、检索器与 RAG 链

```javascript
const retriever = vectorStore.asRetriever({ k: 3 });

const chain = RunnableSequence.from([
  {
    context: async (input) => {
      const docs = await retriever.invoke(input.question);
      return docs.map((d) => d.pageContent).join("\n\n");
    },
    question: (input) => input.question,
  },
  (input) =>
    prompt.format({
      context: input.context,
      question: input.question,
    }),
  model,
  new StringOutputParser(),
]);
```

## 六、综合案例：智能对话助手

结合 RAG + 工具（如搜索）+ 记忆，可构建“基于自有文档 + 联网搜索”的智能助手。详见 `langchain-tutorial/chapter07-rag/`。

## 七、与课件 07-LangChain使用之Retrieval.pdf 对应

| 课件章节 | 内容 | 示例文件 |
|----------|------|----------|
| §1.4 Retrieval 流程 | Source→Load→Transform→Embed→Store→Retrieve | 见 §一 RAG 流程概述 |
| §2 文档加载器 | TextLoader、PyPDF、CSV、JSON | `01-document-loader.js` |
| Document | page_content、metadata | `01-document-loader.js` |
| §3 文档拆分 | Text Splitters | `03-text-splitter.js`、`02-rag-chain.js` |
| §4 Embed、§5 Store、§6 Retrieve | 嵌入、向量存储、检索+生成 | `02-rag-chain.js`、`04-embed-vectorstore.js` |

详见：`langchain-tutorial/chapter07-rag/README.md`。

## 八、运行示例

```bash
node langchain-tutorial/chapter07-rag/01-document-loader.js
node langchain-tutorial/chapter07-rag/02-rag-chain.js
node langchain-tutorial/chapter07-rag/03-text-splitter.js
node langchain-tutorial/chapter07-rag/04-embed-vectorstore.js
```

**依赖**：需安装 `@langchain/community`、`@langchain/textsplitters` 等，以 [js.langchain.com](https://js.langchain.com) 为准。
