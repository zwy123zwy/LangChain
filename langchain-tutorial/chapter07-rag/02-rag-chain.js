/**
 * 第七章：RAG - 检索增强生成链（完整流程）
 *
 * 需安装：npm install @langchain/community @langchain/textsplitters
 * 并确保 Ollama 已拉取嵌入模型：ollama pull nomic-embed-text
 *
 * 若未安装上述依赖，可参考 docs/chapters/07-rag.md 的代码示例
 *
 * 运行：node langchain-tutorial/chapter07-rag/02-rag-chain.js
 */

import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Document } from "@langchain/core/documents";
import { ChatOllama } from "@langchain/ollama";
import { OllamaEmbeddings } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { OLLAMA_BASE_URL } from "../../demo/ollama-config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  let RecursiveCharacterTextSplitter;
  let MemoryVectorStore;

  try {
    const textSplitters = await import("@langchain/textsplitters");
    RecursiveCharacterTextSplitter =
      textSplitters.RecursiveCharacterTextSplitter;
  } catch {
    console.log(
      "未安装 @langchain/textsplitters，请运行: npm install @langchain/textsplitters"
    );
    console.log("使用简单分割作为替代...\n");
  }

  try {
    const community = await import("@langchain/community");
    MemoryVectorStore = community.MemoryVectorStore;
  } catch {
    console.log(
      "未安装 @langchain/community，请运行: npm install @langchain/community"
    );
    console.log("将使用简化版 RAG（无向量存储）...\n");
  }

  const filePath = join(__dirname, "asset", "sample.txt");
  const content = readFileSync(filePath, "utf-8");
  const docs = [
    new Document({ pageContent: content, metadata: { source: filePath } }),
  ];

  let splitDocs = docs;
  if (RecursiveCharacterTextSplitter) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 50,
    });
    splitDocs = await splitter.splitDocuments(docs);
    console.log("文档块数:", splitDocs.length);
  }

  const model = new ChatOllama({
    model: "qwen3-coder:480b-cloud",
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0,
  });

  if (MemoryVectorStore) {
    const embeddings = new OllamaEmbeddings({
      model: "nomic-embed-text",
      baseUrl: OLLAMA_BASE_URL,
    });
    const vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      embeddings
    );
    const retriever = vectorStore.asRetriever({ k: 2 });
    const retrieved = await retriever.invoke("LangChain 的核心概念有哪些？");
    const context = retrieved.map((d) => d.pageContent).join("\n\n");

    const prompt = PromptTemplate.fromTemplate(`基于以下上下文回答用户问题。若上下文中没有相关信息，可简要说明。

上下文：
{context}

问题：{question}

回答：`);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    const answer = await chain.invoke({
      context,
      question: "LangChain 的核心概念有哪些？",
    });
    console.log("RAG 回答:", answer);
  } else {
    const context = splitDocs.map((d) => d.pageContent).join("\n\n");
    const prompt = PromptTemplate.fromTemplate(`基于以下上下文回答：{question}

上下文：
{context}

回答：`);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    const answer = await chain.invoke({
      context,
      question: "LangChain 的核心概念有哪些？",
    });
    console.log("简化版 RAG 回答:", answer);
  }
}

main().catch(console.error);
