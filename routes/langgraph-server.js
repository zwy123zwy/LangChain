/**
 * LangGraph Server 兼容 API（本机图，无代理）
 * 实现 /info、/threads、/threads/:id/state、/threads/:id/runs/wait 等，供 agent-ui 直连
 */

import { Router } from "express";
import { randomUUID } from "crypto";
import {
  getRunnable,
  apiMessagesToLc,
  lcMessagesToApi,
} from "../lib/graph.js";

const router = Router();
const threads = new Map();

router.get("/info", (_req, res) => {
  res.json({ status: "ok", message: "LangGraph server (in-process)" });
});

router.post("/assistants/search", (req, res) => {
  res.json({
    assistants: [
      {
        assistant_id: "agent",
        graph_id: "agent",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {},
      },
    ],
  });
});

router.post("/threads", (req, res) => {
  const threadId = req.body?.thread_id || randomUUID();
  if (threads.has(threadId)) {
    if (req.body?.if_exists === "do_nothing") {
      return res.json({ thread_id: threadId });
    }
  }
  threads.set(threadId, { values: { messages: [] }, metadata: req.body?.metadata || {} });
  res.status(201).json({ thread_id: threadId });
});

router.post("/threads/search", (req, res) => {
  const limit = Math.min(Number(req.body?.limit) || 10, 100);
  const offset = Number(req.body?.offset) || 0;
  const ids = Array.from(threads.keys()).slice(offset, offset + limit);
  const items = ids.map((thread_id) => ({
    thread_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: threads.get(thread_id)?.metadata ?? {},
  }));
  res.json({ threads: items });
});

router.get("/threads/:threadId", (req, res) => {
  const t = threads.get(req.params.threadId);
  if (!t) return res.status(404).json({ error: "thread not found" });
  res.json({
    thread_id: req.params.threadId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: t.metadata || {},
  });
});

router.get("/threads/:threadId/state", (req, res) => {
  const t = threads.get(req.params.threadId);
  if (!t) return res.status(404).json({ error: "thread not found" });
  const messages = lcMessagesToApi(t.values?.messages ?? []);
  res.json({
    values: { messages },
    next: [],
    config: { configurable: { thread_id: req.params.threadId } },
    metadata: {},
  });
});

router.post("/threads/:threadId/runs/wait", async (req, res) => {
  const { threadId } = req.params;
  const t = threads.get(threadId);
  if (!t) return res.status(404).json({ error: "thread not found" });

  const input = req.body?.input ?? {};
  const newMessages = Array.isArray(input.messages) ? input.messages : [];
  const existingLc = t.values?.messages ?? [];
  const existingApi = lcMessagesToApi(existingLc);
  const mergedApi = [...existingApi, ...newMessages];
  const mergedLc = apiMessagesToLc(mergedApi);

  try {
    const runnable = getRunnable();
    const result = await runnable.invoke({ messages: mergedLc });
    const outMessages = result?.messages ?? mergedLc;
    threads.set(threadId, {
      values: { messages: outMessages },
      metadata: t.metadata || {},
    });
    const values = { messages: lcMessagesToApi(outMessages) };
    res.json({
      values,
      next: [],
      config: { configurable: { thread_id: threadId } },
      metadata: {},
    });
  } catch (err) {
    console.error("[LangGraph server run]", err);
    res.status(500).json({
      __error__: { error: "RunFailed", message: err.message },
    });
  }
});

router.post("/threads/:threadId/runs/stream", async (req, res) => {
  const { threadId } = req.params;
  const t = threads.get(threadId);
  if (!t) return res.status(404).json({ error: "thread not found" });

  const input = req.body?.input ?? {};
  const newMessages = Array.isArray(input.messages) ? input.messages : [];
  const existingLc = t.values?.messages ?? [];
  const existingApi = lcMessagesToApi(existingLc);
  const mergedApi = [...existingApi, ...newMessages];
  const mergedLc = apiMessagesToLc(mergedApi);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.flushHeaders();

  try {
    const runnable = getRunnable();
    const result = await runnable.invoke({ messages: mergedLc });
    const outMessages = result?.messages ?? mergedLc;
    threads.set(threadId, {
      values: { messages: outMessages },
      metadata: t.metadata || {},
    });
    const values = { messages: lcMessagesToApi(outMessages) };
    res.write(`data: ${JSON.stringify({ event: "metadata", data: {} })}\n\n`);
    res.write(`data: ${JSON.stringify({ event: "values", data: values })}\n\n`);
  } catch (err) {
    console.error("[LangGraph server stream]", err);
    res.write(
      `data: ${JSON.stringify({ event: "error", data: { message: err.message } })}\n\n`
    );
  }
  res.end();
});

export default router;
