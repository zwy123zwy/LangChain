/**
 * 内置 Agent Skills 注册表
 * 每个 skill 导出：{ name, description, tools }
 */

import calculatorSkill from "./calculator.js";
import searchSkill from "./search.js";
import codeReviewSkill from "./code-review.js";

export const builtInSkills = {
  calculator: calculatorSkill,
  search: searchSkill,
  "code-review": codeReviewSkill,
};

/**
 * 按名称获取若干 skill
 * @param {string[]} names - 如 ["calculator", "search", "code-review"]
 * @returns {import("../agent-skills.js").SkillDef[]}
 */
export function getSkills(names) {
  const list = Array.isArray(names) ? names : Object.keys(builtInSkills);
  return list
    .map((name) => builtInSkills[name])
    .filter(Boolean);
}

export { calculatorSkill, searchSkill, codeReviewSkill };
export default builtInSkills;
