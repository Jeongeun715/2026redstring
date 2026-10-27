import { memberProfiles } from "../../data/site";
import { supabaseRest } from "../../../lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

// 조회 API는 제공하지 않습니다. 집계는 Supabase에서만 확인합니다.
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("Origin");
    if (origin && origin !== new URL(request.url).origin)
      return Response.json({ ok: false }, { status: 403, headers });
    if (!request.headers.get("Content-Type")?.includes("application/json"))
      return Response.json({ ok: false }, { status: 415, headers });
    const raw = await request.text();
    if (raw.length > 500) return Response.json({ ok: false }, { status: 413, headers });
    let body;
    try { body = JSON.parse(raw); } catch { return Response.json({ ok: false }, { status: 400, headers }); }
    if (!body || typeof body !== "object" || !memberProfiles.some(m => m.id === body.memberId)
      || typeof body.requestId !== "string"
      || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.requestId))
      return Response.json({ ok: false }, { status: 400, headers });
    await supabaseRest("/rpc/redstring_send_flower", {
      method: "POST", body: JSON.stringify({ p_member_id: body.memberId, p_request_id: body.requestId }),
    });
    return Response.json({ ok: true }, { headers });
  } catch {
    return Response.json({ ok: false }, { status: 503, headers });
  }
}
