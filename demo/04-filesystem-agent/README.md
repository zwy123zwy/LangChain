# 文件系统 Agent Demo

对本机**沙箱目录**内的文件夹与文件进行**读取、写入、创建、删除**的 Agent 示例。Agent 通过 LangChain 工具调用本地 Ollama 模型，根据自然语言指令执行文件操作。

## 功能

| 工具 | 说明 |
|------|------|
| `list_directory` | 列出指定目录下的文件和子目录 |
| `read_file` | 读取文件内容（可指定编码） |
| `write_file` | 写入或覆盖文件，自动创建父目录 |
| `create_directory` | 创建目录（递归创建） |
| `delete_file` | 删除文件 |
| `delete_directory` | 删除目录（可选递归删除） |

所有路径均为**相对于沙箱**的路径，不允许访问沙箱外的磁盘。

## 沙箱目录

- **默认**：`demo/04-filesystem-agent/workspace`（相对项目根目录）
- **自定义**：设置环境变量 `FILESYSTEM_AGENT_BASE_PATH` 为任意绝对路径

## 运行

**前置**：本机已运行 Ollama 并拉取模型（如 `qwen3-coder:480b-cloud`）。

在**项目根目录**执行：

```bash
# 使用默认指令（创建 hello 目录、写入 world.txt、列出目录）
npm run demo:filesystem

# 或自定义指令
node demo/04-filesystem-agent/agent.js 列出 workspace 里所有文件
node demo/04-filesystem-agent/agent.js 在沙箱创建 src/index.js 并写入 console.log('hi')
```

## 示例指令

- “列出沙箱根目录的内容”
- “在沙箱里创建 `notes` 目录，并在其中创建 `todo.txt`，内容写 `买牛奶`”
- “读取 `hello/world.txt` 的内容”
- “删除 `notes/todo.txt` 文件”

## 安全说明

- 仅能操作沙箱目录内的路径，无法访问系统其他位置。
- 若需对重要目录操作，请将该目录设为 `FILESYSTEM_AGENT_BASE_PATH` 并知悉风险。
