import { hash } from "../validation";
import { supabaseRest } from "../../../../lib/supabase-rest";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = { "Cache-Control": "no-store" };
  try {
    const origin = request.headers.get("Origin");
    if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "잘못된 요청" }, { status: 403, headers });
    const { id } = await params;
    const token = request.headers.get("X-Delete-Token") || "";
    if (!/^\d{1,12}$/.test(id) || !/^[a-f0-9]{64}$/.test(token)) return Response.json({ error: "삭제 권한이 없어요." }, { status: 403, headers });
    const query = new URLSearchParams({ id: `eq.${id}`, delete_hash: `eq.${await hash(token)}`, deleted_at: "is.null", select: "id" });
    const rows = await supabaseRest<{ id: number }[]>(`/guestbook?${query}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ deleted_at: Date.now() }) });
    if (!rows.length) return Response.json({ error: "삭제할 글이 없거나 권한이 없어요." }, { status: 404, headers });
    return Response.json({ ok: true }, { headers });
  } catch { return Response.json({ error: "삭제하지 못했어요." }, { status: 503, headers }); }
}
