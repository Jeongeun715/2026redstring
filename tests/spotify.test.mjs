import test from 'node:test';
import assert from 'node:assert/strict';
import { readSpotifyPlaylist, toSong } from '../app/api/setlist/spotify.ts';
const config = { clientId: 'example', refreshToken: 'initial-test-token', playlistId: '1234567890123456789012' };
const track = (id, name) => ({ type: 'track', id, name, artists: [{name:'테스트 아티스트'}] });
test('Spotify item 응답·페이지 순서·새 refresh token 저장', async () => {
  const calls = []; const saved = [];
  const fetcher = async (url, init) => {
    calls.push([String(url), init]);
    if (calls.length === 1) return Response.json({ access_token:'test-access', refresh_token:'rotated-test-token' });
    if (calls.length === 2) return Response.json({ items:[{item:track('one','첫 곡')},{item:{type:'episode',name:'제외'}}], next:'has-next' });
    return Response.json({ items:[{item:track('two','두 번째 곡')},{item:null}], next:null });
  };
  const songs = await readSpotifyPlaylist(config, { fetcher, saveRefreshToken: async value => saved.push(value) });
  assert.deepEqual(songs.map(s=>s.title), ['첫 곡','두 번째 곡']);
  assert.deepEqual(saved, ['rotated-test-token']);
  assert.equal(new URL(calls[2][0]).searchParams.get('offset'), '2');
  assert.ok(calls[1][0].includes('/items?'));
  assert.equal(calls[1][1].headers.Authorization, 'Bearer test-access');
  assert.equal(calls[0][1].body.get('grant_type'), 'refresh_token');
  assert.equal(songs[0].spotifyUrl, 'https://open.spotify.com/track/one');
});
test('기존 track 응답 호환·null/로컬/에피소드 제외', async () => {
  assert.equal(toSong(null), null);
  assert.equal(toSong({...track('local','local'), is_local:true}), null);
  let count = 0;
  const songs = await readSpotifyPlaylist(config, { fetcher:async () => ++count === 1 ? Response.json({access_token:'test'}) : Response.json({items:[{track:track('legacy','레거시')}],next:null}), saveRefreshToken:async()=>{} });
  assert.equal(songs[0].title, '레거시');
});
for (const status of [401,403,429,500]) test(`Spotify ${status}에서 반복 호출하지 않고 실패 반환`, async () => {
  let calls = 0;
  await assert.rejects(() => readSpotifyPlaylist(config, {fetcher:async()=> ++calls === 1 ? Response.json({access_token:'test'}) : new Response('', {status}), saveRefreshToken:async()=>{}}));
  assert.equal(calls, 2);
});
test('인증 실패·빈 플레이리스트는 대체 목록을 선택할 수 있게 실패 반환', async () => {
  await assert.rejects(() => readSpotifyPlaylist(config, {fetcher:async()=>new Response('', {status:400}),saveRefreshToken:async()=>{}}));
  let count = 0;
  await assert.rejects(() => readSpotifyPlaylist(config, {fetcher:async()=>++count === 1 ? Response.json({access_token:'test'}) : Response.json({items:[],next:null}),saveRefreshToken:async()=>{}}));
});
