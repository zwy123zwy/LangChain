/**
 * LangChain 相关 API 路由
 * - 文件系统 Agent（本地 Ollama + 工具）
 */

import { Router } from "express";
import { runAgent } from "../demo/04-filesystem-agent/agent.js";

const router = Router();

router.post("/filesystem-agent", async (req, res) => {
  const message = req.body?.message?.trim();
  if (!message) {
    return res.status(400).json({ error: "请提供 message 字段" });
  }
  try {
    const answer = await runAgent(message);
    res.json({ answer });
  } catch (err) {
    console.error("[LangChain filesystem-agent]", err);
    res.status(500).json({ error: err.message || "Agent 执行失败" });
  }
});

export default router;
