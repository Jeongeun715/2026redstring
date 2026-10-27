"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronUp, Play } from "lucide-react";
import { songs, type Song } from "../data/site";

type Controller = { play: () => void; pause: () => void; destroy: () => void; addListener: (event: "ready", callback: () => void) => void };
type SpotifyAPI = { createController: (element: HTMLElement, options: { uri: string; width: string; height: number }, callback: (controller: Controller) => void) => void };
declare global { interface Window { onSpotifyIframeApiReady?: (api: SpotifyAPI) => void } }
let apiPromise: Promise<SpotifyAPI> | null = null;
function loadSpotify() {
  if (!apiPromise) apiPromise = new Promise<SpotifyAPI>((resolve, reject) => {
    window.onSpotifyIframeApiReady = resolve;
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    script.onerror = () => { script.remove(); apiPromise = null; reject(new Error("Spotify unavailable")); };
    document.body.appendChild(script);
  });
  return apiPromise;
}
export function trackUri(song: Song) {
  if (song.hidden || song.encore) return null;
  const id = song.spotifyUrl?.match(/^https:\/\/open\.spotify\.com\/(?:intl-[a-z]+\/)?track\/([A-Za-z0-9]{22})(?:[?#].*)?$/)?.[1];
  return id ? `spotify:track:${id}` : null;
}
function SpotifyPlayer({ song, uri }: { song: Song; uri: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    let alive = true, native = false, player: Controller | null = null;
    const element = host.current;
    function stop() { if (player) { try { player.pause(); player.destroy(); } catch { } player = null; } }
    function useNative() { if (!alive || native) return; native = true; stop(); setFallback(true); }
    const timer = setTimeout(useNative, 8000);
    void loadSpotify().then(api => {
      if (!alive || native || !element) return;
      const mount = document.createElement("div");
      element.replaceChildren(mount);
      api.createController(mount, { uri, width: "100%", height: 152 }, controller => {
        if (!alive || native) { controller.destroy(); return; }
        player = controller;
        controller.addListener("ready", () => {
          if (!alive || native) return;
          clearTimeout(timer);
          element.querySelector("iframe")?.setAttribute("title", `${song.title} Spotify 미리듣기`);
          // 사용자 클릭에서 열린 곡만 재생합니다. 접거나 곡을 바꾸면 아래 정리 함수가 멈춥니다.
          controller.play();
        });
      });
    }).catch(useNative);
    return () => { alive = false; clearTimeout(timer); stop(); element?.replaceChildren(); };
  }, [uri, song.title]);
  return <div className="spotify-inline">
    <div ref={host} className="spotify-host" hidden={fallback} />
    {fallback && <iframe src={`https://open.spotify.com/embed/track/${uri.split(":")[2]}?theme=0`} title={`${song.title} Spotify 미리듣기`} width="100%" height="152" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" />}
  </div>;
}
export default function Setlist() {
  const [tracks, setTracks] = useState<Song[]>(songs), [active, setActive] = useState<string | null>(null);
  const section = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const abort = new AbortController();
    void fetch("/api/setlist", { signal: abort.signal }).then(response => response.ok ? response.json() : null).then(data => {
      if (Array.isArray(data?.songs) && data.songs.length) setTracks(data.songs);
    }).catch(() => {});
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { void loadSpotify().catch(() => {}); observer.disconnect(); } }, { rootMargin: "400px" });
    if (section.current) observer.observe(section.current);
    return () => { abort.abort(); observer.disconnect(); };
  }, []);
  useEffect(() => { if (active && !tracks.some(song => trackUri(song) === active)) setActive(null); }, [tracks, active]);

  return <div ref={section} className="song-list">{tracks.map((song, index) => {
    if (song.hidden || song.encore) return <article className="song-row secret-track" key="encore" data-reveal aria-label="12번 비공개 앵콜곡"><div className="song-main"><span className="track-number">12</span><div className="track-name"><h3>???</h3></div><span className="secret-spacer" aria-hidden="true" /></div></article>;
    const uri = trackUri(song), expanded = !!uri && active === uri;
    return <article className={`song-row ${expanded ? "selected" : ""}`} key={`${song.title}-${index}`} data-reveal>
      <div className="song-main"><span className="track-number">{String(index + 1).padStart(2, "0")}</span><div className="track-name"><h3>{song.title}{song.tag === "RS ver." && <span className="track-version"> - RS ver.</span>}</h3></div>
        <button className="track-play" aria-label={`${song.title} 미리듣기${expanded ? " 접기" : ""}`} aria-expanded={expanded} aria-controls={`track-player-${index}`} onClick={() => setActive(expanded ? null : uri)}>{expanded ? <ChevronUp size={15} /> : <Play size={12} fill="currentColor" />}</button>
      </div>
      {expanded && uri && <div id={`track-player-${index}`} className="track-player" role="region" aria-label={`${song.title} 플레이어`}><SpotifyPlayer song={song} uri={uri} /></div>}
    </article>;
  })}</div>;
}
