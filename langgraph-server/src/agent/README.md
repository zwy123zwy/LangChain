# Agent 代码结构

本目录按 **Agent 三部分** 组织代码：

| 部分 | 文件/目录 | 职责 |
|------|-----------|------|
| **1. 模型（LLM）** | `model.js` | 配置对话模型（ChatOllama），作为 Agent 的“大脑”，负责理解输入、决定是否调用工具、生成最终回复。 |
| **2. 工具（Tools）** | `tools/` | 每个工具一个文件，在 `tools/index.js` 中汇总为 `tools` 数组，供图使用。含 `read_file`：输入为**文件路径**（相对 uploads），输出为文件内容，解耦给大模型。 |
| **3. 图（Graph）** | `graph.js` | 用 `createReactAgent` 将模型与工具组装成 ReAct 图，定义「推理 → 执行工具 → 再推理」的流程，并导出给 LangGraph CLI。通过 `state_modifier` 注入**唯一系统 prompt**（常量 `SYSTEM_PROMPT`），可在该文件中修改。 |

```
src/agent/
├── README.md      # 本说明
├── model.js       # 1. LLM 配置
├── tools/         # 2. 工具（每个工具一个文件）
│   ├── index.js   #    入口：汇总并导出 tools 数组
│   ├── get-weather.js
│   ├── add-number.js
│   └── read-file.js  # 读取 uploads 下文件，输入：file_path
└── graph.js       # 3. 图组装与导出
```

扩展时：在 `tools/` 下新建 `xxx.js` 定义工具并 export，再在 `tools/index.js` 中 import 并加入 `tools` 数组；更换模型则修改 `model.js`；若需自定义节点或边，可在 `graph.js` 中改用 `StateGraph` 手写图逻辑。
