// Next.js 개발 서버. 미리보기 도구의 --host/--strictPort 인수도 받아 처리합니다.
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
const require = createRequire(import.meta.url);
const args = process.argv.slice(2).filter(arg => arg !== "--strictPort").map(arg => arg === "--host" ? "--hostname" : arg);
const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "dev", "--webpack", ...args], { stdio: "inherit" });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("error", error => { console.error(error.message); process.exitCode = 1; });
child.on("exit", code => { process.exitCode = code ?? 0; });
