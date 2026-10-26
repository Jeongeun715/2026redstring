# Red String live

Private concert information site, built with React/Vinext and a Cloudflare D1 guestbook. Site identity is in `.openai/hosting.json`.

## Content

- 12 members grouped by part, based on the supplied member roster.
- Concert venue: 합정 허밋. Date, time, ticket price and booking remain TBA.
- Planned songs are displayed in a provisional sequence; 알루미늄 closes the main show and 그대에게 is the encore.
- YouTube/Melon search links are provided per song. 사무라이 하트 also links to the verified official SPYAIR music video. No playback access or playlist API is implied.

## Guestbook

Server-side D1 persistence; nickname 1–16 UTF-16 units, message 1–100 units; whitespace normalized. Consent required. UUID idempotency prevents duplicate retries, atomic insert limits one post per visitor per 10 seconds, and hashed deletion tokens support soft deletion from the originating browser. Public reads exclude deletion tokens and rate keys. Site access remains owner-only; review write authorization if the audience changes in the future.

## Verification (2026-10-23)

- TypeScript check and production build.
- Desktop and 320/390/768px iframe viewport QA, with no horizontal page overflow.
- Member part filter; song filter/search; accordion expansion; mobile menu.
- YouTube official video opened and played; Melon search opened with matching results.
- Browser-created guestbook message persisted across reload and was deleted through the UI.
- Local API QA: blank/overlength/consent/spam rejection, save/list, idempotent retry, rate limit, wrong deletion token, pagination with 21 records, and soft deletion. Test rows removed from public results.

`node --experimental-strip-types scripts/verify-guestbook.mts` runs the API checks against a reachable local server (`TEST_BASE_URL` optional). The managed preview is reachable through the browser rather than shell loopback; temporary browser harness pages were removed before publishing.

## Ornament guestbook update

Audience messages are rendered as hanging ornaments linked by one red string. Visitors choose star, heart, guitar pick or musical note before writing; the shape is stored in D1. Existing messages default to star through an additive schema migration. Clicking an ornament opens its message; the same-browser deletion flow is retained. The board shows eight messages per page, with additional server pages available below.

Verified: all four choices persist through the API, a heart created through the UI survives reload, message dialogs open, owner deletion works on mobile, board pagination works, 320px layout has no horizontal overflow, and native dialog Escape dismissal works. Local fixture records were removed after QA.

## Mobile column and VS Code handoff

The site shell is centered and capped at 448px on every screen. Container queries retain the mobile layout on desktop; content sizes use container-relative units. Readable typography overrides are in `app/mobile-layout.css`. Concert/member/song content is editable in `app/data/site.ts`; the Korean `VSCODE_GUIDE.md` documents local editing and the standalone export's local D1 setup. The exported copy removes hosted Site identity, credentials and runtime data, and uses npm with the public-registry lockfile.
