import { validateEntry, hash } from "./validation";
import { hmac, supabaseRest, SupabaseError } from "../../../lib/supabase-rest";
import { cooldownMs } from "../../../lib/guestbook-cooldown";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
type Entry = { id: number; nickname: string; message: string; ornament: string; createdAt: number };
export async function GET(request: Request) {
  try {
    const raw = new URL(request.url).searchParams.get("before");
    if (raw !== null && !/^\d{1,12}$/.test(raw)) return Response.json({ error: "잘못된 페이지입니다." }, { status: 400, headers });
    const query = new URLSearchParams({ select: "id,nickname,message,ornament,createdAt:created_at", deleted_at: "is.null", order: "id.desc", limit: "13" });
    if (raw) query.set("id", `lt.${raw}`);
    const entries = await supabaseRest<Entry[]>(`/guestbook?${query}`);
    return Response.json({ entries: entries.slice(0, 12), hasMore: entries.length > 12 }, { headers });
  } catch (error) {
    const message = error instanceof SupabaseError && error.code === "NOT_CONFIGURED" ? "방명록 연결 설정을 확인해 주세요." : "방명록을 불러오지 못했어요.";
    return Response.json({ error: message }, { status: 503, headers });
  }
}
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("Origin");
    if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "잘못된 요청입니다." }, { status: 403, headers });
    if (!request.headers.get("Content-Type")?.includes("application/json")) return Response.json({ error: "잘못된 요청입니다." }, { status: 415, headers });
    const raw = await request.text();
    if (raw.length > 3000) return Response.json({ error: "입력 내용이 너무 길어요." }, { status: 413, headers });
    let body; try { body = JSON.parse(raw); } catch { return Response.json({ error: "입력 내용을 확인해 주세요." }, { status: 400, headers }); }
    const result = validateEntry(body);
    if (!result.ok) return Response.json({ error: result.error }, { status: 400, headers });
    const { nickname, message, ornament, requestId } = result.value;
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rateKey = await hmac(`ip/${ip}`);
    const deleteToken = await hmac(`delete/${requestId}/${rateKey}`);
    const data = await supabaseRest<{ state: "created" | "duplicate" | "conflict" | "rate_limited"; entry?: Entry }>("/rpc/redstring_create_entry", {
      method: "POST", body: JSON.stringify({ p_nickname: nickname, p_message: message, p_ornament: ornament, p_request_id: requestId, p_rate_key: rateKey, p_delete_hash: await hash(deleteToken) }),
    });
    if (data.state === "rate_limited") {
      let retryAfterMs = 10_000;
      try {
        const query = new URLSearchParams({ select: "created_at", rate_key: `eq.${rateKey}`, order: "created_at.desc", limit: "1" });
        const recent = await supabaseRest<{ created_at: number }[]>(`/guestbook?${query}`);
        if (recent[0]) retryAfterMs = cooldownMs(Number(recent[0].created_at));
      } catch { /* 제한 시간 조회가 실패해도 등록 제한은 유지합니다. */ }
      return Response.json({ error: "잠시 후 다시 남겨주세요.", retryAfterMs }, {
        status: 429, headers: { ...headers, "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
      });
    }
    if (data.state === "conflict") return Response.json({ error: "새로고침 후 다시 남겨주세요." }, { status: 409, headers });
    if (!data.entry) throw new Error("Invalid database response");
    return Response.json({ entry: data.entry, deleteToken, retryAfterMs: cooldownMs(Number(data.entry.createdAt)) }, { status: data.state === "created" ? 201 : 200, headers });
  } catch { return Response.json({ error: "저장하지 못했어요. Supabase 설정을 확인해 주세요." }, { status: 503, headers }); }
}
