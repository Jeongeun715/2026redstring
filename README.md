# Red String — Vercel + Supabase 버전

보내주신 수정 시안 3장을 기준으로 다시 구성한 버전입니다. BLACK `#0B0B0D`, RED `#D62839`, GREEN `#176B4A`와 크림색 `#F7F1DF`를 사용합니다. PC에서도 448px 폭이며, 메인 비주얼은 비워 두었습니다. 첨부한 SVG 로고와 로컬 프리텐다드 가변 폰트를 적용했습니다. 멤버 팝업·꽃 모션, 관리자 전용 꽃 집계, Spotify 공식 미리듣기, 한 실에 최대 12개가 걸리는 붉은 실 방명록을 포함합니다.

Node.js 22.13 이상이 필요합니다. 기존 비공개 Sites 주소와 이 소스는 별개이며, 이 소스를 수정해도 기존 주소에 자동 반영되지 않습니다.

## 이번 수정 적용하기

개발 서버를 **Ctrl+C**로 끄고, ZIP 안 `RedString-Vercel-Supabase` 폴더의 **내용**을 기존 프로젝트 폴더에 덮어쓴 뒤 `npm run dev`를 실행하세요. 기존 `.env.local`과 `.git`은 유지합니다. 이번 수정에는 추가 SQL·환경변수·패키지 설치가 필요하지 않습니다.

- 기대평 등록 직후 기존 장식을 유지합니다. 기존 장식이 잠시 뒤로 물러나고 새 장식이 떨어져 실에 걸린 뒤 흔들리는 모션을 적용했습니다. 동작 줄이기 설정에서는 애니메이션을 생략합니다.
- ‘기대평 남기기’ 버튼을 실 아래로 옮겼고, 작성 창의 ‘기대 한줄’ 제목을 제거했습니다. 장식 선택에는 큰 아이콘만 보이고 접근성 이름은 유지합니다.
- 별·하트와 어울리도록 음표·피크도 단순한 면과 작은 반짝임으로 정리했습니다.
- Spotify 플레이어가 선택한 곡 아래에 펼쳐집니다. 한 번에 하나만 열리고, 같은 버튼을 누르거나 곡을 바꾸면 이전 플레이어를 멈추고 정리합니다.
- 멤버 이름표는 어두운 바탕·밝은 20px 이름·왼쪽 붉은 선으로 정리했습니다. 작은 화면에서는 18px을 사용하며, 버튼을 가리키거나 누를 때 붉은 테두리와 바탕이 반응합니다. 팝업 버튼 문구는 ‘한 번 더 응원하기’이며, 입장 안내는 ‘입장 오후 5시 30분’입니다.
- 실 이어주기 다음에 ‘OFF STAGE / 밴드 노트’를 추가했습니다. 제공된 유튜브 채널로 연결하며, 실제 영상 썸네일이나 제목을 임의로 넣지 않았습니다.
- 푸터 로고 아래 유튜브·인스타그램 아이콘이 각각 밴드 채널로 연결됩니다.

수정 위치: 기대평 흐름 `app/components/string-gallery.tsx`, 실·장식 `app/components/string-wall.tsx`, 입력 폼 `app/components/guestbook.tsx`, 인라인 플레이어 `app/components/setlist.tsx`, 밴드 노트 `app/components/band-notes.tsx`, 소셜 주소 `app/data/site.ts`, 이름 버튼과 모션 `app/globals.css`.

검증: 18개 자동 테스트, TypeScript 검사, Next.js 프로덕션 빌드를 통과했습니다. 실제 컴포넌트를 가상 DOM에서 실행해 기존 장식 DOM 유지·느린 재조회·새 장식 모션 상태·버튼 위치·타이머·곡 아래 플레이어 열기/전환/접기를 확인했습니다. Spotify SDK는 테스트 대역을 사용했으며 실제 음성 출력과 휴대폰 터치는 이 환경에서 검증하지 못했습니다.

## 처음 이 Supabase 버전으로 바꾼다면

