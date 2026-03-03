/**
 * 文件系统 Agent：获取目录路径、创建/删除文件
 *
 * 五要素说明：
 * - Plan（规划）：由 LLM 根据当前 Perception 决定下一步（调用哪个 Tool 或直接回复），ReAct 中每轮推理即一次规划。
 * - Memory（记忆）：短期 = 当次 state.messages；长期 = memory.js 持久化到文件，同 threadId 跨会话可加载。
 * - Tools（工具）：list_directory、create_file、delete_file，均在 workspace 内操作。
 * - LLM（大模型）：ChatOllama，负责理解用户意图、规划动作、生成回复。
 * - Perception（感知）：Agent 的输入 = 当前 state（含 messages），即“看到”的用户问题与历史消息/工具返回。
 */
import "dotenv/config";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "../ollama-config.js";
import { tools } from "./tools.js";
import { loadLongTermMemory, saveLongTermMemory } from "./memory.js";

// ——— LLM ———
const llm = new ChatOllama({
  model: OLLAMA_MODEL,
  baseUrl: OLLAMA_BASE_URL,
  temperature: 0,
});

// ——— Agent（含 Tools，Memory 见上；Plan/Perception 见文件头注释）———
const agent = createReactAgent({
  llm,
  tools,
});

/**
 * 运行一轮对话。useLongMemory 为 true 时使用长期记忆（同 threadId 跨次运行可记住历史）
 */
async function run(userText, options = {}) {
  const { threadId = "default", useLongMemory = true } = options;
  const history = useLongMemory ? loadLongTermMemory(threadId) : [];
  const messages = [...history, new HumanMessage(userText)];

  const result = await agent.invoke({ messages });
  const last = result.messages[result.messages.length - 1];

  if (useLongMemory) saveLongTermMemory(threadId, result.messages);

  return { reply: last.content, messages: result.messages };
}

async function main() {
  console.log("========== 文件系统 Agent（短期 / 长期记忆）==========\n");

  const useLong = process.env.USE_LONG_MEMORY !== "0";
  const threadId = process.env.THREAD_ID || "default";

  // 示例 1：短期记忆（当次有效）
  if (!useLong) {
    const { reply } = await run(
      "请先列出工作区根目录，然后创建 hello.txt 内容为 Hello from agent，再列一次目录。",
      { useLongMemory: false }
    );
    console.log("最终回复:", reply);
    return;
  }

  // 示例 2：长期记忆（同 threadId 下次运行会带上历史）
  const input = process.argv[2];
  const userText =
    input ||
    "请先列出工作区根目录，然后创建 hello.txt 内容为 Hello from agent，再列一次目录确认。";
  const { reply } = await run(userText, { threadId, useLongMemory: true });
  console.log("最终回复:", reply);
  console.log("\n（长期记忆已写入 memory/" + threadId + ".json，下次同 THREAD_ID 运行会加载）");
}

main().catch(console.error);
