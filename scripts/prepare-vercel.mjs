// 이전 Cloudflare 버전 폴더에 덮어쓴 경우에만 오래된 설정 파일을 정리합니다.
import { readFile, rm, copyFile } from 'node:fs/promises';
import { constants } from 'node:fs';
const project = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
if (project.name !== 'red-string-vercel-supabase') throw new Error('Vercel 버전의 package.json이 있는 폴더에서 실행하세요.');
const files = ['pnpm-lock.yaml','pnpm-workspace.yaml','vite.config.ts','drizzle.config.ts','cloudflare-env.d.ts','editor-db.jsonc','.openai/hosting.json'];
for (const file of files) await rm(new URL(`../${file}`, import.meta.url), {force:true});
try { await copyFile(new URL('../.env.example', import.meta.url), new URL('../.env.local', import.meta.url), constants.COPYFILE_EXCL); } catch (error) { if (error.code !== 'EEXIST') throw error; }
console.log('Vercel 설정을 준비했습니다. .env.local에 Supabase URL과 Secret key를 입력하세요. 기존 .git과 연결 정보는 보존합니다.');