1. 기존 VS Code 개발 서버를 **Ctrl+C**로 끕니다.
2. ZIP 속 `RedString-Vercel-Supabase` **안의 내용 전체**를 현재 프로젝트 폴더에 덮어씁니다. 기존 `.env.local`과 `.git`은 그대로 둡니다. 이 ZIP에는 개인 연결 키와 `.git`이 없습니다.
3. 꽃 집계 테이블이 아직 없을 때만 Supabase **SQL Editor → New query**에 `supabase/flowers.sql` 전체를 붙여 넣고 **Run** 합니다. 기존 기대평을 지우지 않으며, 다시 실행해도 집계가 초기화되지 않습니다.
4. VS Code 터미널에서 실행합니다.

```powershell
node scripts/prepare-vercel.mjs
npm ci
npm run dev
```

5. 터미널에 나온 Local 주소를 엽니다. 기본은 `http://localhost:3000`입니다. 배포나 Git 업로드는 이 명령으로 실행되지 않습니다.
6. 멤버 이름을 한 번 누른 뒤 Supabase **Table Editor → member_flower_counts**를 새로고침합니다. `total_clicks`가 1 증가합니다. 사이트에는 횟수를 표시하지 않습니다. 같은 이름을 다시 눌러도 꽃이 날아가며, 팝업의 ‘한 번 더 응원하기’도 1회로 집계합니다.

숫자는 **클릭 횟수**입니다. 방문자 수나 중복 없는 투표 수가 아닙니다. 사용자 IP나 로그인 정보는 꽃 통계에 저장하지 않습니다. `member_flower_events`에는 재시도 중복 방지용 요청 ID와 멤버 ID·시간만 저장합니다. 공개 키로 통계 테이블에 접근할 수 없고, 통계를 조회하는 웹 API도 제공하지 않습니다.

## 1. 기존 Git 연결 폴더에 새 코드 넣기

1. 이 ZIP을 압축 풉니다.
2. `RedString-Vercel-Supabase` 폴더 **안의 파일 전체**를 기존 Git 연결 폴더에 복사하고, 같은 이름의 파일은 덮어씁니다. `.git` 폴더를 지우거나 다른 프로젝트 폴더에 복사하지 마세요.
3. 기존 폴더의 최상위에 `package.json`, `app`, `lib`, `supabase`가 있어야 합니다. 새 폴더를 한 겹 더 넣지 마세요.
4. VS Code에서 기존 폴더를 열고 터미널에서 실행합니다.

```powershell
node scripts/prepare-vercel.mjs
npm ci
```

첫 명령은 이전 Cloudflare용 설정과 pnpm 잠금 파일을 정리합니다. `.git`, 작성 데이터, 기존 `.env.local`은 보존합니다. `.env.local`이 없으면 예시 파일을 복사해 만듭니다. 기존 Cloudflare 서버·이전 API와 새 프로젝트 간 관객 데이터 자동 이전은 하지 않습니다.

## 2. Supabase에 방명록 테이블 만들기

1. 생성한 Supabase 프로젝트에 들어갑니다.
2. 왼쪽 **SQL Editor**를 엽니다.
3. **New query**로 새 쿼리를 만듭니다.
4. VS Code에서 이 소스의 `supabase/setup.sql`을 열고 전체를 복사합니다.
5. SQL Editor에 붙여 넣고 **Run**을 누릅니다. 실행 역할은 기본 관리자(Postgres)로 둡니다.
6. 성공 메시지가 나오면 **Table Editor**에서 `guestbook`, `spotify_tokens`, `member_flower_counts`, `member_flower_events` 테이블을 확인합니다. 꽃 집계 테이블에는 멤버 12명이 0회로 준비됩니다.

SQL은 기존 데이터를 삭제하지 않습니다. 동일한 파일을 다시 실행해도 데이터는 유지됩니다. 이미 다른 구조로 `guestbook` 테이블을 만든 프로젝트라면 덮어쓰지 말고 오류 내용을 먼저 확인하세요.

