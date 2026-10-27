import type { Song } from "../app/data/site";

// 플레이리스트를 연결해도 12번째 곡의 메타데이터는 응답에 포함하지 않습니다.
export function publicSetlist(tracks: Song[], local: Song[]): Song[] {
  const main = local.filter(song => !song.encore);
  const publicTracks = tracks.slice(0, 11).filter(song => !song.encore && !song.hidden).map(song => {
    const match = main.find(item => item.spotifyUrl === song.spotifyUrl
      || item.title.toLowerCase() === song.title.toLowerCase());
    return { ...song, ...(match ? { title: match.title, tag: match.tag, video: match.video } : {}) };
  });
  return [...publicTracks, { title: "???", query: "", encore: true, hidden: true }];
}
