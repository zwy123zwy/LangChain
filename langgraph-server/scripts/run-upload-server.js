/**
 * 上传服务：接收前端 multipart 文件，存到 langgraph-server/uploads
 * 需在 langgraph-server 目录下执行：node scripts/run-upload-server.js
 * 端口见环境变量 UPLOAD_SERVER_PORT，默认 3024
 */
import "dotenv/config";
import express from "express";
import path from "path";
import { uploadMiddleware, getUploadsDir } from "../lib/upload.js";

const PORT = Number(process.env.UPLOAD_SERVER_PORT) || 3024;
const app = express();

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (_req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.post("/upload", uploadMiddleware, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "请使用 form-data 上传，字段名为 file" });
  }
  const relativePath = path.relative(getUploadsDir(), req.file.path);
  res.json({
    path: relativePath,
    originalName: req.file.originalname,
    size: req.file.size,
  });
});

app.listen(PORT, () => {
  console.log(`Upload server: http://localhost:${PORT}/upload (POST, multipart file)`);
});
