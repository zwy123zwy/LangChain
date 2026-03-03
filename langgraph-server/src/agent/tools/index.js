/**
 * Agent 工具集入口：从各工具文件汇总并导出 tools 数组，供 graph 使用。
 */
import { getWeather } from "./get-weather.js";
import { addNumber } from "./add-number.js";
import { readFile } from "./read-file.js";

export { getWeather } from "./get-weather.js";
export { addNumber } from "./add-number.js";
export { readFile } from "./read-file.js";

export const tools = [getWeather, addNumber, readFile];
