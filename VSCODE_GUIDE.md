# Red String — VS Code 수정 안내

PC에서도 모바일과 같은 최대 448px 화면을 쓰는 공연 안내 사이트입니다.

## 1. 처음 실행하기

1. Node.js 22.13.0 이상과 VS Code를 준비합니다.
2. 압축을 풀고 `RedString-VSCode` 폴더를 VS Code의 **파일 → 폴더 열기**로 엽니다.
3. VS Code에서 **터미널 → 새 터미널**을 열고 다음 명령을 순서대로 실행합니다.

```bash
npm ci
npm run dev
```

4. 브라우저에서 **http://localhost:5173/** 을 엽니다.
5. 파일을 수정하고 저장하면 브라우저에 수정 내용이 반영됩니다.
6. 실행을 끝낼 때는 터미널에서 `Ctrl+C`를 누릅니다.

`npm run dev`는 방명록용 **로컬 데이터베이스**를 먼저 준비합니다. 별도의 DB 계정이나 API 키 없이 로컬에서 기대평 작성·읽기·삭제를 확인할 수 있습니다. 로컬 데이터는 `.wrangler` 폴더에 보관됩니다.

## 2. 무엇을 어디서 바꾸나요?

| 바꾸고 싶은 것 | 파일 |
| --- | --- |
| 공연 날짜·장소·입장료·지도 링크 | `app/data/site.ts`의 `eventInfo` |
| 멤버 이름·파트 | `app/data/site.ts`의 `members` |
| 셋리스트·유튜브/멜론 검색어·영상 ID | `app/data/site.ts`의 `songs` |
| PC와 모바일의 화면 폭·글씨 크기·색상 | `app/mobile-layout.css` |
| 메인 문구·화면 구성 | `app/page.tsx` |
| 붉은 실·기대평 장식의 모양과 동작 | `app/components/string-wall.tsx` |
| 방명록 기본 스타일 | `app/globals.css` |
| 멤버 악기 그래픽·꽃 모션 | `app/components/band-stage.tsx` |
| Spotify API·오류 시 수동 목록 | `app/api/setlist/` |
| 브라우저 탭 제목·검색 설명 | `app/layout.tsx` |
| 이미지·파비콘 | `public/` |
| 방명록 저장·조회 | `app/api/guestbook/route.ts` |
| 방명록 입력 제한 | `app/api/guestbook/validation.ts` |

### 화면 폭과 글씨 크기 예시

`app/mobile-layout.css` 맨 위에서 조정하세요.

```css
:root {
  --site-width: 448px; /* PC에서도 이 폭까지만 표시 */
  --font-body: 16px;   /* 본문 */
  --font-small: 14px;  /* 작은 안내 */
  --font-label: 12px;  /* 보조 라벨 */
  --red: #ae302e;
  --paper: #f8f1df;
  --green: #344d42;
}
```

`mobile-layout.css`의 반응형 규칙은 브라우저 전체가 아니라 `.site-shell`의 폭을 기준으로 동작합니다. PC에서도 모바일 메뉴·한 열 구성·두 열 장식 연결이 유지됩니다.

### 셋리스트 예시

```ts
{ title: "사무라이 하트", query: "SPYAIR サムライハート", video: "KpM6xNAgRoI" }
```

`video`는 `youtube.com/watch?v=...`에서 `v=` 뒤에 오는 영상 ID입니다. 없으면 유튜브 검색으로 연결됩니다. `encore: true`를 넣으면 앵콜에 표시됩니다.

## 3. 배포된 사이트와 로컬 파일의 관계

이 압축 파일은 VS Code에서 자유롭게 수정하는 독립 복사본입니다. 로그인 정보, 배포 권한, 실제 관객의 기대평 데이터는 포함하지 않습니다.

**로컬에서 저장한 코드가 현재 비공개 URL에 자동 배포되지는 않습니다.** 수정한 소스를 다시 전달하면 현재 사이트에 반영할 수 있습니다. GitHub·Vercel 등 별도 서비스로 이전하려면 서버/DB 배포 설정이 필요하며, 이 프로젝트는 현재 Cloudflare Workers/D1 기반입니다. Vercel에 그대로 업로드하는 전용 프로젝트는 아닙니다.

## 4. 확인 명령

```bash
npm run typecheck  # TypeScript 확인
npm run build      # 배포용 빌드
npm run db:local   # 로컬 DB 준비만 실행
```

기대평은 장식을 골라 작성한 뒤, 같은 브라우저에서 다시 열어 삭제할 수 있습니다. 브라우저 저장소를 지우면 본인 글 삭제 권한도 사라집니다.

## 5. Spotify 플레이리스트 연결 (선택)

인증 설정 전에는 `app/data/site.ts`의 12곡을 보여줍니다. Spotify 장애·권한 오류 때에도 수동 목록으로 돌아옵니다. 관객에게 Spotify 로그인을 요구하지 않습니다.

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)에서 앱을 준비합니다. 현재 Development Mode는 앱 소유자의 Premium 구독이 필요합니다.
2. 앱의 Redirect URI에 **`http://127.0.0.1:8888/callback`** 을 정확히 등록합니다.
3. 공연 곡을 순서대로 담은 플레이리스트를 만들고, 해당 플레이리스트 소유자 또는 공동 작업자 계정으로 인증합니다.
4. 프로젝트 터미널에서 `node scripts/spotify-connect.mjs` 를 실행하고 Client ID와 플레이리스트 URL을 입력합니다. Client ID는 공개 식별자이며 Client Secret은 사용하지 않습니다.
5. 터미널에 나온 Spotify 인증 주소를 본인 브라우저에서 열어 읽기 권한을 승인합니다.
6. 성공 후 `.dev.vars`가 생성됩니다. 개발 서버를 껐다가 다시 `npm run dev`로 켭니다.

`/api/setlist`는 서버에서 PKCE 갱신 토큰으로 인증하고 최신 `/v1/playlists/{id}/items` API로 조회합니다. 페이지당 50곡, 최대 500곡을 읽으며, 1분 캐시와 오류 시 1분 대기를 둡니다. 토큰이 바뀌면 서버 DB에 보관합니다. 앵콜·편곡 표시는 수동 목록의 곡 제목과 정확히 일치하는 곡에 유지합니다. Spotify 곡명과 수동 곡명이 다르면 `app/data/site.ts` 제목을 맞춰 주세요. 곡 순서는 플레이리스트 순서입니다.

인증 계정은 플레이리스트 소유자/공동 작업자여야 합니다. 비공개 목록은 `playlist-read-private` 읽기 권한이 필요합니다. 인증을 취소하거나 토큰이 만료되면 연결 스크립트를 다시 실행하세요. API는 곡 정보와 Spotify 링크를 가져오며, 웹사이트에서 Spotify 음원을 직접 재생하지 않습니다.

**`.dev.vars`는 인증 토큰을 포함합니다. 압축·Git·채팅으로 공유하지 마세요.** 예시 파일 `.dev.vars.example`에는 변수 이름만 들어 있습니다. 현재 비공개 배포 URL에는 Spotify 인증이 아직 설정되지 않았습니다. 로컬 인증과 별개로 배포 환경에 같은 세 변수를 안전하게 설정해야 실제 배포에서도 동기화됩니다.

공식 문서: [플레이리스트 항목 조회](https://developer.spotify.com/documentation/web-api/reference/get-playlists-items), [PKCE 인증](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow), [2026년 Development Mode 변경](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide)
