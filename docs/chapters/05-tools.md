# 第五章：Tools（工具）

> 参考 `langchain/01-课件` 与 `langchain/03-代码/LangChain-tutorial/chapter05-tools`，以 [LangChain.js 官方文档](https://js.langchain.com) 最新 API 为准。

## 一、使用 tool 定义工具

### 1.1 使用 tool() 函数（推荐）

```javascript
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const addNumber = tool(
  async ({ a, b }) => a + b,
  {
    name: "add_number",
    description: "计算两个整数的和",
    schema: z.object({
      a: z.number().describe("第一个整数"),
      b: z.number().describe("第二个整数"),
    }),
  }
);

console.log(addNumber.name);      // add_number
console.log(addNumber.description); // 计算两个整数的和
```

### 1.2 自定义 name 与 description

```javascript
const addTwoNumber = tool(
  async ({ a, b }) => a + b,
  {
    name: "add_two_number",
    description: "add two numbers",
    schema: z.object({ a: z.number(), b: z.number() }),
    returnDirect: true, // 是否直接返回工具结果
  }
);
```

## 二、StructuredTool

需要更细粒度控制时，可使用 `StructuredTool.from()`：

```javascript
import { StructuredTool } from "@langchain/core/tools";

const searchTool = StructuredTool.from({
  name: "search",
  description: "检索互联网信息",
  schema: z.object({ query: z.string() }),
  func: async ({ query }) => {
    // 调用搜索 API
    return "搜索结果...";
  },
});
```

## 三、工具属性

| 属性 | 说明 |
|------|------|
| `name` | 工具名称，供模型识别 |
| `description` | 工具描述，帮助模型决定何时调用 |
| `schema` | 参数结构（Zod） |
| `returnDirect` | 为 true 时，工具结果直接作为最终答案返回 |

## 四、工具调用流程

1. 模型根据用户问题判断是否需要调用工具
2. 若需要，返回 `tool_calls`
3. 应用执行工具，得到结果
4. 将结果以 `ToolMessage` 形式回传给模型
5. 模型整合后生成最终回答

## 五、运行示例

```bash
node langchain-tutorial/chapter05-tools/01-custom-tool.js
node langchain-tutorial/chapter05-tools/02-tool-with-model.js
```
