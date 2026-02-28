/**
 * Agent Skills - 基于 LangChain 的可插拔技能系统
 *
 * 支持两种模式：
 * 1) JS 定义：name、description、tools（LangChain Tool[]）
 * 2) 文件系统（Agent Skills 规范）：目录 + SKILL.md，渐进式披露（仅 frontmatter 入 prompt，按需 read_skill 加载正文）
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getSkillBodyByName } from "./skills-fs.js";

/**
 * @typedef {Object} SkillDef
 * @property {string} name - 技能唯一标识（小写、连字符）
 * @property {string} description - 简短描述，用于 agent 选择何时使用该技能
 * @property {import("@langchain/core/tools").StructuredToolInterface[]} tools - 该技能提供的工具列表
 */

/**
 * 合并多个 skills 的所有 tools，并去重（按 name）
 * @param {SkillDef[]} skills
 * @returns {import("@langchain/core/tools").StructuredToolInterface[]}
 */
export function getToolsFromSkills(skills) {
  const byName = new Map();
  for (const skill of skills) {
    for (const t of skill.tools || []) {
      if (t.name && !byName.has(t.name)) byName.set(t.name, t);
    }
  }
  return [...byName.values()];
}

/**
 * 生成用于 system prompt 的技能说明文本
 * @param {SkillDef[]} skills
 * @returns {string}
 */
export function getSkillsSystemPrompt(skills) {
  if (!skills?.length) return "";
  const lines = [
    "",
    "当前已启用的技能（Skills）：",
    ...skills.map(
      (s) =>
        `- **${s.name}**：${s.description}${(s.tools?.length && `（提供工具：${s.tools.map((t) => t.name).join(", ")}）`) || ""}`
    ),
    "请根据用户问题选择合适的技能与工具进行调用。",
  ];
  return lines.join("\n");
}

/**
 * 从技能列表构建 Agent 可用的 system 片段（可拼接到现有 system 中）
 * @param {SkillDef[]} skills
 * @param {string} [basePrompt] - 可选的基础 system 提示
 * @returns {string}
 */
export function buildSystemPromptWithSkills(skills, basePrompt = "") {
  const skillText = getSkillsSystemPrompt(skills);
  return basePrompt ? `${basePrompt}\n${skillText}` : skillText.trim();
}

// ---------------------------------------------------------------------------
// 文件系统 Skills（Agent Skills 规范 / 渐进式披露）
// ---------------------------------------------------------------------------

export {
  loadSkillsFromDir,
  getSkillBody,
  getSkillBodyByName,
  parseSkillFrontmatter,
} from "./skills-fs.js";

/**
 * 为「仅 frontmatter 已加载」的文件系统技能生成 system 片段
 * 提示 Agent 通过 read_skill 工具按需加载完整操作指南，实现省 Token、低认知负担
 * @param {Array<{ name: string, description: string }>} skillsMeta
 * @returns {string}
 */
export function getFilesystemSkillsSystemPrompt(skillsMeta) {
  if (!skillsMeta?.length) return "";
  const lines = [
    "",
    "当前可用的技能（Skills，符合 Agent Skills 规范）：",
    "仅列出名称与描述；需要执行某技能时，请先调用 read_skill 工具加载该技能的完整操作指南（SKILL.md），再按指南执行。",
    ...skillsMeta.map((s) => `- **${s.name}**：${s.description}`),
    "",
  ];
  return lines.join("\n");
}

/**
 * 创建 read_skill 工具：根据技能名返回 SKILL.md 正文，供 Agent 按需加载
 * @param {Array<{ name: string, dirPath: string }>} skillsMeta - 由 loadSkillsFromDir 返回
 * @returns {import("@langchain/core/tools").StructuredToolInterface}
 */
export function createReadSkillTool(skillsMeta) {
  return tool(
    async ({ skill_name }) => {
      const body = await getSkillBodyByName(skillsMeta, skill_name);
      if (body == null) {
        return `未找到名为「${skill_name}」的技能。可用技能：${skillsMeta.map((s) => s.name).join(", ")}。`;
      }
      return body;
    },
    {
      name: "read_skill",
      description:
        "按需加载指定技能的完整操作指南（SKILL.md 正文）。当决定使用某技能时先调用此工具获取详细步骤与说明，再按指南执行。参数为技能名称（如 code-review）。",
      schema: z.object({
        skill_name: z.string().describe("技能名称，与上述列表中的 name 一致"),
      }),
    }
  );
}
