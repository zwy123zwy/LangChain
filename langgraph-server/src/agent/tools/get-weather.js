/**
 * 工具：按城市查询天气（模拟）
 */
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const getWeather = tool(
  async ({ city }) => {
    const mock = { 北京: "晴 25°C", 上海: "多云 22°C", 东京: "阴 20°C" };
    return mock[city] || `${city}：天气数据暂无`;
  },
  {
    name: "get_weather",
    description: "根据城市名称查询该城市当前天气",
    schema: z.object({ city: z.string().describe("城市名称") }),
  }
);
