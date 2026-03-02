/**
 * 停止占用 2024 端口的进程（LangGraph 服务常用端口）
 * Windows: netstat + taskkill；Unix: lsof + kill
 * 使用：node scripts/stop-port-2024.js  或  npm run stop:2024
 */
import { execSync } from "child_process";
import { platform } from "os";

const PORT = 2024;

function stopPort(port) {
  const isWin = platform() === "win32";
  try {
    if (isWin) {
      let out;
      try {
        out = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
        });
      } catch (_) {
        console.log(`端口 ${port} 上没有发现监听进程。`);
        return;
      }
      const line = out.trim().split(/\r?\n/)[0];
      if (!line) {
        console.log(`端口 ${port} 上没有发现监听进程。`);
        return;
      }
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (!pid || isNaN(Number(pid))) {
        console.log(`无法从 netstat 输出解析 PID: ${line}`);
        return;
      }
      execSync(`taskkill /PID ${pid} /F`, { stdio: "inherit" });
      console.log(`已终止端口 ${port} 上的进程 (PID ${pid})。`);
    } else {
      const out = execSync(`lsof -ti :${port}`, { encoding: "utf8" });
      const pids = out.trim().split(/\s+/).filter(Boolean);
      if (pids.length === 0) {
        console.log(`端口 ${port} 上没有发现监听进程。`);
        return;
      }
      execSync(`kill -9 ${pids.join(" ")}`, { stdio: "inherit" });
      console.log(`已终止端口 ${port} 上的进程 (PID ${pids.join(", ")})。`);
    }
  } catch (e) {
    if (e.status === 1 && e.stdout === "" && e.stderr === "") {
      console.log(`端口 ${port} 上没有发现监听进程。`);
      return;
    }
    throw e;
  }
}

stopPort(PORT);
