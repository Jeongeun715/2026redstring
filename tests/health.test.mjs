import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');
const compiled = await mkdtemp(path.join(tmpdir(), 'redstring-health-'));
for (const file of ['app/api/health/route.ts', 'lib/supabase-rest.ts']) {
  let js = ts.transpileModule(await readFile(path.join(root, file), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
  js = js.replace(/(from\s+["'])(\.{1,2}\/[^"']+)(["'])/g, (_, a, b, c) => a + b + '.js' + c);
  const target = path.join(compiled, file.replace(/\.ts$/, '.js'));
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, js);
}
await writeFile(path.join(compiled, 'package.json'), '{"type":"module"}');
const { GET } = await import(pathToFileURL(path.join(compiled, 'app/api/health/route.js')));
const names = ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SECRET_KEY'];
const originalEnv = Object.fromEntries(names.map(name => [name, process.env[name]]));
const originalFetch = globalThis.fetch;
const configured = () => {
  process.env.SUPABASE_URL = 'https://private-project.supabase.co';
  process.env.SUPABASE_SECRET_KEY = 'sb_secret_private_health_test';
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
};
try {
  await test('연결값 누락과 잘못된 URL을 DB 요청 전에 구분', async () => {
    for (const name of names) delete process.env[name];
    globalThis.fetch = async () => { throw new Error('must not fetch'); };
    assert.equal((await (await GET()).json()).reason, 'missing_environment_variables');
    configured(); process.env.SUPABASE_URL = 'invalid project URL';
    const data = await (await GET()).json();
    assert.equal(data.reason, 'invalid_project_url');
    assert.equal(data.failed_at, 'configuration');
  });
  await test('인증 실패와 권한 부족을 구분하고 비밀 응답을 제외', async () => {
    configured();
    globalThis.fetch = async () => Response.json({ code: 'sb_secret_should_never_escape', message: process.env.SUPABASE_SECRET_KEY }, { status: 401 });
    const response = await GET(); const data = await response.json();
    assert.equal(response.status, 503);
    assert.equal(data.reason, 'authentication_failed');
    assert.equal(data.upstream_status, 401);
    assert.equal(data.error_code, null);
    assert.equal(data.diagnostic_version, 2);
    assert.ok(!JSON.stringify(data).includes('sb_secret_'));
    assert.ok(!JSON.stringify(data).includes('private-project'));
    globalThis.fetch = async () => Response.json({ code: '42501', details: 'private database data' }, { status: 401 });
    assert.equal((await (await GET()).json()).reason, 'permission_denied');
  });
  await test('두 번째 테이블 실패를 찾고 성공 응답은 그대로 유지', async () => {
    configured(); let calls = 0;
    globalThis.fetch = async () => ++calls === 1 ? Response.json([]) : Response.json({ code: 'PGRST205', message: 'secret table details' }, { status: 404 });
    const data = await (await GET()).json();
    assert.equal(data.failed_at, 'spotify_tokens');
    assert.equal(data.reason, 'table_missing');
    assert.equal(data.error_code, 'PGRST205');
    globalThis.fetch = async () => Response.json([]);
    assert.deepEqual(await (await GET()).json(), { ok: true, database: 'connected' });
  });
  await test('네트워크·시간 초과·서버 장애의 응답에 URL이나 원문을 넣지 않음', async () => {
    configured();
    for (const [name, expected] of [['TypeError', 'request_failed'], ['TimeoutError', 'request_timeout']]) {
      globalThis.fetch = async () => { const error = new Error('private URL and key'); error.name = name; throw error; };
      const data = await (await GET()).json(); assert.equal(data.reason, expected);
      assert.ok(!JSON.stringify(data).includes('private URL'));
    }
    globalThis.fetch = async () => new Response('private upstream page', { status: 503 });
    assert.equal((await (await GET()).json()).reason, 'supabase_unavailable');
  });
} finally {
  globalThis.fetch = originalFetch;
  for (const name of names) { if (originalEnv[name] === undefined) delete process.env[name]; else process.env[name] = originalEnv[name]; }
  await rm(compiled, { recursive: true, force: true });
}
