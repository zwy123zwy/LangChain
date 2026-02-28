/**
 * LangGraph 相关 API 路由（通过 @langchain/langgraph-sdk 连接远程 LangGraph 服务）
 */

import { Router } from "express";
import { getLangGraphClient, getDefaultAssistantId } from "./langgraph-client.js";

const router = Router();

router.get("/assistants", async (_req, res) => {
  try {
    const client = getLangGraphClient();
    const list = await client.assistants.search({ limit: 50 });
    res.json({ assistants: list });
  } catch (err) {
    console.error("[LangGraph assistants]", err);
    res.status(500).json({
      error: err.message || "获取 Assistants 失败",
      hint: "请确认 LANGGRAPH_API_URL 可访问且已配置 LANGGRAPH_API_KEY（若需要）",
    });
  }
});

router.post("/threads", async (req, res) => {
  try {
    const client = getLangGraphClient();
    const thread = await client.threads.create(req.body || {});
    res.json({ threadId: thread.thread_id, thread });
  } catch (err) {
    console.error("[LangGraph threads create]", err);
    res.status(500).json({ error: err.message || "创建 Thread 失败" });
  }
});

router.post("/run", async (req, res) => {
  const { assistantId: bodyAssistantId, threadId: bodyThreadId, input } = req.body || {};
  const assistantId = bodyAssistantId || getDefaultAssistantId();
  if (!assistantId) {
    return res.status(400).json({
      error: "请提供 assistantId，或设置环境变量 LANGGRAPH_DEFAULT_ASSISTANT_ID",
    });
  }
  try {
    const client = getLangGraphClient();
    let threadId = bodyThreadId;
    if (!threadId) {
      const thread = await client.threads.create({});
      threadId = thread.thread_id;
    }
    const payload = input != null ? { input } : {};
    const values = await client.runs.wait(threadId, assistantId, payload);
    res.json({ threadId, values });
  } catch (err) {
    console.error("[LangGraph run]", err);
    res.status(500).json({
      error: err.message || "Run 执行失败",
      hint: "请确认 LangGraph 服务已启动且 assistantId 正确",
    });
  }
});

router.post("/chat", async (req, res) => {
  const { message, assistantId: bodyAssistantId, threadId: bodyThreadId } = req.body || {};
  const text = typeof message === "string" ? message.trim() : "";
  if (!text) {
    return res.status(400).json({ error: "请提供 message 字段" });
  }
  const assistantId = bodyAssistantId || getDefaultAssistantId();
  if (!assistantId) {
    return res.status(400).json({
      error: "请提供 assistantId，或设置环境变量 LANGGRAPH_DEFAULT_ASSISTANT_ID",
    });
  }
  try {
    const client = getLangGraphClient();
    let threadId = bodyThreadId;
    if (!threadId) {
      const thread = await client.threads.create({});
      threadId = thread.thread_id;
    }
    const input = {
      messages: [{ role: "human", content: text }],
    };
    const values = await client.runs.wait(threadId, assistantId, { input });
    const messages = values?.messages ?? values?.value?.messages ?? [];
    const lastMessage = Array.isArray(messages) ? messages[messages.length - 1] : null;
    const content = lastMessage?.content ?? lastMessage?.data?.content ?? values;
    res.json({ threadId, answer: content, values });
  } catch (err) {
    console.error("[LangGraph chat]", err);
    res.status(500).json({ error: err.message || "LangGraph 调用失败" });
  }
});

export default router;
