/**
 * Demo 07: Agent Skills（文件系统 / 官方范式）
 *
 * 符合 LangChain/Anthropic Agent Skills 规范与渐进式披露：
 * - 启动时仅加载各 SKILL.md 的 frontmatter（name、description）→ 省 Token
 * - 提供 read_skill 工具，Agent 按需加载完整操作指南后再执行
 *
 * 运行：node demo/07-agent-skills-fs.js
 * 前置：项目根目录下存在 skills/ 目录（如 skills/code-review/SKILL.md）
 */

import "dotenv/config";
import path from "path";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";
import {
  loadSkillsFromDir,
  getFilesystemSkillsSystemPrompt,
  createReadSkillTool,
} from "../lib/agent-skills.js";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "./ollama-config.js";

const SKILLS_DIR = path.resolve(process.cwd(), "skills");
const BASE_SYSTEM = `你是一个多技能助手。技能以「操作指南」形式存放在本地，仅名称与描述会先给你看。
需要执行某技能时，请先调用 read_skill 获取该技能的完整步骤与说明，再按指南执行。`;

async function main() {
  const skillsMeta = await loadSkillsFromDir(SKILLS_DIR);
  if (!skillsMeta.length) {
    console.log("未在 skills/ 目录下找到任何 SKILL.md，请先添加技能目录。");
    console.log("示例：skills/code-review/SKILL.md、skills/langgraph-docs/SKILL.md");
    process.exit(1);
  }

  const systemPrompt = BASE_SYSTEM + getFilesystemSkillsSystemPrompt(skillsMeta);
  const readSkillTool = createReadSkillTool(skillsMeta);
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0.3,
  });

  const agent = createReactAgent({
    llm: model,
    tools: [readSkillTool],
    prompt: systemPrompt,
  });

  console.log("已加载技能（仅 frontmatter）:", skillsMeta.map((s) => s.name).join(", "));
  console.log("工具: read_skill（按需加载 SKILL.md 正文）");
  console.log("---\n");

  const query =
    process.argv.slice(2).join(" ").trim() ||
    "请用 code-review 技能审查这段代码： function add(a,b) { return a+b }";

  console.log("问:", query);
  const result = await agent.invoke({
    messages: [new HumanMessage(query)],
  });
  const last = result.messages[result.messages.length - 1];
  console.log("答:", last.content);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
