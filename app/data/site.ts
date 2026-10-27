// 이 파일에서 공연 정보, 멤버, 셋리스트를 수정하세요.

export const eventInfo = {
  date: "2026.12.20 (일) 오후 6시",
  scheduleNote: "입장 오후 5시 30분",
  venueTitle: "HERMIT",
  venueName: "합정 허밋",
  ticket: "추후 공개",
  ticketNote: "입장료 · 예매 방법은 준비 중입니다.",
  mapUrl: "https://map.naver.com/p/search/합정%20허밋",
};

export const members = [{ role: "VOCAL", ko: "보컬", names: ["강재준", "박지현", "김은혜"] },
{ role: "GUITAR", ko: "기타", names: ["심규진", "안진관", "김수진"] },
{ role: "BASS", ko: "베이스", names: ["박정은", "임지훈"] },
{ role: "KEYS", ko: "건반", names: ["한승엽", "유다현"] },
{ role: "DRUMS", ko: "드럼", names: ["박기종", "노유경"] }];

// ID는 통계 키입니다. 이름을 수정해도 각 배열의 순서는 유지하세요.
export const memberProfiles = members.flatMap(group => group.names.map((name, index) => ({
  id: `${group.role.toLowerCase()}-${index + 1}`, name, role: group.role, part: group.ko,
})));

export type MemberProfile = typeof memberProfiles[number];

export type Song = {
  title: string;
  query: string; // 유튜브·멜론 검색어
  artist?: string;
  spotifyUrl?: string; // Spotify 곡 공유 링크. 공식 플레이어에서 미리듣기합니다.
  tag?: string;
  video?: string; // 공식 YouTube 영상 ID (선택)
  encore?: boolean;
  hidden?: boolean; // 비공개 곡에는 제목·아티스트·재생 링크를 넣지 않습니다.
};

// 원곡 미리듣기입니다. Red String 공연 편곡 녹음이 아닙니다.
export const songs: Song[] = [
  { title: "Hi Bully", artist: "터치드", query: "Hi Bully 터치드", spotifyUrl: "https://open.spotify.com/track/0gd4nhLObQ2fOEvQzBq9KF" },
  { title: "사랑하게 될 거야", artist: "한로로", query: "사랑하게 될 거야 한로로", tag: "RS ver.", spotifyUrl: "https://open.spotify.com/track/3WvM2dIR9iIxMGNMP7WsNw" },
  { title: "좋지 아니한가", artist: "크라잉넛", query: "좋지 아니한가 크라잉넛", spotifyUrl: "https://open.spotify.com/track/7L13P7XjzgJyENZZjITPcV" },
  { title: "미리 메리 크리스마스", artist: "아이유", query: "미리 메리 크리스마스 아이유", tag: "RS ver.", spotifyUrl: "https://open.spotify.com/track/6I9Y6PHTWv72fgQV3tIHt0" },
  { title: "우리의 밤", artist: "유다빈밴드", query: "우리의 밤 유다빈밴드", spotifyUrl: "https://open.spotify.com/track/10zPfR7LhIy8JShyjOTOXA" },
  { title: "When this rain stops", artist: "웬디", query: "When This Rain Stops 웬디", spotifyUrl: "https://open.spotify.com/track/6mavVLsxaa4YcPje9qZKcf" },
  { title: "스물다섯, 스물하나", artist: "자우림", query: "스물다섯 스물하나 자우림", tag: "RS ver.", spotifyUrl: "https://open.spotify.com/track/3DmDPYRQYdYE5gWf2DiKn2" },
  { title: "넌 내게 반했어", artist: "노브레인", query: "넌 내게 반했어 노브레인", spotifyUrl: "https://open.spotify.com/track/6mpDpM0VCnOXccCcst5f14" },
  { title: "사무라이 하트", artist: "SPYAIR", query: "SPYAIR サムライハート", video: "KpM6xNAgRoI", spotifyUrl: "https://open.spotify.com/track/4qfwXvY82pkSt6moeAguje" },
  { title: "홍연", tag: "RS ver.", artist: "안예은", query: "홍연 안예은", spotifyUrl: "https://open.spotify.com/track/4p0aRX6U77LV48n0tWvYoV" },
  { title: "알루미늄", artist: "브로큰 발렌타인", query: "알루미늄 브로큰 발렌타인", spotifyUrl: "https://open.spotify.com/track/48PL9fQVi2AApLViY2Shpw" },
  { title: "???", query: "", encore: true, hidden: true },
];

// 밴드 기록과 푸터에서 사용하는 공식 채널 링크입니다.
export const socialLinks = {
  youtube: "https://www.youtube.com/@redstring_band",
  instagram: "https://www.instagram.com/redstring_band/",
};
