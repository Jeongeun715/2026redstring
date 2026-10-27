import { publicSetlist } from "../../../lib/setlist-public";
import { supabaseRest } from "../../../lib/supabase-rest";
export const runtime = "nodejs";
import { songs as localSongs } from "../../data/site";
import { readSpotifyPlaylist } from "./spotify";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
let cache: { key: string; until: number; songs: typeof localSongs; } | null = null;
let cooldown = 0;
let pending: Promise<typeof localSongs> | null = null;
export async function GET() {
  const { SPOTIFY_CLIENT_ID: clientId, SPOTIFY_REFRESH_TOKEN: seed, SPOTIFY_PLAYLIST_ID: playlistId } = process.env;
  const fallback = () => Response.json({ source: "local", songs: publicSetlist(localSongs, localSongs) }, { headers });
  if (!clientId || !seed || !playlistId || !/^[a-zA-Z0-9]{22}$/.test(playlistId)) return fallback();
  const key = `${clientId}/${playlistId}/${seed}`;
  if (cache?.key === key && cache.until > Date.now()) return Response.json({ source: "spotify", songs: cache.songs }, { headers });
  if (cooldown > Date.now()) return fallback();
  try {
    pending ??= (async () => {
      const seedHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(seed)))).map(x => x.toString(16).padStart(2, "0")).join("");
      const params = new URLSearchParams({ select: "refresh_token", id: `eq.${clientId}`, seed_hash: `eq.${seedHash}`, limit: "1" });
      const stored = await supabaseRest<{ refresh_token: string }[]>(`/spotify_tokens?${params}`);
      return readSpotifyPlaylist({ clientId, playlistId, refreshToken: stored[0]?.refresh_token || seed }, {
        saveRefreshToken: async token => {
          await supabaseRest("/spotify_tokens?on_conflict=id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ id: clientId, seed_hash: seedHash, refresh_token: token }) });
        }
      });
    })();
    const remote = await pending;
    const songs = publicSetlist(remote, localSongs);
    cache = { key, until: Date.now() + 60_000, songs };
    return Response.json({ source: "spotify", songs }, { headers });
  } catch {
    cooldown = Date.now() + 60_000;
    return fallback();
  } finally { pending = null; }
}
