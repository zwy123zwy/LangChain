/**
 * Skill: 搜索 - 模拟检索（可替换为真实搜索 API）
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";

const MOCK_DB = {
  北京: "北京是中国的首都，政治文化中心。",
  上海: "上海是中国最大的经济中心，金融与贸易发达。",
  LangChain: "LangChain 是用于构建 LLM 应用的框架，支持链、工具、Agent 与 RAG。",
  "agent skills": "Agent Skills 是可插拔的技能模块，每个技能包含名称、描述和一组工具，供 Agent 按需调用。",
};

export const search = tool(
  async ({ query }) => {
    const q = (query || "").trim();
    for (const [key, value] of Object.entries(MOCK_DB)) {
      if (q.includes(key) || key.toLowerCase().includes(q.toLowerCase())) {
        return value;
      }
    }
    return `未找到与「${q}」直接相关的条目。当前可检索关键词示例：北京、上海、LangChain、agent skills。`;
  },
  {
    name: "search",
    description: "根据关键词检索知识库或百科信息。当用户询问事实、概念或需要查资料时使用。",
    schema: z.object({
      query: z.string().describe("检索关键词或短语"),
    }),
  }
);

export default {
  name: "search",
  description: "检索信息。当用户问事实、概念或需要查资料时使用。",
  tools: [search],
};