모든 테이블은 RLS를 켜고 공개 역할의 접근 권한을 제거합니다. 서버 전용 Secret key로 접근하므로 브라우저용 공개 읽기·쓰기 정책을 따로 추가하지 않습니다. `redstring_create_entry` 함수가 동일 요청 재시도와 10초 등록 간격을 처리합니다.

## 3. Supabase 연결값 넣기

이번 버전은 서버 API가 DB를 처리하므로 **Project URL + Secret key** 두 개를 사용합니다. Publishable key는 필요하지 않습니다.

- URL: 프로젝트의 **Connect**에서 확인합니다. `https://프로젝트ID.supabase.co` 형태의 Project URL이며, `postgresql://`로 시작하는 DB 접속 문자열이 아닙니다.
- Secret key: **Settings → API Keys → Secret keys**에서 확인하거나 새 키를 만듭니다. `sb_secret_`로 시작합니다. DB 비밀번호와 다릅니다.

VS Code의 프로젝트 최상위 `.env.local`에 입력합니다.

```env
SUPABASE_URL=https://실제프로젝트ID.supabase.co
SUPABASE_SECRET_KEY=sb_secret_실제키
```

`.env.local`은 Git에서 제외됩니다. Secret key를 소스 코드에 붙이거나 채팅·스크린샷으로 공유하지 마세요. 이 프로젝트에는 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`를 설정하지 않아도 됩니다.

## 4. 내 컴퓨터에서 확인하기

```powershell
npm run dev
```

1. 브라우저에서 **http://localhost:3000/** 을 엽니다.
2. **http://localhost:3000/api/health** 을 열어 `{"ok":true,"database":"connected"}`가 나오는지 확인합니다.
3. 사이트에서 기대평을 남기고, 새로고침 후에도 장식이 보이는지 확인합니다.
4. Supabase Table Editor의 `guestbook`에 글이 들어왔는지 확인합니다.
5. 같은 브라우저에서 장식을 열고 **내 장식 지우기 → 삭제**을 누릅니다.

삭제는 `deleted_at`을 채우는 소프트 삭제입니다. 관리자 Table Editor에는 기록이 남고 관객에게는 표시되지 않습니다. 등록 간격은 같은 IP 기준 10초입니다. 같은 와이파이 이용자는 제한을 공유할 수 있습니다.

`database: not_configured`는 `.env.local` 값 누락, `check_sql_and_key`는 키·SQL·Data API 설정을 확인해야 한다는 뜻입니다. 환경변수를 바꾼 후에는 개발 서버를 종료하고 다시 실행하세요.

## 5. GitHub에 커밋하기

기존에 연결한 저장소 폴더의 터미널에서 실행합니다.

```powershell
git status
git add .
git commit -m "수정 시안 디자인과 꽃 집계, 셋리스트 미리듣기 적용"
git push
```

처음 올리는 브랜치이고 추적 설정이 없다면 마지막 줄 대신 `git push -u origin main`을 사용합니다. 기존 원격 주소가 `https://github.com/Jeongeun715/2026redstring.git`인지 `git remote -v`로 확인하세요. 다른 사람이 원격을 수정해 업로드가 거절되면 강제로 덮어쓰지 말고 변경 내용을 먼저 확인합니다.

## 6. Vercel에 비공개 프로젝트 준비하기

터미널에서 Vercel 프로젝트만 먼저 만듭니다.

```powershell
npm install -g vercel
vercel login
vercel project create red-string
```

이미 `red-string` 프로젝트를 만들었다면 생성 명령은 건너뜁니다. Vercel 대시보드에서 프로젝트를 열어 **Settings → Deployment Protection → Vercel Authentication**을 켜고, 범위를 **All Deployments**로 저장합니다. Standard Protection은 운영 도메인을 보호하지 않으므로 비공개 확인 단계에는 All Deployments를 사용합니다.

**Settings → Environment Variables**에 다음 두 변수를 추가하고 Production과 Preview에 적용합니다.

| 이름 | 값 |
| --- | --- |
| `SUPABASE_URL` | `.env.local`과 같은 Project URL |
| `SUPABASE_SECRET_KEY` | `.env.local`과 같은 서버 전용 Secret key |

