
import 'dotenv/config';
import { ChatOllama } from '@langchain/ollama';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { OLLAMA_MODEL, OLLAMA_BASE_URL } from '../../demo/ollama-config.js';
async function main() {
    const model = new ChatOllama({
        model: OLLAMA_MODEL,
        baseUrl: OLLAMA_BASE_URL,
        temperature: 0.7,
    });
    
    const SYSTEM_PROMPT = `You are a helpful assistant.`;
    const USER_INPUT = `What is LangChain?`;
    const messages = [
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(USER_INPUT),
    ];
    const response = await model.invoke(messages);
    console.log(response.content);
}

main().catch(console.error);

