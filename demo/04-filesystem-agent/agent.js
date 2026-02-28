/**
 * 文件系统 Agent Demo
 * 使用本地 Ollama 模型 + 文件系统工具，根据用户指令对沙箱目录进行读/写/创建/删除。
 *
 * 运行：在项目根目录执行
 *   node demo/04-filesystem-agent/agent.js
 * 或：npm run demo:filesystem
 *
 * 前置：Ollama 已运行并拉取模型；沙箱目录默认为 demo/04-filesystem-agent/workspace
 */

import "dotenv/config";
import { fileURLToPath } from "url";
import path from "path";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { allTools, getToolsMap, BASE_PATH } from "./tools.js";

const { OLLAMA_MODEL, OLLAMA_BASE_URL } = await import("../ollama-config.js");

const SYSTEM_PROMPT = `你是一个文件系统助手。你只能通过工具对「沙箱目录」内的文件和文件夹进行操作。
沙箱路径：${BASE_PATH}

可用工具：
- list_directory：列出目录内容（参数 dirPath 可为 '.' 或相对路径）
- read_file：读取文件内容（参数 filePath）
- write_file：写入或覆盖文件（参数 filePath, content）
- create_directory：创建目录（参数 dirPath，可递归创建）
- delete_file：删除文件（参数 filePath）
- delete_directory：删除目录（参数 dirPath；recursive 为 true 时递归删除）

根据用户请求选择合适的工具并执行。若需要多步操作，请依次调用工具。
用中文简洁回复用户，并说明你执行了哪些操作。`;

async function runAgent(userInput) {
  const model = new ChatOllama({
    model: OLLAMA_MODEL,
    baseUrl: OLLAMA_BASE_URL,
    temperature: 0,
  });
  const modelWithTools = model.bindTools(allTools);
  const toolsMap = getToolsMap();

  const messages = [
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(userInput),
  ];

  let maxRounds = 10;
  let lastResponse;

  while (maxRounds-- > 0) {
    lastResponse = await modelWithTools.invoke(messages);
    const toolCalls = lastResponse.tool_calls || [];

    if (toolCalls.length === 0) {
      return lastResponse.content;
    }

    const nextMessages = [...messages, lastResponse];

    for (const tc of toolCalls) {
      const tool = toolsMap[tc.name];
      if (!tool) {
        nextMessages.push(
          new ToolMessage({
            content: `未知工具: ${tc.name}`,
            tool_call_id: tc.id,
          })
        );
        continue;
      }
      try {
        const result = await tool.invoke(tc.args);
        nextMessages.push(
          new ToolMessage({
            content: String(result),
            tool_call_id: tc.id,
          })
        );
      } catch (err) {
        nextMessages.push(
          new ToolMessage({
            content: `错误: ${err.message}`,
            tool_call_id: tc.id,
          })
        );
      }
    }

    messages.length = 0;
    messages.push(...nextMessages);
  }

  return lastResponse?.content ?? "达到最大轮数，未完成。";
}

export { runAgent };

const __filename = fileURLToPath(import.meta.url);
const isMain = process.argv[1] && path.resolve(process.argv[1]) === __filename;

async function main() {
  const userQuery =
    process.argv.slice(2).join(" ").trim() ||
    "请在沙箱里创建一个 hello 目录，并在其中创建一个 world.txt 文件，内容写 Hello from Filesystem Agent。然后列出 hello 目录的内容。";

  console.log("沙箱目录:", BASE_PATH);
  console.log("用户指令:", userQuery);
  console.log("\n--- Agent 回复 ---\n");

  const answer = await runAgent(userQuery);
  console.log(answer);
}

if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
