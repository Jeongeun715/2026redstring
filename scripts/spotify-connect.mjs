// 로컬에서 한 번 실행하는 Spotify PKCE 인증. Client Secret은 사용하지 않습니다.
import { createServer } from 'node:http';
import { randomBytes, createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
const prompts = createInterface({ input: process.stdin, output: process.stdout });
const clientId = (await prompts.question('Spotify 앱의 Client ID: ')).trim();
const playlistInput = (await prompts.question('플레이리스트 URL 또는 ID: ')).trim();
prompts.close();
const playlistId = playlistInput.match(/playlist[/:]([a-zA-Z0-9]{22})/)?.[1] || playlistInput;
if (!/^[a-zA-Z0-9]{32}$/.test(clientId) || !/^[a-zA-Z0-9]{22}$/.test(playlistId)) throw new Error('Client ID / 플레이리스트 ID를 확인하세요.');
const redirect = 'http://127.0.0.1:8888/callback';
const verifier = randomBytes(48).toString('base64url');
const challenge = createHash('sha256').update(verifier).digest('base64url');
const state = randomBytes(24).toString('hex');
const authorize = new URL('https://accounts.spotify.com/authorize');
authorize.search = new URLSearchParams({ client_id: clientId, response_type: 'code', redirect_uri: redirect, scope: 'playlist-read-private playlist-read-collaborative', code_challenge_method: 'S256', code_challenge: challenge, state }).toString();
const path = fileURLToPath(new URL('../.env.local', import.meta.url));
let handled = false;
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', redirect);
  if (url.pathname !== '/callback') { res.writeHead(404).end(); return; }
  if (url.searchParams.get('state') !== state || !url.searchParams.get('code')) { res.writeHead(400).end('Authorization was cancelled or invalid.'); return; }
  if (handled) { res.writeHead(409).end('Already processed.'); return; }
  handled = true;
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'authorization_code', code: url.searchParams.get('code'), redirect_uri: redirect, client_id: clientId, code_verifier: verifier }), signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Spotify authorization failed (${response.status})`);
    const token = await response.json();
    if (!token.refresh_token) throw new Error('Refresh token unavailable');
    let previous = ''; try { previous = await readFile(path, 'utf8'); } catch {}
    const rest = previous.split('\n').filter(line => !/^SPOTIFY_(CLIENT_ID|REFRESH_TOKEN|PLAYLIST_ID)=/.test(line)).join('\n').trimEnd();
    await writeFile(path, `${rest}${rest ? '\n' : ''}SPOTIFY_CLIENT_ID=${JSON.stringify(clientId)}\nSPOTIFY_REFRESH_TOKEN=${JSON.stringify(token.refresh_token)}\nSPOTIFY_PLAYLIST_ID=${JSON.stringify(playlistId)}\n`, { mode: 0o600 });
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end('<h1>Spotify 연결 완료</h1><p>이 창을 닫고 개발 서버를 다시 실행하세요.</p>');
    console.log('연결 정보를 .env.local에 저장했습니다. 개발 서버를 다시 실행하세요. 이 파일은 공유하지 마세요.');
  } catch (error) { res.writeHead(502).end('Could not connect. Try again.'); console.error(error.message); process.exitCode = 1; }
  finally { clearTimeout(timeout); server.close(); }
});
const timeout = setTimeout(() => { console.error('인증 시간이 만료되었습니다. 다시 실행하세요.'); server.close(); process.exitCode = 1; }, 5 * 60 * 1000);
server.listen(8888, '127.0.0.1', () => console.log(`Spotify 대시보드의 Redirect URI에 ${redirect} 를 등록한 뒤, 본인 브라우저에서 다음 주소를 여세요:\n${authorize}`));
