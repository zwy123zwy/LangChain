/**
 * Demo 06: Agent Skills - 基于 LangChain 的多技能 Agent
 *
 * 演示如何加载多个 skills（calculator、search、code-review），
 * 合并工具并注入技能描述到 system prompt，Agent 根据用户问题选择调用。
 *
 * 运行：node demo/06-agent-skills.js [可选：技能名列表，如 calculator search]
 * 或：npm run demo:skills
 *
 * 前置：Ollama 已运行并拉取模型
 */

import "dotenv/config";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";
import {
  getToolsFromSkills,
  buildSystemPromptWithSkills,
} from "../lib/agent-skills.js";
import { getSkills } from "../lib/skills/index.js";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "./ollama-config.js";

const BASE_SYSTEM = `你是一个多技能助手。请根据用户问题选择合适的技能与工具作答。
若不需要任何工具，可直接用自然语言回答。`;

async function main() {
  const skillNames = process.argv.slice(2).length
    ? process.argv.slice(2)
    : ["calculator", "search", "code-review"];

  const skills = getSkills(skillNames);
  const tools = getToolsFromSkills(skills);
  const systemPrompt = buildSystemPromptWithSkills(skills, BASE_SYSTEM);

  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0.3,
  });

  const agent = createReactAgent({
    llm: model,
    tools,
    prompt: systemPrompt,
  });

  console.log("已启用技能:", skillNames.join(", "));
  console.log("工具数量:", tools.length);
  console.log("---\n");

  const queries = [
    "计算 (12 + 34) * 2 等于多少？",
    "用一句话介绍 LangChain 是什么。",
    "请对下面代码做简单审查： function add(a,b) { return a+b }",
  ];

  for (const q of queries) {
    console.log("问:", q);
    const result = await agent.invoke({
      messages: [new HumanMessage(q)],
    });
    const last = result.messages[result.messages.length - 1];
    console.log("答:", last.content);
    console.log();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
