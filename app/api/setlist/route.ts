import { env } from "cloudflare:workers";
import { songs as localSongs } from "../../data/site";
import { readSpotifyPlaylist } from "./spotify";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
let cache: { key: string; until: number; songs: typeof localSongs; } | null = null;
let cooldown = 0;
let pending: Promise<typeof localSongs> | null = null;
export async function GET() {
  const { SPOTIFY_CLIENT_ID: clientId, SPOTIFY_REFRESH_TOKEN: seed, SPOTIFY_PLAYLIST_ID: playlistId } = env;
  const fallback = () => Response.json({ source: "local", songs: localSongs }, { headers });
  if (!clientId || !seed || !playlistId || !/^[a-zA-Z0-9]{22}$/.test(playlistId) || !env.DB) return fallback();
  const key = `${clientId}/${playlistId}/${seed}`;
  if (cache?.key === key && cache.until > Date.now()) return Response.json({ source: "spotify", songs: cache.songs, playlistUrl: `https://open.spotify.com/playlist/${playlistId}` }, { headers });
  if (cooldown > Date.now()) return fallback();
  try {
    pending ??= (async () => {
      const seedHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(seed)))).map(x => x.toString(16).padStart(2, "0")).join("");
      const stored = await env.DB!.prepare("SELECT refresh_token AS token FROM spotify_tokens WHERE id = ? AND seed_hash = ?").bind(clientId, seedHash).first<{ token: string; }>();
      return readSpotifyPlaylist({ clientId, playlistId, refreshToken: stored?.token || seed }, {
        saveRefreshToken: async token => {
          await env.DB!.prepare("INSERT INTO spotify_tokens(id,seed_hash,refresh_token) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET seed_hash=excluded.seed_hash,refresh_token=excluded.refresh_token").bind(clientId, seedHash, token).run();
        }
      });
    })();
    const remote = await pending;
    // 공연 편곡·앵콜 표시는 로컬 목록의 제목과 일치하는 곡에 보존합니다.
    const songs = remote.map(song => { const local = localSongs.find(s => s.title.toLowerCase() === song.title.toLowerCase()); return { ...song, ...(local ? { tag: local.tag, encore: local.encore, video: local.video } : {}) }; });
    cache = { key, until: Date.now() + 60_000, songs };
    return Response.json({ source: "spotify", songs, playlistUrl: `https://open.spotify.com/playlist/${playlistId}` }, { headers });
  } catch {
    cooldown = Date.now() + 60_000;
    return fallback();
  } finally { pending = null; }
}
