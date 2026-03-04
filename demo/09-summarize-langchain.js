import "dotenv/config";
import path from "path";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { loadSkillsFromDir, getFilesystemSkillsSystemPrompt } from "../lib/agent-skills.js";
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from "./ollama-config.js";
import { exec as _exec } from "child_process";
import { promisify } from "util";

const exec = promisify(_exec);
const SKILLS_DIR = path.resolve(process.cwd(), "skills");

async function main() {
    const userInput = process.argv.slice(2).join(" ").trim();
    if (!userInput) {
        console.log("用法: node demo/09-summarize-langchain.js <URL|本地文件路径>");
        process.exit(1);
    }

    const skillsMeta = await loadSkillsFromDir(SKILLS_DIR);
    const summarizeMeta = skillsMeta.find((s) => s.name === "summarize");
    if (!summarizeMeta) {
        console.error("未在 skills/ 下找到 summarize 技能。请先确保已将 summarize 放入 skills/ 目录。");
        process.exit(1);
    }

    const systemPrompt = getFilesystemSkillsSystemPrompt([summarizeMeta]);

    const fetch = globalThis.fetch || (await import('node-fetch')).default;

    const model = new ChatOllama({ model: OLLAMA_MODEL, baseUrl: OLLAMA_BASE_URL, temperature: 0 });

    const summarizeTool = tool(
        async ({ target, options }) => {
            const args = [target];
            if (options) args.push(...options.split(" "));
            // 默认返回 JSON 便于解析
            if (!args.includes("--json")) args.push("--json");
            const cmd = `summarize ${args.map((a) => (a.includes(' ') ? `"${a}"` : a)).join(" ")}`;
            try {
                const { stdout, stderr } = await exec(cmd, { maxBuffer: 10 * 1024 * 1024 });
                if (stderr) console.warn(stderr.toString());
                // 尝试解析 JSON，看是否提取了内容
                try {
                    const parsed = JSON.parse(stdout);
                    const extracted = parsed.extracted;
                    if (extracted && extracted.content && extracted.content.trim()) {
                        return stdout; // 正常返回 CLI JSON
                    }
                    // 内容为空，尝试手动抓取并用模型摘要
                    const url = extracted?.url || target;
                    console.warn("summarize CLI 未提取到内容，尝试直接抓取网页并由模型生成摘要：", url);
                    const res = await fetch(url, { timeout: 30000 });
                    const html = await res.text();
                    // 简单去掉标签
                    const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
                    const summaryPrompt = `请阅读下面的文本并生成简洁摘要：\n\n${text.slice(0, 20000)}`;
                    try {
                      const resp = await model.invoke([
                        new HumanMessage(summaryPrompt),
                      ]);
                      const lastMsg = resp.messages[resp.messages.length - 1];
                      return String(lastMsg?.content ?? lastMsg);
                    } catch (e) {
                      console.warn("模型摘要失败：", e.message);
                      // 如果模型也不行，则直接返回抓取到的纯文本（html已转换）
                      return text || stdout;
                    }
                } catch (e) {
                    // 解析失败，直接返回原始输出
                    return stdout;
                }
            } catch (err) {
                return `ERROR: ${err.message}`;
            }
        },
        {
            name: "summarize_cli",
            description: "调用本地 `summarize` CLI 以对 URL 或本地文件生成摘要/转录。若 CLI 提取失败，则回退抓取网页并调用模型。参数：{ target: string, options?: string }",
            schema: z.object({ target: z.string(), options: z.string().optional() }),
        }
    );

    const agent = createReactAgent({ llm: model, tools: [summarizeTool], prompt: systemPrompt });

    console.log("已启用技能: summarize（summarize_cli 工具）");
    console.log("输入:", userInput);

    const instruction = `请根据输入调用 summarize_cli 工具对以下目标进行摘要或转录：${userInput}。如果需要可传入额外参数（如 --extract-only 或 --length short）。优先返回简洁摘要，若命令返回 JSON 则直接输出该 JSON。`;

    const result = await agent.invoke({ messages: [new HumanMessage(instruction)] });
    const last = result.messages[result.messages.length - 1];
    console.log("\n--- Agent 输出 ---\n");
    console.log(String(last.content ?? last));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
