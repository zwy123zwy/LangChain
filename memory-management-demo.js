/**
 * 记忆管理演示：如何在实际应用中保存记忆并区分不同用户的记忆
 * 
 * 在LangChain中，记忆的存储和用户区分主要通过以下方式实现：
 * 1. 使用会话ID（sessionId）来区分不同用户的记忆
 * 2. 使用RunnableWithMessageHistory来管理带有记忆的运行链
 * 3. 使用内存存储或持久化存储来保存对话历史
 */

import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatMessageHistory } from "@langchain/core/chat_history";
import { RunnableWithMessageHistory } from "@langchain/core/runnables/history";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

// 模拟内存存储，实际应用中可能会使用Redis、数据库或其他持久化存储
const store = {};

// 创建一个简单的聊天模型
const model = new ChatOllama({
  model: "qwen3-coder:480b-cloud",
  baseUrl: "http://localhost:11434",
  temperature: 0.7,
});

// 定义提示模板
const prompt = PromptTemplate.fromTemplate(
  "你是一个乐于助人的AI助手。请根据以下对话历史回答问题：\n\n{chat_history}\n\n用户问题：{input}"
);

// 创建输出解析器
const outputParser = new StringOutputParser();

// 创建主链
const chain = prompt.pipe(model).pipe(outputParser);

// 获取指定sessionId的记忆历史
const getMessageHistory = async (sessionId) => {
  if (sessionId === undefined) {
    throw new Error("sessionId cannot be undefined");
  }

  // 如果该sessionId不存在，则创建一个新的ChatMessageHistory实例
  if (store[sessionId] === undefined) {
    store[sessionId] = new ChatMessageHistory();
  }

  return store[sessionId];
};

// 创建带有记忆的运行链
const chainWithMessageHistory = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory,
  inputMessagesKey: "input",
  historyMessagesKey: "chat_history",
});

console.log("=== 记忆管理演示：区分不同用户对话 ===\n");

// 模拟第一个用户的对话
console.log("【用户A开始对话】");
await chainWithMessageHistory.invoke(
  { input: "我叫张三，请记住我的名字。" },
  { configurable: { sessionId: "user-A" } }
);
console.log("模型回复: 我已经记住了你的名字是张三。\n");

await chainWithMessageHistory.invoke(
  { input: "我叫什么名字？" },
  { configurable: { sessionId: "user-A" } }
);
console.log("模型回复: 你的名字是张三。\n");

// 模拟第二个用户的对话
console.log("【用户B开始对话】");
await chainWithMessageHistory.invoke(
  { input: "我叫李四，我是程序员。" },
  { configurable: { sessionId: "user-B" } }
);
console.log("模型回复: 好的，我知道你叫李四，是一名程序员。\n");

await chainWithMessageHistory.invoke(
  { input: "我叫什么名字？" },
  { configurable: { sessionId: "user-B" } }
);
console.log("模型回复: 你的名字是李四。\n");

// 再次询问用户A的问题，确认记忆不会混淆
console.log("【用户A继续对话】");
await chainWithMessageHistory.invoke(
  { input: "我叫什么名字？" },
  { configurable: { sessionId: "user-A" } }
);
console.log("模型回复: 你的名字是张三。\n");

// 检查存储中的数据
console.log("=== 存储中的记忆信息 ===");
Object.keys(store).forEach(sessionId => {
  console.log(`Session ${sessionId}:`);
  console.log(`  消息数量: ${store[sessionId].messages.length}`);
  store[sessionId].messages.forEach((msg, idx) => {
    const msgType = msg._getType() === "human" ? "用户" : "AI";
    console.log(`  [${idx + 1}] ${msgType}: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`);
  });
  console.log("");
});

console.log("=== 不同类型的记忆组件 ===\n");

// 展示不同记忆类型的用途
console.log("1. ChatMessageHistory:");
console.log("   - 最基本的记忆组件");
console.log("   - 用于存储特定会话的聊天消息");
console.log("   - 适合短期记忆，存储在内存中\n");

console.log("2. BufferMemory / BufferWindowMemory:");
console.log("   - 将对话历史转换为字符串格式");
console.log("   - BufferWindowMemory 可限制历史消息的数量\n");

console.log("3. SummaryMemory / SummaryBufferMemory:");
console.log("   - 用AI总结长对话历史，节省token");
console.log("   - 适合长时间、多轮次的对话\n");

console.log("4. TokenBufferMemory:");
console.log("   - 基于token数量限制对话历史长度");
console.log("   - 避免超出模型的最大上下文限制\n");

console.log("5. EntityMemory:");
console.log("   - 提取和跟踪对话中涉及的实体信息");
console.log("   - 例如：记住用户姓名、偏好、地理位置等\n");

console.log("=== 实际应用建议 ===\n");

console.log("1. 会话管理:");
console.log("   - 为每个用户/会话分配唯一的sessionId");
console.log("   - 可以基于用户ID、设备ID或会话令牌生成\n");

console.log("2. 存储策略:");
console.log("   - 短期记忆：使用内存存储（如上面的store对象）");
console.log("   - 长期记忆：使用Redis、数据库或其他持久化存储\n");

console.log("3. 数据清理:");
console.log("   - 定期清理过期的会话数据");
console.log("   - 设置合理的过期时间（TTL）\n");

console.log("4. 隐私保护:");
console.log("   - 敏感信息应加密存储");
console.log("   - 遵循数据保护法规，提供数据删除选项\n");