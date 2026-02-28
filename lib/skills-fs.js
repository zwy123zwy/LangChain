/**
 * 文件系统 Skill 加载（符合 Agent Skills 规范 agentskills.io/specification）
 *
 * 渐进式披露（Progressive disclosure）：
 * - 启动时仅解析每个 SKILL.md 的 YAML frontmatter（name、description）→ 省 Token
 * - 当 Agent 决定使用某技能时，再通过 read_skill 工具读取完整 SKILL.md 内容
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
const NAME_RE = /^name:\s*["']?([a-z0-9-]+)["']?\s*$/m;
const DESC_RE = /^description:\s*(?:"([^"]*)"|'([^']*)'|([^\n]+))/m;

/**
 * 从 SKILL.md 文本中解析 YAML frontmatter（仅 name、description）
 * @param {string} content
 * @returns {{ name?: string, description?: string, body?: string }}
 */
export function parseSkillFrontmatter(content) {
  const match = content.match(FRONTMATTER_RE);
  if (!match) return { body: content };
  const [, front, body] = match;
  const name = front.match(NAME_RE)?.[1]?.trim();
  const descMatch = front.match(DESC_RE);
  const description = (descMatch?.[1] ?? descMatch?.[2] ?? descMatch?.[3])?.trim();
  return {
    name: name && name.length <= 64 ? name : undefined,
    description: description && description.length <= 1024 ? description : undefined,
    body: body?.trim(),
  };
}

/**
 * 从目录加载所有技能：仅读取 frontmatter（name、description），不读 body
 * 目录结构：skillsDir 下每个子目录为一项技能，包含 SKILL.md
 * @param {string} skillsDir - 绝对或相对路径
 * @returns {Promise<Array<{ name: string, description: string, dirPath: string }>>}
 */
export async function loadSkillsFromDir(skillsDir) {
  const resolved = path.isAbsolute(skillsDir)
    ? skillsDir
    : path.resolve(process.cwd(), skillsDir);
  let entries;
  try {
    entries = await fs.readdir(resolved, { withFileTypes: true });
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
  const skills = [];
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const skillPath = path.join(resolved, ent.name);
    const skillFile = path.join(skillPath, "SKILL.md");
    let raw;
    try {
      raw = await fs.readFile(skillFile, "utf-8");
    } catch (e) {
      if (e.code === "ENOENT") continue;
      throw e;
    }
    const { name, description } = parseSkillFrontmatter(raw);
    if (name && description) {
      skills.push({
        name,
        description: description.slice(0, 1024),
        dirPath: skillPath,
      });
    }
  }
  return skills;
}

/**
 * 读取技能完整内容（SKILL.md 全文），用于按需加载
 * @param {string} skillDirPath - 技能目录绝对路径
 * @returns {Promise<string>}
 */
export async function getSkillBody(skillDirPath) {
  const skillFile = path.join(skillDirPath, "SKILL.md");
  const content = await fs.readFile(skillFile, "utf-8");
  const { body } = parseSkillFrontmatter(content);
  return body ?? content;
}

/**
 * 根据技能名从已加载的 meta 列表中解析目录路径并返回 body
 * @param {Array<{ name: string, dirPath: string }>} skillsMeta
 * @param {string} skillName
 * @returns {Promise<string|null>}
 */
export async function getSkillBodyByName(skillsMeta, skillName) {
  const norm = String(skillName).trim().toLowerCase();
  const skill = skillsMeta.find((s) => s.name.toLowerCase() === norm);
  if (!skill) return null;
  return getSkillBody(skill.dirPath);
}
