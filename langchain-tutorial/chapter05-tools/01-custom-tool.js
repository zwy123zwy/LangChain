/**
 * 第五章：Tools - 自定义工具
 *
 * 参考 langchain/03-代码/LangChain-tutorial/chapter05-tools
 * API 以 js.langchain.com 为准
 *
 * 运行：node langchain-tutorial/chapter05-tools/01-custom-tool.js
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";

const addNumber = tool(
  async ({ a, b }) => a + b,
  {
    name: "add_number",
    description: "计算两个整数的和",
    schema: z.object({
      a: z.number().describe("第一个整数"),
      b: z.number().describe("第二个整数"),
    }),
  }
);

const addTwoNumber = tool(
  async ({ a, b }) => a + b,
  {
    name: "add_two_number",
    description: "add two numbers",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    returnDirect: true,
  }
);

async function main() {
  console.log("name =", addNumber.name);
  console.log("description =", addNumber.description);
  console.log("returnDirect =", addTwoNumber.returnDirect);
  console.log();

  const result = await addNumber.invoke({ a: 3, b: 5 });
  console.log("addNumber.invoke({ a: 3, b: 5 }) =", result);
}

main().catch(console.error);
