import { supabaseRest, SupabaseError } from "../../../lib/supabase-rest";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await supabaseRest("/guestbook?select=id&limit=1");
    await supabaseRest("/spotify_tokens?select=id&limit=1");
    return Response.json({ ok: true, database: "connected" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const configured = !(error instanceof SupabaseError && error.code === "NOT_CONFIGURED");
    return Response.json({ ok: false, database: configured ? "check_sql_and_key" : "not_configured" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