GitHub에 키를 올리지 않고 Vercel 설정 화면에 직접 입력합니다.

**Settings → Build and Deployment**에서 Framework Preset을 Next.js로, Root Directory를 `package.json`이 있는 위치로 설정합니다. Build는 `npm run build`, Install은 `npm ci`, Output Directory는 기본값을 사용합니다.

## 7. 배포와 GitHub 자동 연결

1. Vercel 프로젝트의 **Settings → Git**에서 `Jeongeun715/2026redstring` 저장소를 연결합니다.
2. VS Code 터미널에서 아래 명령을 실행하고, 기존 `red-string` 프로젝트를 선택합니다.

```powershell
vercel link
vercel --prod
```

배포가 완료되면 출력된 `.vercel.app` 주소를 엽니다. 도메인은 연결하지 않습니다. 로그인하지 않은 별도 브라우저에서 Vercel 로그인 화면이 나오는지 확인한 뒤, 본인 계정으로 로그인해서 사이트와 `/api/health`를 확인합니다.

이후 연결된 운영 브랜치에 `git push`하면 Vercel이 새 배포를 만듭니다. 환경변수를 변경하면 새 배포를 실행해야 반영됩니다.

## 8. 무엇을 어디서 수정하나요?

| 내용 | 파일 |
| --- | --- |
| 날짜·장소·멤버·수동 셋리스트 | `app/data/site.ts` |
| 메인 구성·문구 | `app/page.tsx` |
| 색상·글자 크기·간격 | `app/globals.css` |
| 모바일 화면 폭 | `app/mobile-layout.css` |
| 멤버 버튼·꽃 모션 | `app/components/band-stage.tsx` |
| 붉은 실 장식 | `app/components/string-wall.tsx` |
| 밴드 노트 | `app/components/band-notes.tsx` |
| 유튜브·인스타그램 주소 | `app/data/site.ts`의 `socialLinks` |
| 방명록 조회·작성·삭제 | `app/api/guestbook/` |
| Supabase 테이블·권한·등록 함수 | `supabase/setup.sql` |
| 서버에서 Supabase에 요청하는 부분 | `lib/supabase-rest.ts` |

## 9. Spotify 플레이리스트 자동 가져오기는 선택 사항

공개된 기본 11곡의 미리듣기에는 아래 설정이 필요 없습니다. **곡 목록을 플레이리스트에서 자동으로 바꾸고 싶을 때만** 설정하세요. 앱과 플레이리스트 소유자/공동 작업자 인증이 필요합니다.

1. Spotify 앱의 Redirect URI에 `http://127.0.0.1:8888/callback`을 등록합니다.
2. `npm run spotify:connect`를 실행하고 Client ID와 플레이리스트 URL을 입력합니다.
3. 터미널의 인증 주소를 본인 브라우저에서 열어 승인합니다. 연결값은 `.env.local`에 저장됩니다.
4. Vercel에도 `SPOTIFY_CLIENT_ID`, `SPOTIFY_PLAYLIST_ID`, `SPOTIFY_REFRESH_TOKEN`을 서버 환경변수로 추가하고 새로 배포합니다.

Spotify 토큰은 공개하지 않습니다. Supabase 연결도 먼저 완료되어 있어야 갱신 토큰을 저장할 수 있습니다. Spotify 오류가 발생하면 수동 셋리스트로 돌아옵니다.

## 검증 범위

Next.js 배포 빌드·타입 검사, 로컬 PostgreSQL 엔진에서 SQL 재실행과 역할별 접근 권한, API와 SQL을 함께 사용한 등록·중복·간격 제한·삭제·페이지 테스트를 완료했습니다. 실제 사용자의 Supabase 연결과 Vercel 배포는 계정의 URL/키를 설정한 후 위 절차로 확인해야 합니다.

