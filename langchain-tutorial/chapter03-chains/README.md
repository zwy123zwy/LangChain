# 第三章：Chains（链）- JS 版

对应课件：**langchain/01-课件/03-LangChain使用之Chains.pdf**

## 课件与示例对应

| 课件章节 | 内容概要 | 示例文件 |
|----------|----------|----------|
| §1 Chain 基本概念、LCEL | 提示+模型+解析器，管道符 \| | `01-lcel-chain.js` |
| §1.4 使用举例 | 分步调用 vs LCEL 管道、统一 invoke | `01-lcel-chain.js` |
| §2.1 LLMChain | 已弃用，用 prompt.pipe(model) 代替 | `01-lcel-chain.js` |
| §2.2 SimpleSequentialChain | 单输入单输出，剧名→大纲→剧评 | `03-simple-sequential-chain.js` |
| §2.2 举例1 | input 传参，解释→简短总结 | `05-simple-sequential-input-key.js` |
| §2.3 SequentialChain | 多变量、output_key，翻译→总结→语言→评论 | `04-sequential-chain.js` |

## 运行

```bash
# 从项目根目录
node langchain-tutorial/chapter03-chains/01-lcel-chain.js
node langchain-tutorial/chapter03-chains/02-sequential-chain.js
node langchain-tutorial/chapter03-chains/03-simple-sequential-chain.js
node langchain-tutorial/chapter03-chains/04-sequential-chain.js
node langchain-tutorial/chapter03-chains/05-simple-sequential-input-key.js
```

或：`npm run tutorial:03`（默认跑 01-lcel-chain.js）

## 说明

- **LCEL**：JS 中用 `prompt.pipe(model).pipe(parser)`，与 Python 的 `prompt | model | parser` 等价。
- **SimpleSequentialChain / SequentialChain**：LangChain.js 未显式提供这两类，用多条 LCEL 链按顺序 `invoke`，上一步输出作为下一步输入即可实现相同流程。
