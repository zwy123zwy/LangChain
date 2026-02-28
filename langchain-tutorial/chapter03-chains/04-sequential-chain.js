/**
 * 第三章：Chains - SequentialChain 多步顺序链（多输入多输出）
 * 对应课件：03-LangChain使用之Chains.pdf §2.3 SequentialChain
 *
 * 多变量、显式 output_key：链1 输出作为链2 输入，可保留每步结果。
 * 课件示例：翻译 → 总结 → 识别语言 → 用该语言评论。
 * JS 中用多步 pipe 链 + 手动传递变量实现。
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
    temperature: 0.3,
  });
  const parser = new StringOutputParser();

  // Chain 1：翻译成中文
  const chain1Prompt = PromptTemplate.fromTemplate(
    "把下面内容翻译成中文:\n\n{content}"
  );
  const chain1 = chain1Prompt.pipe(model).pipe(parser);

  // Chain 2：一句话总结
  const chain2Prompt = PromptTemplate.fromTemplate(
    "用一句话总结下面内容:\n\n{Chinese_Review}"
  );
  const chain2 = chain2Prompt.pipe(model).pipe(parser);

  // Chain 3：识别语言
  const chain3Prompt = PromptTemplate.fromTemplate(
    "下面内容是什么语言:\n\n{Chinese_Summary}"
  );
  const chain3 = chain3Prompt.pipe(model).pipe(parser);

  // Chain 4：用指定语言评论
  const chain4Prompt = PromptTemplate.fromTemplate(
    "请使用指定的语言对以下内容进行评论:\n\n内容:{Chinese_Summary}\n\n语言:{Language}"
  );
  const chain4 = chain4Prompt.pipe(model).pipe(parser);

  const content = `Recently, we welcomed several new team members who have made significant contributions to their respective departments. I would like to recognize Jane Smith for her outstanding performance in customer service. Furthermore, please remember that the open enrollment period for our employee benefits program is fast approaching.`;

  console.log("========== SequentialChain：翻译 → 总结 → 识别语言 → 评论 ==========\n");

  const Chinese_Review = await chain1.invoke({ content });
  console.log("1. 翻译:", Chinese_Review.slice(0, 120) + "...\n");

  const Chinese_Summary = await chain2.invoke({ Chinese_Review });
  console.log("2. 总结:", Chinese_Summary, "\n");

  const Language = await chain3.invoke({ Chinese_Summary });
  console.log("3. 语言:", Language, "\n");

  const Comment = await chain4.invoke({
    Chinese_Summary,
    Language,
  });
  console.log("4. 评论:", Comment.slice(0, 200) + (Comment.length > 200 ? "..." : ""));
}

main().catch(console.error);
