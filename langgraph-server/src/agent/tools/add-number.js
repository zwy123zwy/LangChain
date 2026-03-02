/**
 * 工具：计算两数之和
 */
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const addNumber = tool(
  async ({ a, b }) => a + b,
  {
    name: "add_number",
    description: "计算两个整数的和",
    schema: z.object({
      a: z.number().describe("第一个数"),
      b: z.number().describe("第二个数"),
    }),
  }
);
