/**
 * 第五章：Tools - 结构化工具（name、description、schema、func）
 * 对应课件：05-LangChain使用之Tools.pdf 工具定义（与 StructuredTool 等价）
 *
 * LangChain.js 推荐用 tool() 定义，内部即为结构化工具。
 *
 * 运行：node langchain-tutorial/chapter05-tools/03-structured-tool.js
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";

const searchTool = tool(
  async ({ query }) => {
    const mock = {
      LangChain: "LangChain 是用于构建 LLM 应用的开发框架。",
      天气: "今日北京晴，25°C。",
    };
    const key = Object.keys(mock).find((k) => query.includes(k));
    return key ? mock[key] : `未找到与「${query}」相关的结果。`;
  },
  {
    name: "search",
    description: "检索互联网或知识库中的信息，输入为查询关键词",
    schema: z.object({
      query: z.string().describe("搜索关键词"),
    }),
  }
);

async function main() {
  console.log("========== StructuredTool ==========\n");
  console.log("name:", searchTool.name);
  console.log("description:", searchTool.description);
  console.log();

  const out = await searchTool.invoke({ query: "LangChain" });
  console.log("searchTool.invoke({ query: 'LangChain' }) =", out);
}

main().catch(console.error);