공식 참고: [Supabase API 키](https://supabase.com/docs/guides/getting-started/api-keys), [SQL 함수](https://supabase.com/docs/guides/database/functions), [Vercel 접근 보호](https://vercel.com/docs/deployment-protection), [Git 자동 배포](https://vercel.com/docs/git)


## 이번 디자인과 미리듣기 수정 위치

| 수정할 내용 | 파일 |
| --- | --- |
| 공연 시간·장소, 멤버 이름, 곡·Spotify 링크 | `app/data/site.ts` |
| 로고 파일 | `public/logo.svg` |
| 프리텐다드 폰트 | `app/fonts/`, `app/layout.tsx` |
| 스크롤 모션 | `app/components/scroll-motion.tsx`, `data-reveal` 속성 |
| 첫 비주얼의 빈 공간 | `app/page.tsx`의 `main-visual-slot` |
| 색상·글자 크기·간격 | `app/globals.css` 맨 위 `:root` 및 각 영역 |
| PC에서도 모바일 폭 유지 | `app/mobile-layout.css`의 `max-width:448px` |
| 멤버 팝업과 꽃 모션 | `app/components/band-stage.tsx` |
| Spotify 공식 플레이어 | `app/components/setlist.tsx` |
| 기대평 입력과 서버 페이지 이동 | `app/components/guestbook.tsx`, `app/components/string-gallery.tsx` |
| 실과 장식의 배치·기대평 팝업 | `app/components/string-wall.tsx` |

미리듣기는 API 키 없이 Spotify **공식 Embed/iFrame API**를 이용합니다. 재생 버튼을 누르면 곡 아래에 플레이어가 펼쳐지고 `play()`를 요청합니다. 곡을 바꾸거나 접으면 이전 플레이어를 정지하고 제거합니다. 공식 플레이어를 숨기거나 음원을 추출·저장하지 않습니다. 브라우저가 재생을 막으면 플레이어 안의 재생 버튼을 한 번 더 누르면 됩니다. Spotify의 지역·계정·곡 제공 정책에 따라 이용 범위가 달라질 수 있습니다. 공연 편곡 버전의 녹음이 아니라 원곡입니다.

‘우리의 밤’은 **유다빈밴드 Our Night (Feat. Yu Seungwoo)**로 연결했습니다. ‘사랑하게 될 거야’는 한로로 곡으로 연결했습니다. 다른 원곡이라면 `songs`에서 `artist`, `query`, `spotifyUrl`을 바꾸세요. Spotify의 곡 공유 링크를 그대로 붙이면 됩니다.

멤버 이름을 바꾸면 `supabase/flowers.sql`의 같은 ID에 해당하는 `member_name`도 수정한 뒤 다시 Run 하면 관리자 표의 이름도 바뀝니다. 기존 횟수는 유지됩니다. 멤버 통계 ID는 바꾸지 마세요.

참고 문서: [Spotify iFrame API](https://developer.spotify.com/documentation/embeds/references/iframe-api), [Spotify Embed 재생 안내](https://developer.spotify.com/documentation/embeds/tutorials/troubleshooting).

## 검증 내역

- Next.js 프로덕션 빌드, TypeScript 검사, 자동 테스트 통과.
- 로컬 PostgreSQL 호환 환경에서 SQL 재실행·권한·꽃 누적·동일 요청 재시도·동시 호출을 확인했습니다.
- API와 SQL을 함께 연결해 꽃 저장, 비공개 응답, 기대평 등록·삭제, 12개 커서 페이지를 확인했습니다.
- 공개된 11곡의 공식 Spotify 링크를 사용하며, 수정한 유다빈밴드 음원의 미리듣기 제공 정보를 확인했습니다(2026-10-27).
- 이번 변경에서 Next.js 빌드·타입 검사와 18개 자동 테스트를 통과했습니다. 비공개 앵콜 정보 제외와 Spotify 곡명 매칭을 검사했습니다.
- 검증 브라우저에서는 클릭과 스크롤 모션 실행, 실제 음성 출력까지 확인하지 못했습니다. 정적 화면의 SVG 로고·입장 문구·짧아진 영역·비공개 앵콜 표시와 45px 셋리스트 행 높이는 확인했습니다. 실제 Supabase 프로젝트에는 키를 전달받지 않아 접속하지 않았습니다. 위 로컬 확인 순서로 본인 환경에서 한 번 확인해 주세요.
