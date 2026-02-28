/**
 * 第七章：RAG - 文档拆分（Text Splitters）
 * 对应课件：07-LangChain使用之Retrieval.pdf §3 Transform、§3.1 文档拆分
 *
 * 将 Document 按 chunkSize、chunkOverlap 切分，便于后续向量化与检索。
 * 需安装：npm install @langchain/textsplitters
 *
 * 运行：node langchain-tutorial/chapter07-rag/03-text-splitter.js
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Document } from "@langchain/core/documents";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const filePath = join(__dirname, "asset", "sample.txt");
  const content = readFileSync(filePath, "utf-8");
  const docs = [
    new Document({ pageContent: content, metadata: { source: filePath } }),
  ];

  let RecursiveCharacterTextSplitter;
  try {
    const { RecursiveCharacterTextSplitter: R } = await import(
      "@langchain/textsplitters"
    );
    RecursiveCharacterTextSplitter = R;
  } catch {
    console.log(
      "未安装 @langchain/textsplitters，运行: npm install @langchain/textsplitters"
    );
    console.log("使用简单按长度切分作为演示...\n");
  }

  if (RecursiveCharacterTextSplitter) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 80,
      chunkOverlap: 20,
    });
    const chunks = await splitter.splitDocuments(docs);
    console.log("========== RecursiveCharacterTextSplitter ==========\n");
    console.log("原始文档长度:", content.length, "字符");
    console.log("切分后块数:", chunks.length);
    chunks.forEach((c, i) => {
      console.log(`\n--- chunk ${i + 1} ---`);
      console.log(c.pageContent);
      console.log("metadata:", c.metadata);
    });
  } else {
    const chunkSize = 80;
    const overlap = 20;
    const text = docs[0].pageContent;
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      chunks.push(
        new Document({
          pageContent: text.slice(i, i + chunkSize),
          metadata: { ...docs[0].metadata, chunkIndex: chunks.length },
        })
      );
      if (i + chunkSize >= text.length) break;
    }
    console.log("========== 简单按长度切分 ==========\n");
    console.log("切分后块数:", chunks.length);
    chunks.forEach((c, i) => {
      console.log(`\n--- chunk ${i + 1} ---`);
      console.log(c.pageContent);
    });
  }
}

main().catch(console.error);
