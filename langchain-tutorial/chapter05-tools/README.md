# 第五章：Tools（工具）- JS 版

对应课件：**langchain/01-课件/05-LangChain使用之Tools.pdf**

## 课件与示例对应

| 课件章节 | 内容概要 | 示例文件 |
|----------|----------|----------|
| 工具定义 | name、description、schema（Zod） | `01-custom-tool.js` |
| 工具与模型 | bindTools、tool_calls、ToolMessage | `02-tool-with-model.js` |
| StructuredTool | StructuredTool.from 更细粒度控制 | `03-structured-tool.js` |
| 多工具 | 多工具绑定、循环执行 tool_calls | `04-multi-tools.js` |

## 运行

```bash
node langchain-tutorial/chapter05-tools/01-custom-tool.js
node langchain-tutorial/chapter05-tools/02-tool-with-model.js
node langchain-tutorial/chapter05-tools/03-structured-tool.js
node langchain-tutorial/chapter05-tools/04-multi-tools.js
```

## 说明

- 使用 `tool()` 或 `StructuredTool.from()` 定义工具，用 Zod 定义参数 schema。
- 模型通过 `model.bindTools([...])` 绑定工具，返回 `tool_calls` 时由应用执行工具并回传 `ToolMessage`。
