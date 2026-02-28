# Agent Skills（基于 LangChain）

本项目支持 **LangChain/Anthropic 官方 Agent Skills 范式**（操作指南 + 按需加载），并保留 **JS 定义技能 + 工具包** 的扩展方式。

---

## 一、官方范式（推荐）

LangChain 已正式采用由 Anthropic 提出的 [Agent Skills](https://agentskills.io/) 规范：技能 = **「操作指南 + 可选脚本/资源」**，存放在本地文件系统，**不占用提示词上下文**，Agent 根据任务**动态加载**对应技能。

### 核心逻辑

- **Skill** 是给 AI 的「操作手册」：包含技能说明、执行步骤与可选脚本（如处理 PDF、数据分析）。
- **渐进式披露（Progressive disclosure）**：
  1. **启动时**：只加载所有 SKILL.md 的 **YAML frontmatter**（name、description）→ 约 100 tokens，省 Token、低认知负担。
  2. **匹配任务时**：Agent 判断某技能适用后，再通过 **read_skill** 工具读取该技能的 **完整 SKILL.md 正文**，按指南执行。

### 规范与目录结构

遵循 [Agent Skills 规范](https://agentskills.io/specification)：

- 每个技能是一个**目录**，至少包含 **SKILL.md**。
- SKILL.md：**YAML frontmatter**（必填 `name`、`description`）+ **Markdown 正文**（操作步骤、示例等）。
- 可选：`scripts/`、`references/`、`assets/` 等子目录，在 SKILL.md 中通过相对路径引用。

```
skills/
├── code-review/
│   └── SKILL.md
├── langgraph-docs/
│   └── SKILL.md
└── my-skill/
    ├── SKILL.md
    └── scripts/
        └── helper.py
```

### 快速落地（本仓库）

1. **创建技能目录**：在项目根目录下建 `skills/`，每个子目录一个技能。
2. **添加 SKILL.md**：参考 `skills/code-review/SKILL.md`、`skills/langgraph-docs/SKILL.md`，写 frontmatter + 正文。
3. **运行 Demo**：`npm run demo:skills-fs` 或 `node demo/07-agent-skills-fs.js [你的问题]`，Agent 会只加载 frontmatter，需要时再通过 read_skill 加载完整指南。

### 与 DeepAgents CLI 的对应关系

- **DeepAgents CLI**（Python）：`deepagents skills list`、技能目录 `~/.deepagents/agent/skills/` 或 `<project>/.deepagents/skills/`，3 步即可添加技能。
- **本仓库（JS）**：使用同一套 SKILL.md 格式与渐进式披露思路，通过 `lib/skills-fs.js` 与 `read_skill` 工具在 LangChain.js 中实现，技能目录默认为项目根下 `skills/`。

---

## 二、Tool Router（开发者首选，可定制）

核心依赖 **Tools 组件** 与 **Tool Router 组件**，实现步骤简洁，支持自定义匹配规则。

### ① 预设 Skill 描述

为每个自定义或内置 Skill 编写清晰描述（含关键词、适用场景），便于路由匹配。例如为「PDF 解析」技能写：

```yaml
description: 用于解析 PDF 文件，提取文本、表格数据，适配 LangChain 框架，支持与数据分析 Skill 协同。
```

文件系统技能已在各 `SKILL.md` 的 frontmatter 中写 `name`、`description` 即可。

### ② 配置 Tool Router

通过代码配置 Tool Router：选择**匹配策略**（`keyword` 关键词匹配 / `semantic` 语义匹配）、**匹配阈值**（如 ≥ 0.85 才加载技能）。

```javascript
import { route } from "./lib/tool-router.js";

const result = await route(skillsMeta, userInput, {
  strategy: "keyword",   // 或 "semantic"（需传入 embeddings）
  threshold: 0.85,
  topK: 3,               // 可选：最多返回 3 个技能
  embeddings,            // 语义匹配时必传（如 OllamaEmbeddings）
});
// result.selected、result.scores、result.strategy
```

### ③ 输入处理与匹配

用户输入后，可用 LangChain 的 **PromptTemplate** 预处理需求（如整理为「用户需求：{input}」或交给 LLM 提取意图），再交给 Tool Router 解析关键词或计算语义相似度，筛选并加载最优 Skill。

```javascript
import { PromptTemplate } from "@langchain/core/prompts";

const template = PromptTemplate.fromTemplate("用户需求：{input}");
const preprocessed = await template.format({ input: userInput });
const { selected } = await route(skillsMeta, preprocessed, { strategy: "keyword", threshold: 0.85 });
```

### ④ 验证调整

结合状态管理（或在 Demo 中简单实现）：若本次未匹配到任何技能，可**自动降低阈值**重新匹配；若需更细控制，可结合 **LangGraph** 将「路由 → Agent → 验证 → 重匹配」做成图，匹配失误时自动触发重新匹配逻辑。

Demo `08-agent-skills-routed.js` 中：当 `selected.length === 0` 且阈值 > 0.2 时，自动以 `threshold - 0.3` 再跑一次路由。

### 运行 Demo（Tool Router）

```bash
# 默认关键词匹配，阈值 0.5
npm run demo:skills-routed
node demo/08-agent-skills-routed.js "审查这段代码 function add(a,b){ return a+b }"

# 环境变量：匹配策略与阈值
# Windows PowerShell:
$env:SKILL_ROUTER_STRATEGY="keyword"; $env:SKILL_ROUTER_THRESHOLD="0.85"; node demo/08-agent-skills-routed.js "你的问题"
# Linux/macOS:
SKILL_ROUTER_STRATEGY=semantic SKILL_ROUTER_THRESHOLD=0.85 node demo/08-agent-skills-routed.js "你的问题"
```

语义匹配需本地 Ollama 拉取嵌入模型：`ollama pull nomic-embed-text`。

---

## 四、本仓库实现的两种模式

### 模式 A：文件系统 Skills（官方范式）

- **加载**：`loadSkillsFromDir("skills")` → 仅解析每个 SKILL.md 的 frontmatter，得到 `[{ name, description, dirPath }]`。
- **System 提示**：`getFilesystemSkillsSystemPrompt(skillsMeta)` → 列出技能名与描述，并说明「需要时请先调用 read_skill」。
- **按需加载**：工具 `createReadSkillTool(skillsMeta)`，Agent 调用 `read_skill(skill_name)` 获取 SKILL.md 正文，再按指南执行。
- **Demo**：`demo/07-agent-skills-fs.js`。

### 模式 B：JS 定义技能（工具包）

- **定义**：在 `lib/skills/` 下用 JS 定义 `{ name, description, tools[] }`，每个 tool 为 LangChain Tool。
- **合并**：`getToolsFromSkills(skills)`、`buildSystemPromptWithSkills(skills, basePrompt)`。
- **Demo**：`demo/06-agent-skills.js`，例如 `node demo/06-agent-skills.js calculator search`。

---

## 五、使用方式

### 文件系统 Skills（推荐）

```bash
# 确保存在 skills/ 目录及 SKILL.md
npm run demo:skills-fs

# 自定义问题
node demo/07-agent-skills-fs.js "请用 langgraph-docs 技能简单介绍 LangGraph"
```

在代码中：

```javascript
import { loadSkillsFromDir, getFilesystemSkillsSystemPrompt, createReadSkillTool } from "./lib/agent-skills.js";

const skillsMeta = await loadSkillsFromDir("skills");
const systemPrompt = "你是多技能助手。" + getFilesystemSkillsSystemPrompt(skillsMeta);
const readSkillTool = createReadSkillTool(skillsMeta);

// 将 readSkillTool 与 createReactAgent 等配合使用
```

### JS 技能（工具包）

```bash
npm run demo:skills
node demo/06-agent-skills.js calculator search
```

---

## 六、SKILL.md 编写要点（规范）

- **name**：小写、连字符、与目录名一致，最长 64 字符。
- **description**：明确「做什么」和「何时使用」，含关键词，最长 1024 字符，便于 Agent 匹配任务。
- **正文**：步骤、示例、边界情况；建议 SKILL.md 控制在 500 行以内，详细内容放到 `references/` 等并在正文中引用。

详见 [agentskills.io/specification](https://agentskills.io/specification)。

---

## 七、参考

| 内容           | 路径 |
|----------------|------|
| 文件系统加载   | `lib/skills-fs.js` |
| 技能合并与提示 | `lib/agent-skills.js` |
| **Tool Router** | `lib/tool-router.js`（关键词/语义匹配、阈值） |
| 示例 SKILL.md  | `skills/code-review/SKILL.md`、`skills/langgraph-docs/SKILL.md` |
| 文件系统 Demo  | `demo/07-agent-skills-fs.js` |
| **路由 Demo**  | `demo/08-agent-skills-routed.js` |
| JS 技能 Demo   | `demo/06-agent-skills.js`、`lib/skills/*.js` |

- 规范与最佳实践：[Agent Skills 规范](https://agentskills.io/specification)  
- LangChain 文档：[Deep Agents Skills](https://docs.langchain.com/oss/python/deepagents/skills)、[Using skills with Deep Agents](https://blog.langchain.com/using-skills-with-deep-agents/)
