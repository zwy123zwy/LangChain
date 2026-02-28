/**
 * 本机文件系统工具（只允许在配置的沙箱目录内操作）
 * 提供：列出目录、读文件、写文件、创建目录、删除文件、删除目录
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 沙箱根目录：仅允许在此目录下操作，可通过环境变量 FILESYSTEM_AGENT_BASE_PATH 覆盖 */
const DEFAULT_BASE = path.resolve(__dirname, "workspace");
const BASE_PATH = path.resolve(
  process.env.FILESYSTEM_AGENT_BASE_PATH || DEFAULT_BASE
);

function resolveSafe(relativePath) {
  const joined = path.join(BASE_PATH, relativePath || ".");
  const full = path.normalize(joined);
  const relative = path.relative(BASE_PATH, full);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`路径不允许超出沙箱: ${relativePath}`);
  }
  return full;
}

export const listDirectory = tool(
  async ({ dirPath }) => {
    const full = resolveSafe(dirPath || ".");
    const stat = await fs.stat(full).catch(() => null);
    if (!stat) return `目录不存在: ${dirPath || "."}`;
    if (!stat.isDirectory()) return `不是目录: ${dirPath || "."}`;
    const entries = await fs.readdir(full, { withFileTypes: true });
    const lines = entries.map((e) => (e.isDirectory() ? `[DIR]  ${e.name}` : `[FILE] ${e.name}`));
    return `路径: ${full}\n${lines.join("\n")}`;
  },
  {
    name: "list_directory",
    description: "列出指定目录下的文件和子目录。参数为相对于沙箱的路径，空字符串或 '.' 表示沙箱根目录。",
    schema: z.object({
      dirPath: z.string().optional().describe("相对路径，如 'src' 或 '.'"),
    }),
  }
);

export const readFile = tool(
  async ({ filePath, encoding }) => {
    const full = resolveSafe(filePath);
    const enc = encoding || "utf-8";
    const content = await fs.readFile(full, { encoding: enc }).catch((e) => {
      if (e.code === "ENOENT") return `文件不存在: ${filePath}`;
      throw e;
    });
    return typeof content === "string" ? content : `<binary, ${content.length} bytes>`;
  },
  {
    name: "read_file",
    description: "读取文件内容。路径为相对于沙箱的路径。",
    schema: z.object({
      filePath: z.string().describe("相对路径，如 'src/index.js'"),
      encoding: z.string().optional().describe("编码，默认 utf-8"),
    }),
  }
);

export const writeFile = tool(
  async ({ filePath, content }) => {
    const full = resolveSafe(filePath);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, content ?? "", "utf-8");
    return `已写入: ${filePath}`;
  },
  {
    name: "write_file",
    description: "写入或覆盖文件内容。若目录不存在会递归创建。",
    schema: z.object({
      filePath: z.string().describe("相对路径，如 'data/hello.txt'"),
      content: z.string().describe("要写入的文本内容"),
    }),
  }
);

export const createDirectory = tool(
  async ({ dirPath }) => {
    const full = resolveSafe(dirPath);
    await fs.mkdir(full, { recursive: true });
    return `已创建目录: ${dirPath}`;
  },
  {
    name: "create_directory",
    description: "创建目录，若父目录不存在会递归创建。",
    schema: z.object({
      dirPath: z.string().describe("相对路径，如 'src/utils'"),
    }),
  }
);

export const deleteFile = tool(
  async ({ filePath }) => {
    const full = resolveSafe(filePath);
    const stat = await fs.stat(full).catch(() => null);
    if (!stat) return `文件不存在: ${filePath}`;
    if (stat.isDirectory()) return `这是目录，请使用 delete_directory: ${filePath}`;
    await fs.unlink(full);
    return `已删除文件: ${filePath}`;
  },
  {
    name: "delete_file",
    description: "删除指定文件（不能删除目录）。",
    schema: z.object({
      filePath: z.string().describe("相对路径"),
    }),
  }
);

export const deleteDirectory = tool(
  async ({ dirPath, recursive }) => {
    const full = resolveSafe(dirPath);
    const stat = await fs.stat(full).catch(() => null);
    if (!stat) return `目录不存在: ${dirPath}`;
    if (!stat.isDirectory()) return `不是目录: ${dirPath}`;
    await fs.rm(full, { recursive: !!recursive, force: true });
    return `已删除目录: ${dirPath}`;
  },
  {
    name: "delete_directory",
    description: "删除目录。recursive 为 true 时递归删除目录及其内容。",
    schema: z.object({
      dirPath: z.string().describe("相对路径"),
      recursive: z.boolean().optional().describe("是否递归删除子内容，默认 false"),
    }),
  }
);

export const allTools = [
  listDirectory,
  readFile,
  writeFile,
  createDirectory,
  deleteFile,
  deleteDirectory,
];

export function getToolsMap() {
  return {
    list_directory: listDirectory,
    read_file: readFile,
    write_file: writeFile,
    create_directory: createDirectory,
    delete_file: deleteFile,
    delete_directory: deleteDirectory,
  };
}

export { BASE_PATH };
