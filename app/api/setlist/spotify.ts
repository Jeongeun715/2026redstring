import type { Song } from "../../data/site";

export type SpotifyConfig = { clientId: string; refreshToken: string; playlistId: string; };
export type SpotifyTrack = { type?: string; id?: string; name?: string; artists?: { name?: string; }[]; external_urls?: { spotify?: string; }; is_local?: boolean; };
// 음원·이미지는 저장하지 않고 곡 정보와 Spotify 링크만 반환합니다.
export function toSong(track: SpotifyTrack | null | undefined): Song | null {
  if (!track || track.type !== "track" || !track.id || !track.name || track.is_local) return null;
  const artist = track.artists?.map(a => a.name).filter(Boolean).join(", ") || "";
  return { title: track.name, artist, query: `${track.name} ${artist}`.trim(), spotifyUrl: `https://open.spotify.com/track/${track.id}` };
}
export async function readSpotifyPlaylist(config: SpotifyConfig, options: { fetcher?: typeof fetch; saveRefreshToken: (token: string) => Promise<void>; }) {
  const request = options.fetcher || fetch;
  const auth = await request("https://accounts.spotify.com/api/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: config.refreshToken, client_id: config.clientId }),
    signal: AbortSignal.timeout(8000),
  });
  if (!auth.ok) throw new Error(`Spotify authorization ${auth.status}`);
  const token = await auth.json() as { access_token?: string; refresh_token?: string; };
  if (!token.access_token) throw new Error("Spotify access token unavailable");
  // PKCE 갱신 토큰이 바뀌면 다음 요청에서도 새 토큰을 사용합니다.
  if (token.refresh_token && token.refresh_token !== config.refreshToken) await options.saveRefreshToken(token.refresh_token);
  const songs: Song[] = [];
  let offset = 0;
  while (offset < 500) {
    const url = new URL(`https://api.spotify.com/v1/playlists/${config.playlistId}/items`);
    url.search = new URLSearchParams({ limit: "50", offset: String(offset), market: "KR" }).toString();
    const res = await request(url, { headers: { Authorization: `Bearer ${token.access_token}` }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Spotify playlist ${res.status}`);
    const data = await res.json() as { items?: { item?: SpotifyTrack; track?: SpotifyTrack; }[]; next?: string | null; };
    if (!Array.isArray(data.items)) throw new Error("Spotify playlist response invalid");
    for (const row of data.items) { const song = toSong(row.item ?? row.track); if (song) songs.push(song); }
    if (!data.next || data.items.length === 0) break;
    offset += data.items.length;
  }
  if (!songs.length) throw new Error("Spotify playlist is empty");
  return songs;
}
