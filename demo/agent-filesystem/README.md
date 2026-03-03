# 文件系统 Agent（获取目录路径、创建/删除文件）

本 Agent 具备：**获取文件夹路径并列出内容**、**创建文件**、**删除文件**，且五要素明确：Plan、Memory、Tools、LLM、Perception。

## 五要素

| 要素 | 含义 | 在本 Agent 中的实现 |
|------|------|---------------------|
| **Plan（规划）** | 决定“下一步做什么” | 由 LLM 每轮根据当前状态决定：调用哪个 Tool（list_directory / create_file / delete_file）或直接给出回复。ReAct 中一次“推理 + 选工具/回复”即一次规划。 |
| **Memory（记忆）** | 保留历史信息供后续使用 | **短期记忆**：当次运行的 `state.messages`（用户/助手/工具结果），进程结束即消失。**长期记忆**：`memory.js` 将对话持久化到 `memory/{threadId}.json`，下次同 `threadId` 运行会加载，实现跨会话记忆。 |
| **Tools（工具）** | Agent 可执行的动作 | `list_directory`：获取目录路径并列出内容；`create_file`：在 workspace 内创建/覆盖文件；`delete_file`：删除 workspace 内文件。所有操作限制在 `workspace/` 目录内。 |
| **LLM（大模型）** | 理解与决策中枢 | `ChatOllama`（见 `demo/ollama-config.js`），负责理解用户意图、选择工具与参数、组织最终回复。 |
| **Perception（感知）** | Agent 的“输入” | 即当前状态 `state`（主要为 `state.messages`）：当前用户问题 + 历史对话 + 历史工具返回。Agent 据此“看到”当前上下文并做规划。 |

## 短期记忆 vs 长期记忆

| 类型 | 含义 | 实现方式 |
|------|------|----------|
| **短期记忆** | 仅当前会话、当次运行有效，进程结束即丢失 | LangGraph 的 `state.messages`，不落盘。 |
| **长期记忆** | 跨会话、跨次运行仍可被使用 | `memory.js`：每次对话结束后将消息写入 `memory/{threadId}.json`；下次用相同 `threadId` 时先加载该文件，再拼到本次输入前，Agent 即可“记得”上次对话。 |

**使用长期记忆**（默认开启）：

```bash
npm run demo:agent-filesystem
# 或指定会话 ID，便于多用户/多线程
THREAD_ID=user1 node demo/agent-filesystem/agent.js
```

第二次用相同 `THREAD_ID` 运行并提问（如“上次你创建了哪个文件？”），Agent 会基于 `memory/user1.json` 中的历史回答。

**仅用短期记忆**（不读写文件）：

```bash
USE_LONG_MEMORY=0 node demo/agent-filesystem/agent.js
```

## 目录与安全

- 所有文件操作限制在 **`demo/agent-filesystem/workspace/`** 下，不触及项目其他部分或系统目录。
- 工具实现见 `tools.js`。

## 运行

```bash
node demo/agent-filesystem/agent.js
```

或从项目根目录：

```bash
npm run demo:agent-filesystem
```

示例提示：*“请先列出当前工作区根目录的内容，然后创建一个文件 hello.txt 内容写 Hello from agent，再列一次目录确认。”*
