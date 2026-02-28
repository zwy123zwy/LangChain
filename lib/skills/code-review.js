/**
 * Skill: 代码审查 - 对给定代码片段返回审查要点（通过工具描述引导模型调用后的行为）
 * 此处仅提供“请求审查”的工具，实际审查由主 Agent 的 LLM 根据工具返回的指引完成。
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const request_code_review = tool(
  async ({ code_snippet, focus }) => {
    const focusHint = focus || "通用";
    return `[代码审查请求] 请对以下代码进行审查，侧重：${focusHint}。审查时请考虑：正确性、可读性、安全与最佳实践。\n\n\`\`\`\n${code_snippet}\n\`\`\``;
  },
  {
    name: "request_code_review",
    description: "请求对一段代码进行审查。用户提供代码片段和可选审查重点（如安全、性能、可读性），你应据此给出审查意见与改进建议。",
    schema: z.object({
      code_snippet: z.string().describe("待审查的代码片段"),
      focus: z.string().optional().describe("审查侧重点，如：安全、性能、可读性"),
    }),
  }
);

export default {
  name: "code-review",
  description: "对代码进行审查，给出质量、安全与最佳实践方面的建议。当用户要求 code review、审查代码或改进建议时使用。",
  tools: [request_code_review],
};
