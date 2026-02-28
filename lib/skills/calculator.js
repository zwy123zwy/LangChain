/**
 * Skill: 计算器 - 执行数学表达式
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";

function safeEval(expr) {
  const sanitized = expr.replace(/[^0-9+\-*/().%\s]/g, "");
  try {
    return String(eval(sanitized));
  } catch (e) {
    return `计算错误: ${e.message}`;
  }
}

export const calculator = tool(
  async ({ expression }) => safeEval(expression),
  {
    name: "calculator",
    description: "计算数学表达式的结果。支持 + - * / () 和百分数。输入为字符串形式的数学表达式，如 '1+2*3'、'100*0.15'。",
    schema: z.object({
      expression: z.string().describe("数学表达式，如 1+2*3"),
    }),
  }
);

export default {
  name: "calculator",
  description: "执行数学运算。当用户需要计算数值、算式或百分比时使用。",
  tools: [calculator],
};
