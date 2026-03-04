import "dotenv/config";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// configuration via env
const SEARX_BASE = process.env.SEARX_BASE || "https://searxng.org";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3-coder:480b-cloud";
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

// a simple wrapper around SearxNG search API
const searxTool = tool(
    async ({ q }) => {
        const url = new URL("/search", SEARX_BASE);
        url.searchParams.set("q", q);
        url.searchParams.set("format", "json");
        try {
            const res = await fetch(url.toString());
            if (!res.ok) throw new Error(`searx response ${res.status}`);
            const body = await res.json();
            // return top results as plain text
            const results = body.results || [];
            if (results.length === 0) return `没有搜索结果。`;
            return results
                .slice(0, 5)
                .map((r, i) => `${i + 1}. ${r.title} - ${r.url}`)
                .join("\n");
        } catch (e) {
            return `搜索失败：${e.message}`;
        }
    },
    {
        name: "searx_search",
        description: "在 SearxNG 实例上执行实时网络搜索，返回前几个结果的标题和链接。参数 { q: string }",
        schema: z.object({ q: z.string() }),
    }
);

async function main() {
    const query = process.argv.slice(2).join(" ").trim();
    if (!query) {
        console.log("用法：node demo/10-searxng-agent.js <搜索词>");
        process.exit(1);
    }

    const model = new ChatOllama({ model: OLLAMA_MODEL, baseUrl: OLLAMA_BASE_URL, temperature: 0 });
    const agent = createReactAgent({ llm: model, tools: [searxTool] });

    console.log("SearxNG base:", SEARX_BASE);
    console.log("搜索: ", query);

    const instr = `请使用 searx_search 工具检索网络关于：${query}，并用中文总结前3个结果标题和链接。`;

    const result = await agent.invoke({ messages: [new HumanMessage(instr)] });
    const last = result.messages[result.messages.length - 1];
    console.log("\n--- Agent 输出 ---\n");
    console.log(String(last.content ?? last));
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
