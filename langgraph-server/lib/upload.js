/**
 * 上传与读取文件逻辑（langgraph-server 内）
 * 接收前端 multipart 文件并存储到本目录下的 uploads，供 read_file 工具读取
 */
import path from "path";
import fs from "fs";
import multer from "multer";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    ensureUploadsDir();
    cb(null, UPLOADS_DIR);
  },
  filename(_req, file, cb) {
    const safeName = (file.originalname || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
    const name = Date.now() + "-" + safeName;
    cb(null, name);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
}).single("file");

export function getUploadsDir() {
  ensureUploadsDir();
  return UPLOADS_DIR;
}

export function resolveUploadPath(relativePath) {
  const base = getUploadsDir();
  const resolved = path.resolve(base, relativePath);
  if (!resolved.startsWith(base)) {
    throw new Error("路径不允许在 uploads 之外");
  }
  return resolved;
}
