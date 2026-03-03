/**
 * 文件系统 Agent - Tools
 * 所有操作限制在 workspace 目录内，避免误操作系统文件
 */
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = path.resolve(__dirname, "workspace");

function ensureWorkspace() {
  if (!fs.existsSync(WORKSPACE)) fs.mkdirSync(WORKSPACE, { recursive: true });
}

function resolveSafe(relativePath) {
  ensureWorkspace();
  const base = path.resolve(WORKSPACE);
  const normalized = path.normalize(relativePath || ".").replace(/^(\.\.(\/|\\|$))+/, "");
  const absolute = path.resolve(base, normalized);
  if (!absolute.startsWith(base)) throw new Error("路径必须在 workspace 目录内");
  return absolute;
}

/** 获取目录路径并列出其内容（子文件/子目录） */
export const listDirectory = tool(
  async ({ dir_path }) => {
    const absolute = resolveSafe(dir_path || ".");
    if (!fs.existsSync(absolute)) return `目录不存在: ${dir_path || "."}`;
    const stat = fs.statSync(absolute);
    if (!stat.isDirectory()) return `不是目录: ${dir_path || "."}`;
    const entries = fs.readdirSync(absolute, { withFileTypes: true });
    const lines = entries.map((e) => (e.isDirectory() ? `[DIR]  ${e.name}` : `[FILE] ${e.name}`));
    return `路径: ${absolute}\n内容:\n` + lines.join("\n");
  },
  {
    name: "list_directory",
    description: "获取指定目录的路径并列出其下的文件和子目录。输入为相对 workspace 的路径，空字符串或 '.' 表示 workspace 根。",
    schema: z.object({
      dir_path: z.string().optional().describe("相对 workspace 的目录路径，如 '' 或 'subfolder'"),
    }),
  }
);

/** 创建文件 */
export const createFile = tool(
  async ({ file_path, content }) => {
    const absolute = resolveSafe(file_path);
    const dir = path.dirname(absolute);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(absolute, content ?? "", "utf-8");
    return `已创建文件: ${absolute}`;
  },
  {
    name: "create_file",
    description: "在 workspace 内创建或覆盖一个文件。输入为相对路径和文件内容。",
    schema: z.object({
      file_path: z.string().describe("相对 workspace 的文件路径，如 notes.txt 或 sub/notes.txt"),
      content: z.string().optional().describe("文件内容，不填则为空"),
    }),
  }
);

/** 删除文件 */
export const deleteFile = tool(
  async ({ file_path }) => {
    const absolute = resolveSafe(file_path);
    if (!fs.existsSync(absolute)) return `文件不存在: ${file_path}`;
    const stat = fs.statSync(absolute);
    if (stat.isDirectory()) return `不能删除目录，请只传文件路径: ${file_path}`;
    fs.unlinkSync(absolute);
    return `已删除: ${absolute}`;
  },
  {
    name: "delete_file",
    description: "删除 workspace 内的指定文件（不能删除目录）。",
    schema: z.object({
      file_path: z.string().describe("相对 workspace 的文件路径"),
    }),
  }
);

export const tools = [listDirectory, createFile, deleteFile];
