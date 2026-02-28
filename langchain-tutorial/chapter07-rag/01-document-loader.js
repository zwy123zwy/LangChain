/**
 * 第七章：RAG - 文档加载（简化版）
 *
 * 使用 Node.js fs 加载文本，创建 Document 对象
 * 完整版需安装 @langchain/community（TextLoader）和 @langchain/textsplitters
 *
 * 运行：node langchain-tutorial/chapter07-rag/01-document-loader.js
 */

import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Document } from "@langchain/core/documents";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadTextAsDocuments(filePath) {
  const content = readFileSync(filePath, "utf-8");
  return [
    new Document({
      pageContent: content,
      metadata: { source: filePath },
    }),
  ];
}

async function main() {
  const filePath = join(__dirname, "asset", "sample.txt");
  const docs = loadTextAsDocuments(filePath);

  console.log("========== 文档加载 ==========\n");
  console.log("文档数量:", docs.length);
  console.log("内容预览:", docs[0].pageContent.slice(0, 100) + "...");
  console.log("元数据:", docs[0].metadata);
}

main().catch(console.error);
