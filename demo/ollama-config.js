/**
 * 本地 Ollama 模型配置
 * 使用前请确保已安装并运行 Ollama，且已拉取对应模型：
 *   ollama pull qwen3-coder:480b-cloud
 */

export const OLLAMA_MODEL = "qwen3-coder:480b-cloud";

/** Ollama 服务地址，默认本机 11434 */
export const OLLAMA_BASE_URL ="http://localhost:11434";
