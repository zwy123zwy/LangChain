/**
 * Tool Router - 技能路由组件
 *
 * 根据用户输入与预设 Skill 描述，通过「关键词匹配」或「语义匹配」筛选并加载最优技能，
 * 支持可配置匹配策略与阈值（如匹配度 ≥ 85% 才加载）。
 *
 * 流程：输入 → PromptTemplate 预处理（可选）→ 匹配策略 → 按阈值筛选 → 返回选中技能列表
 */

import { PromptTemplate } from "@langchain/core/prompts";

/**
 * 从文本中提取简单关键词（中文按字符/短句切，英文按词）
 * @param {string} text
 * @returns {string[]}
 */
function extractKeywords(text) {
  if (!text || typeof text !== "string") return [];
  const t = text.replace(/\s+/g, " ").trim();
  const words = [];
  const cnMatch = t.match(/[\u4e00-\u9fa5]+/g);
  if (cnMatch) words.push(...cnMatch);
  const enMatch = t.match(/([a-zA-Z][a-z]*|[A-Z]{2,})/g);
  if (enMatch) words.push(...enMatch.map((w) => w.toLowerCase()));
  const numMatch = t.match(/\d+/g);
  if (numMatch) words.push(...numMatch);
  return [...new Set(words)].filter((w) => w.length > 0);
}

/**
 * 关键词匹配：计算用户输入与技能描述的重叠度（0~1）
 * @param {string} userInput
 * @param {{ name: string, description: string }} skill
 * @returns {number}
 */
function keywordScore(userInput, skill) {
  const userWords = extractKeywords(userInput);
  const skillText = `${skill.name} ${skill.description}`;
  const skillWords = extractKeywords(skillText);
  if (userWords.length === 0) return 0;
  const hit = userWords.filter((w) => skillWords.some((s) => s.includes(w) || w.includes(s))).length;
  return hit / userWords.length;
}

/**
 * 余弦相似度
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * 预处理用户输入（提取意图/关键词），便于路由匹配
 * @param {string} userInput
 * @param {PromptTemplate} [template] - 若传入则用 LLM 或 format 得到预处理文本；此处仅做占位，实际可用 LLM 再填
 * @returns {Promise<string>}
 */
export async function preprocessInput(userInput, template) {
  if (!template) return userInput;
  return template.format({ input: userInput });
}

/**
 * 关键词匹配策略：为每个技能计算 0~1 分数
 * @param {Array<{ name: string, description: string }>} skillsMeta
 * @param {string} userInput
 * @returns {Array<{ skill: { name: string, description: string }, score: number }>}
 */
export function matchByKeyword(skillsMeta, userInput) {
  const normalized = (userInput || "").trim();
  return skillsMeta.map((skill) => ({
    skill,
    score: keywordScore(normalized, skill),
  }));
}

/**
 * 语义匹配策略：使用嵌入模型计算相似度（需传入 embeddings 实例）
 * @param {Array<{ name: string, description: string }>} skillsMeta
 * @param {string} userInput
 * @param {import("@langchain/core/embeddings").Embeddings} embeddings
 * @returns {Promise<Array<{ skill: { name: string, description: string }, score: number }>>}
 */
export async function matchBySemantic(skillsMeta, userInput, embeddings) {
  const normalized = (userInput || "").trim();
  const texts = skillsMeta.map((s) => `${s.name} ${s.description}`);
  const [queryEmb, ...docEmbs] = await Promise.all([
    embeddings.embedQuery(normalized),
    ...texts.map((t) => embeddings.embedQuery(t)),
  ]);
  return skillsMeta.map((skill, i) => ({
    skill,
    score: cosineSimilarity(queryEmb, docEmbs[i]),
  }));
}

/**
 * Tool Router 配置
 * @typedef {Object} ToolRouterOptions
 * @property {"keyword"|"semantic"} strategy - 匹配策略
 * @property {number} [threshold=0.5] - 匹配度阈值，仅返回 score ≥ threshold 的技能（如 0.85 表示 85%）
 * @property {number} [topK] - 最多返回的 skill 数量，不设则按阈值全选
 * @property {import("@langchain/core/embeddings").Embeddings} [embeddings] - 语义匹配时必传
 */

/**
 * 执行路由：根据策略与阈值筛选技能
 * @param {Array<{ name: string, description: string, dirPath?: string }>} skillsMeta
 * @param {string} userInput
 * @param {ToolRouterOptions} options
 * @returns {Promise<{ selected: typeof skillsMeta, scores: Map<string, number>, strategy: string }>}
 */
export async function route(skillsMeta, userInput, options = {}) {
  const { strategy = "keyword", threshold = 0.5, topK, embeddings } = options;
  const rawInput = (userInput || "").trim();

  let results;
  if (strategy === "semantic" && embeddings) {
    results = await matchBySemantic(skillsMeta, rawInput, embeddings);
  } else {
    results = matchByKeyword(skillsMeta, rawInput);
  }

  const above = results.filter((r) => r.score >= threshold);
  const sorted = above.sort((a, b) => b.score - a.score);
  const selected = topK != null ? sorted.slice(0, topK) : sorted;
  const selectedSkills = selected.map((r) => r.skill);
  const scores = new Map(selected.map((r) => [r.skill.name, r.score]));

  return {
    selected: selectedSkills,
    scores,
    strategy,
  };
}

/**
 * 创建用于「意图/关键词提取」的 PromptTemplate（可选，与 LLM 联用时可先格式化再路由）
 * @returns {PromptTemplate}
 */
export function createIntentTemplate() {
  return PromptTemplate.fromTemplate(
    "从以下用户输入中提取主要意图与关键词，用于技能匹配。输出简短概括，保留原意。\n\n用户输入：{input}\n\n概括："
  );
}

export default {
  preprocessInput,
  matchByKeyword,
  matchBySemantic,
  route,
  createIntentTemplate,
};
