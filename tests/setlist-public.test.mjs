import test from 'node:test';
import assert from 'node:assert/strict';
import { publicSetlist } from '../lib/setlist-public.ts';
import { songs } from '../app/data/site.ts';

test('비공개 앵콜은 곡명·가수·재생 주소 없이 반환', () => {
  const result = publicSetlist(songs, songs);
  assert.equal(result.length, 12);
  assert.deepEqual(result.at(-1), { title: '???', query: '', encore: true, hidden: true });
  assert.equal(songs.at(-1).spotifyUrl, undefined);
  assert.equal(songs.at(-1).artist, undefined);
});
test('Spotify 자동 목록의 12번 이후 메타데이터도 공개하지 않음', () => {
  const remote = Array.from({ length: 15 }, (_, i) => ({
    title: i < 11 ? `공개 ${i}` : `SECRET_TITLE_${i}`,
    artist: i < 11 ? '공개 가수' : 'SECRET_ARTIST', query: '검색', spotifyUrl: `https://open.spotify.com/track/${i}`,
  }));
  const result = publicSetlist(remote, songs);
  assert.equal(result.length, 12);
  assert.equal(JSON.stringify(result).includes('SECRET_'), false);
  assert.equal(JSON.stringify(result).includes('/track/11'), false);
});
test('원곡 Spotify 제목이 달라도 ID로 공연 제목·RS 편곡 표시를 유지', () => {
  const local = songs.find(song => song.title === '홍연');
  const result = publicSetlist([{ title: 'The Red Knot', artist: 'Ahn Ye Eun', query: '', spotifyUrl: local.spotifyUrl }], songs);
  assert.equal(result[0].title, '홍연');
  assert.equal(result[0].tag, 'RS ver.');
});
