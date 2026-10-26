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

export type Song = {
  title: string;
  query: string; // 유튜브·멜론 검색어
  artist?: string;
  spotifyUrl?: string;
  tag?: string;
  video?: string; // 공식 YouTube 영상 ID (선택)
  encore?: boolean;
};

export const songs: Song[] = [{ title: "Hi Bully", query: "Hi Bully 터치드" },
{ title: "사랑하게 될 거야", query: "사랑하게 될 거야", tag: "편곡 ver." },
{ title: "좋지 아니한가", query: "좋지 아니한가 크라잉넛" },
{ title: "미리 메리 크리스마스", query: "미리 메리 크리스마스 아이유", tag: "편곡 ver." },
{ title: "우리의 밤", query: "우리의 밤" },
{ title: "When this rain stops", query: "When This Rain Stops 웬디" },
{ title: "스물다섯, 스물하나", query: "스물다섯 스물하나 자우림", tag: "편곡 ver." },
{ title: "넌 내게 반했어", query: "넌 내게 반했어 노브레인" },
{ title: "사무라이 하트", query: "SPYAIR サムライハート", video: "KpM6xNAgRoI" },
{ title: "홍연", query: "홍연 안예은" },
{ title: "알루미늄", query: "알루미늄 브로큰 발렌타인", tag: "본공연 마지막" },
{ title: "그대에게", query: "그대에게 무한궤도", tag: "ENCORE", encore: true }];
