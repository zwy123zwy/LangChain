/**
 * 长期记忆：将会话持久化到文件，下次同 threadId 时加载，实现跨会话记忆
 * 短期记忆 = 当次运行的 state.messages；长期记忆 = 本模块的持久化
 */
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEMORY_DIR = path.join(__dirname, "memory");

function ensureDir() {
  if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

function getFilePath(threadId) {
  const safe = (threadId || "default").replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(MEMORY_DIR, `${safe}.json`);
}

/**
 * 将消息转为可 JSON 存储的简单格式（只保留 human/ai 文本，便于长期记忆）
 */
function messagesToStored(messages) {
  return messages
    .filter((m) => m && (m._getType?.() === "human" || m._getType?.() === "ai" || m.role === "human" || m.role === "assistant"))
    .map((m) => {
      const type = m._getType?.() || m.role;
      const content = typeof m.content === "string" ? m.content : (m.content && m.content[0]?.text) || JSON.stringify(m.content);
      return { type: type === "assistant" ? "ai" : type === "human" ? "human" : type, content };
    });
}

function storedToMessages(stored) {
  if (!Array.isArray(stored) || stored.length === 0) return [];
  return stored.map((s) => {
    if (s.type === "human") return new HumanMessage(s.content);
    return new AIMessage(s.content);
  });
}

/**
 * 加载长期记忆（该 thread 的历史消息）
 */
export function loadLongTermMemory(threadId = "default") {
  ensureDir();
  const filePath = getFilePath(threadId);
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const stored = JSON.parse(raw);
    return storedToMessages(stored);
  } catch {
    return [];
  }
}

/**
 * 保存长期记忆（将本次对话后的消息写入文件）
 */
export function saveLongTermMemory(threadId, messages) {
  ensureDir();
  const filePath = getFilePath(threadId);
  const stored = messagesToStored(messages);
  fs.writeFileSync(filePath, JSON.stringify(stored, null, 0), "utf-8");
}
