/**
 * 工具：读取任意文件（仅限 uploads 目录内）
 * 输入：文件路径（相对 uploads 根的相对路径，或文件名）
 * 输出：文件文本内容，解耦给大模型使用；非文本文件返回 Base64 或说明
 */
import path from "path";
import fs from "fs";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const UPLOADS_BASE = path.resolve(process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads"));

function resolveSafe(filePath) {
  const normalized = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const absolute = path.resolve(UPLOADS_BASE, normalized);
  const baseResolved = path.resolve(UPLOADS_BASE);
  if (!absolute.startsWith(baseResolved) || absolute === baseResolved) {
    throw new Error("路径不允许在 uploads 之外");
  }
  return absolute;
}

const TEXT_EXT = new Set([
  ".txt", ".md", ".json", ".csv", ".xml", ".html", ".htm", ".js", ".ts", ".mjs", ".cjs",
  ".py", ".sh", ".bat", ".yaml", ".yml", ".log", ".env", ".sql", ".graphql",
]);

export const readFile = tool(
  async ({ file_path }) => {
    const absolute = resolveSafe(file_path);
    if (!fs.existsSync(absolute)) {
      return `错误：文件不存在 "${file_path}"（基于 uploads 目录）`;
    }
    const stat = fs.statSync(absolute);
    if (!stat.isFile()) {
      return `错误：不是文件 "${file_path}"`;
    }
    const ext = path.extname(absolute).toLowerCase();
    if (TEXT_EXT.has(ext)) {
      const content = fs.readFileSync(absolute, "utf-8");
      return content;
    }
    return `[二进制或非文本文件: ${path.basename(absolute)}，仅支持文本类后缀如 .txt/.md/.json 等]`;
  },
  {
    name: "read_file",
    description: "读取已上传文件的内容。输入为文件路径：相对 uploads 目录的相对路径（例如 1234567890-doc.txt）。仅能读取 uploads 下的文件，返回文本内容供大模型使用。",
    schema: z.object({
      file_path: z.string().describe("文件路径，相对 uploads 目录，例如: 1234567890-notes.txt"),
    }),
  }
);
