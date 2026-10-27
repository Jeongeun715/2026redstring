import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

// Next 서버 경로를 실제 컴파일해 응답과 Supabase 요청 경계를 검사합니다.
const root = path.resolve(import.meta.dirname, '..');
const compiled = await mkdtemp(path.join(tmpdir(), 'redstring-flowers-'));
for (const file of ['app/api/flowers/route.ts', 'app/data/site.ts', 'lib/supabase-rest.ts']) {
  const source = await readFile(path.join(root, file), 'utf8');
  let js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  js = js.replace(/(from\s+["'])(\.{1,2}\/[^"']+)(["'])/g, (_, a, b, c) => a + b + '.js' + c);
  const target = path.join(compiled, file.replace(/\.ts$/, '.js'));
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, js);
}
await writeFile(path.join(compiled, 'package.json'), '{"type":"module"}');
const route = await import(pathToFileURL(path.join(compiled, 'app/api/flowers/route.js')));
const body = { memberId: 'bass-1', requestId: '11111111-1111-4111-8111-111111111111' };
const request = (value = body, origin = 'https://redstring.example') => new Request('https://redstring.example/api/flowers', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(value),
});
try {
  await test('꽃 통계 조회 경로를 공개하지 않음', () => { assert.equal(route.GET, undefined); });
  await test('다른 사이트 요청·없는 멤버·잘못된 요청 ID를 DB 호출 전에 차단', async () => {
    assert.equal((await route.POST(request(body, 'https://other.example'))).status, 403);
    assert.equal((await route.POST(request({ ...body, memberId: 'fake' }))).status, 400);
    assert.equal((await route.POST(request({ ...body, requestId: 'bad' }))).status, 400);
    assert.equal((await route.POST(request(null))).status, 400);
  });
  await test('서버 키로만 저장하고 관객에게 횟수·키를 반환하지 않음', async () => {
    const previousFetch = globalThis.fetch;
    const previousURL = process.env.SUPABASE_URL, previousKey = process.env.SUPABASE_SECRET_KEY;
    process.env.SUPABASE_URL = 'https://test.supabase.co'; process.env.SUPABASE_SECRET_KEY = 'sb_secret_unit_test';
    let called = false;
    globalThis.fetch = async (url, init) => {
      called = true;
      assert.equal(url, 'https://test.supabase.co/rest/v1/rpc/redstring_send_flower');
      assert.equal(init.headers.get('apikey'), 'sb_secret_unit_test');
      assert.deepEqual(JSON.parse(init.body), { p_member_id: body.memberId, p_request_id: body.requestId });
      return Response.json(true);
    };
    try {
      const response = await route.POST(request());
      assert.equal(response.status, 200); assert.ok(called);
      assert.deepEqual(await response.json(), { ok: true });
      globalThis.fetch = async () => { throw new Error('private database detail'); };
      const failed = await route.POST(request());
      assert.equal(failed.status, 503); assert.deepEqual(await failed.json(), { ok: false });
    } finally {
      globalThis.fetch = previousFetch;
      if (previousURL === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = previousURL;
      if (previousKey === undefined) delete process.env.SUPABASE_SECRET_KEY; else process.env.SUPABASE_SECRET_KEY = previousKey;
    }
  });
} finally { await rm(compiled, { recursive: true, force: true }); }
