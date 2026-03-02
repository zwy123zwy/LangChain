/**
 * 后端 API：基础对话
 * POST /api/chat       - 单轮/多轮对话（JSON body: { message, history? }）
 * POST /api/chat/stream - 流式对话（JSON body: { message, history? }）
 */

import { Router } from "express";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "../demo/ollama-config.js";

const router = Router();

function getModel() {
  return new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0.5,
  });
}

function parseHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((h) => h && (h.role === "user" || h.role === "human" || h.role === "assistant" || h.role === "ai"))
    .map((h) => {
      const role = h.role === "assistant" || h.role === "ai" ? "ai" : "human";
      const content = typeof h.content === "string" ? h.content : String(h.content ?? "");
      return role === "ai" ? new AIMessage(content) : new HumanMessage(content);
    });
}

router.post("/", async (req, res) => {
  const message = req.body?.message?.trim();
  if (!message) {
    return res.status(400).json({ error: "请提供 message 字段" });
  }
  try {
    const model = getModel();
    const history = parseHistory(req.body.history);
    const messages = [
      new SystemMessage("你是有帮助的 AI 助手。"),
      ...history,
      new HumanMessage(message),
    ];
    const response = await model.invoke(messages);
    const content = response.content?.toString?.() ?? String(response.content ?? "");
    res.json({ answer: content });
  } catch (err) {
    console.error("[chat]", err);
    res.status(500).json({ error: err.message || "对话失败" });
  }
});

router.post("/stream", async (req, res) => {
  const message = req.body?.message?.trim();
  if (!message) {
    return res.status(400).json({ error: "请提供 message 字段" });
  }
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
  try {
    const model = getModel();
    const history = parseHistory(req.body.history);
    const messages = [
      new SystemMessage("你是有帮助的 AI 助手。"),
      ...history,
      new HumanMessage(message),
    ];
    const stream = await model.stream(messages);
    for await (const chunk of stream) {
      const text = chunk.content?.toString?.() ?? String(chunk.content ?? "");
      if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("[chat/stream]", err);
    res.write(`data: ${JSON.stringify({ error: err.message || "流式对话失败" })}\n\n`);
    res.end();
  }
});

export default router;
