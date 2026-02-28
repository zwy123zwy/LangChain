/**
 * 第七章：RAG - 嵌入与向量存储
 * 对应课件：07-LangChain使用之Retrieval.pdf §4 Embed、§5 Store、§6 Retrieve
 *
 * 流程：Document → 拆分 → Embeddings → VectorStore → Retriever.invoke
 * 需安装：npm install @langchain/textsplitters @langchain/community
 * 并确保 Ollama 已拉取：ollama pull nomic-embed-text
 *
 * 运行：node langchain-tutorial/chapter07-rag/04-embed-vectorstore.js
 */

import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Document } from "@langchain/core/documents";
import { OllamaEmbeddings } from "@langchain/ollama";
import { OLLAMA_BASE_URL } from "../../demo/ollama-config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const filePath = join(__dirname, "asset", "sample.txt");
  const content = readFileSync(filePath, "utf-8");
  const docs = [
    new Document({ pageContent: content, metadata: { source: filePath } }),
  ];

  let splitDocs = docs;
  let RecursiveCharacterTextSplitter;
  try {
    const textSplitters = await import("@langchain/textsplitters");
    RecursiveCharacterTextSplitter =
      textSplitters.RecursiveCharacterTextSplitter;
  } catch {}
  if (RecursiveCharacterTextSplitter) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 150,
      chunkOverlap: 30,
    });
    splitDocs = await splitter.splitDocuments(docs);
  }

  let MemoryVectorStore;
  try {
    const community = await import("@langchain/community");
    MemoryVectorStore = community.MemoryVectorStore;
  } catch {}

  if (!MemoryVectorStore) {
    console.log(
      "未安装 @langchain/community，运行: npm install @langchain/community"
    );
    return;
  }

  const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: OLLAMA_BASE_URL,
  });

  console.log("========== Embed + VectorStore + Retrieve ==========\n");
  console.log("文档块数:", splitDocs.length);

  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  );

  const retriever = vectorStore.asRetriever({ k: 2 });
  const query = "LangChain 的核心概念有哪些？";
  const retrieved = await retriever.invoke(query);

  console.log("\n查询:", query);
  console.log("检索到", retrieved.length, "条：");
  retrieved.forEach((d, i) => {
    console.log(`\n[${i + 1}]`, d.pageContent.slice(0, 120) + "...");
  });
}

main().catch(console.error);
