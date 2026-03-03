# lib 脚本说明

本目录为主项目（Express server）的公共逻辑。**上传与读取文件的逻辑**已移至 **langgraph-server**：

- **上传**：`langgraph-server/lib/upload.js` + 上传服务 `npm run upload-server`（端口默认 3024，`POST /upload`）
- **读取**：Agent 工具 `read_file` 在 `langgraph-server/src/agent/tools/read-file.js`，输入为文件路径（相对 `langgraph-server/uploads`）

详见 [langgraph-server/README.md](../langgraph-server/README.md) 中「上传与读取文件」一节。
