/**
 * Agent 组成部分 3/3：图（Graph）
 * 将模型与工具组装为 ReAct Agent，定义「推理 → 可选调用工具 → 再推理」的流程。
 * 通过 state_modifier 注入唯一系统 prompt，导出给 langgraph.json 的 graphs.agent / graphs.chat 使用。
 */
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SystemMessage } from "@langchain/core/messages";
import { model } from "./model.js";
import { tools } from "./tools/index.js";

/** 唯一系统 prompt：约束 Agent 的角色与行为 */
const SYSTEM_PROMPT = `你是有帮助的 AI 助手，具备查天气、简单计算与读取用户上传文件的能力。
请根据用户问题选用：get_weather（按城市查天气）、add_number（两数相加）、read_file（读取 uploads 下文件，输入为文件路径）。
若用户提到“刚传的文件”“上传的文档”等，请使用 read_file，文件路径由用户提供或从上下文获取。
回复请简洁、友好，并结合工具结果作答。`;

function stateModifier(state) {
  const messages = state?.messages ?? [];
  return [new SystemMessage(SYSTEM_PROMPT), ...messages];
}

export const graph = createReactAgent({
  llm: model,
  tools,
  state_modifier: stateModifier,
});

graph.name = "Chain Agent";
