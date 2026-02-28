/**
 * Demo 08: Agent Skills + Tool Router（开发者首选，可定制）
 *
 * 核心依赖：Tools 组件、Tool Router 组件
 * ① 预设 Skill 描述：每个 SKILL.md 的 name/description 含关键词与适用场景
 * ② 配置 Tool Router：匹配策略（keyword / semantic）、匹配阈值（如 ≥85% 才加载）
 * ③ 输入处理与匹配：PromptTemplate 预处理需求 → Tool Router 解析/计算相似度 → 筛选最优 Skill
 * ④ 验证调整：若无匹配则自动降低阈值重试；可选结合 LangGraph 做更复杂的状态与重匹配
 *
 * 运行：node demo/08-agent-skills-routed.js [问题]
 * 环境变量：SKILL_ROUTER_STRATEGY=keyword|semantic，SKILL_ROUTER_THRESHOLD=0.85（默认 0.5）
 */

import "dotenv/config";
import path from "path";
import { PromptTemplate } from "@langchain/core/prompts";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";
import {
  loadSkillsFromDir,
  getFilesystemSkillsSystemPrompt,
  createReadSkillTool,
} from "../lib/agent-skills.js";
import { route } from "../lib/tool-router.js";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "./ollama-config.js";

const SKILLS_DIR = path.resolve(process.cwd(), "skills");
const BASE_SYSTEM = `你是一个多技能助手。当前仅加载了经 Tool Router 筛选后的技能，请按需调用 read_skill 获取操作指南再执行。`;

async function main() {
  const skillsMeta = await loadSkillsFromDir(SKILLS_DIR);
  if (!skillsMeta.length) {
    console.log("未在 skills/ 目录下找到任何 SKILL.md。");
    process.exit(1);
  }

  const userRaw = process.argv.slice(2).join(" ").trim() || "请用 code-review 审查： function add(a,b){ return a+b }";

  // ① 预设 Skill 描述已在 SKILL.md frontmatter（name、description）中
  // ② 配置 Tool Router
  const strategy = (process.env.SKILL_ROUTER_STRATEGY || "keyword").toLowerCase();
  const threshold = Math.min(1, Math.max(0, parseFloat(process.env.SKILL_ROUTER_THRESHOLD || "0.5")));
  const useSemantic = strategy === "semantic";

  // ③ 输入处理与匹配：PromptTemplate 预处理（此处仅做格式整理，可替换为 LLM 提取意图）
  const intentTemplate = PromptTemplate.fromTemplate("用户需求：{input}");
  const preprocessedInput = await intentTemplate.format({ input: userRaw });

  let embeddings;
  if (useSemantic) {
    try {
      const { OllamaEmbeddings } = await import("@langchain/ollama");
      embeddings = new OllamaEmbeddings({
        model: "nomic-embed-text",
        baseUrl: OLLAMA_BASE_URL,
      });
    } catch (e) {
      console.warn("语义匹配需要 @langchain/ollama 的 OllamaEmbeddings，已回退为 keyword。", e.message);
    }
  }

  let result = await route(skillsMeta, preprocessedInput, {
    strategy: embeddings ? "semantic" : "keyword",
    threshold,
    embeddings,
  });

  // ④ 验证调整：若无匹配则降低阈值重新匹配
  if (result.selected.length === 0 && threshold > 0.2) {
    const lowerThreshold = Math.max(0.2, threshold - 0.3);
    console.log(`未匹配到技能（阈值 ${threshold}），正在以阈值 ${lowerThreshold} 重新匹配…`);
    result = await route(skillsMeta, preprocessedInput, {
      strategy: embeddings ? "semantic" : "keyword",
      threshold: lowerThreshold,
      embeddings,
    });
  }

  const selected = result.selected.length ? result.selected : skillsMeta;
  const skillNames = selected.map((s) => s.name);
  console.log("Tool Router 策略:", result.strategy);
  console.log("匹配阈值:", threshold);
  console.log("选中技能:", skillNames.join(", ") || "(无，使用全部)");
  if (result.scores.size) {
    console.log("匹配度:", Object.fromEntries(result.scores));
  }
  console.log("---\n");

  const systemPrompt = BASE_SYSTEM + getFilesystemSkillsSystemPrompt(selected);
  const readSkillTool = createReadSkillTool(selected);
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

  console.log("问:", userRaw);
  const agentResult = await agent.invoke({
    messages: [new HumanMessage(userRaw)],
  });
  const last = agentResult.messages[agentResult.messages.length - 1];
  console.log("答:", last.content);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
