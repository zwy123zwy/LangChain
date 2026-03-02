/**
 * Agent 组成部分 3/3：图（Graph）
 * 将模型与工具组装为 ReAct Agent，定义「推理 → 可选调用工具 → 再推理」的流程。
 * 导出给 langgraph.json 的 graphs.agent / graphs.chat 使用。
 */
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { model } from "./model.js";
import { tools } from "./tools/index.js";

export const graph = createReactAgent({
  llm: model,
  tools,
});

graph.name = "Chain Agent";
