/**
 * 第三章：Chains - SimpleSequentialChain 顺序链（单输入单输出）
 * 对应课件：03-LangChain使用之Chains.pdf §2.2 SimpleSequentialChain
 *
 * 多个链串联：每一步单一输入、单一输出，上一步输出作为下一步输入。
 * 课件示例：剧名 → 写大纲 → 根据大纲写剧评。
 * JS 中无 SimpleSequentialChain，用 LCEL 多步手动串联或 RunnableSequence 实现。
 */

import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "../../demo/ollama-config.js";

async function main() {
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0.6,
  });
  const parser = new StringOutputParser();

  // Chain A：给定剧名，写大纲
  const synopsisTemplate = `你是个剧作家。给定剧本的标题，你的工作就是为这个标题写一个大纲。
Title: {title}
`;
  const synopsisPrompt = PromptTemplate.fromTemplate(synopsisTemplate);
  const synopsisChain = synopsisPrompt.pipe(model).pipe(parser);

  // Chain B：给定大纲，写剧评
  const reviewTemplate = `你是《纽约时报》的剧评家。有了剧本的大纲，你的工作就是为剧本写一篇评论。
剧情大纲:
{synopsis}
`;
  const reviewPrompt = PromptTemplate.fromTemplate(reviewTemplate);
  const reviewChain = reviewPrompt.pipe(model).pipe(parser);

  console.log("========== SimpleSequentialChain：剧名 → 大纲 → 剧评 ==========\n");
  const title = "日落海滩上的悲剧";

  const synopsis = await synopsisChain.invoke({ title });
  console.log("--- 剧本大纲（前 300 字）---\n");
  console.log(synopsis.slice(0, 300) + "...\n");

  const review = await reviewChain.invoke({ synopsis });
  console.log("--- 剧评（前 400 字）---\n");
  console.log(review.slice(0, 400) + (review.length > 400 ? "..." : ""));
}

main().catch(console.error);
