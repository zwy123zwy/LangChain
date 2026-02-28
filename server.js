/**
 * ??????
 * ???? LangChain ? LangGraph????? API?
 * ? agent-ui ??Deployment URL ? http://localhost:2024 ???
 *
 * ???npm start  ?  node server.js
 * ?????PORT?LANGGRAPH_API_URL?LANGGRAPH_API_KEY?LANGGRAPH_DEFAULT_ASSISTANT_ID
 */

import "dotenv/config";
import express from "express";
import { config } from "./config.js";
import langchainRoutes from "./routes/langchain.js";
import langgraphRoutes from "./routes/langgraph.js";
import langgraphServerRoutes from "./routes/langgraph-server.js";

const app = express();

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Api-Key, Authorization"
  );
  if (_req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// LangGraph Server ?? API?agent-ui ?? 2024 ??????????
app.use(langgraphServerRoutes);

app.use("/api/langchain", langchainRoutes);
app.use("/api/langgraph", langgraphRoutes);

// ??????
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    port: config.port,
    routes: {
      langchain: ["/api/langchain/filesystem-agent"],
      langgraph: [
        "/api/langgraph/assistants",
        "/api/langgraph/threads",
        "/api/langgraph/run",
        "/api/langgraph/chat",
      ],
    },
  });
});

app.listen(config.port, () => {
  console.log(`?????: http://localhost:${config.port}`);
  console.log(`  LangGraph Server: GET /info, POST /threads, GET /threads/:id/state, POST /threads/:id/runs/wait?agent-ui ???`);
  console.log(`  LangChain: POST /api/langchain/filesystem-agent`);
  console.log(`  LangGraph SDK: /api/langgraph/*`);
});
