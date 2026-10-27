import { getSupabaseConfig, supabaseRest, SupabaseError } from "../../../lib/supabase-rest";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 상위 서버의 message/details/hint는 URL·데이터를 포함할 수 있어 반환하지 않습니다.
const allowedCodes = new Set([
  "NOT_CONFIGURED", "INVALID_URL", "42P01", "42501", "PGRST106", "PGRST205",
  "PGRST000", "PGRST001", "PGRST002", "PGRST003", "PGRST301", "PGRST302", "PGRST303",
]);

export async function GET() {
  let failedAt = "configuration";
  try {
    getSupabaseConfig();
    failedAt = "guestbook";
    await supabaseRest("/guestbook?select=id&limit=1");
    failedAt = "spotify_tokens";
    await supabaseRest("/spotify_tokens?select=id&limit=1");
    return Response.json({ ok: true, database: "connected" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const upstream = error instanceof SupabaseError ? error : null;
    const code = upstream && allowedCodes.has(upstream.code) ? upstream.code : null;
    const httpStatus = upstream && upstream.status >= 100 && upstream.status <= 599 ? upstream.status : null;
    let reason = "request_failed";
    if (code === "NOT_CONFIGURED") reason = "missing_environment_variables";
    else if (failedAt === "configuration") reason = "invalid_project_url";
    else if (code === "42P01" || code === "PGRST205") reason = "table_missing";
    else if (code === "42501") reason = "permission_denied";
    else if (code === "PGRST106") reason = "schema_not_exposed";
    else if (httpStatus === 401) reason = "authentication_failed";
    else if (httpStatus === 403) reason = "access_denied";
    else if (httpStatus === 404) reason = "table_or_api_missing";
    else if (httpStatus !== null && httpStatus >= 500) reason = "supabase_unavailable";
    else if (error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name)) reason = "request_timeout";
    return Response.json({
      ok: false,
      database: code === "NOT_CONFIGURED" ? "not_configured" : "check_sql_and_key",
      diagnostic_version: 2,
      failed_at: failedAt,
      reason,
      upstream_status: httpStatus,
      error_code: code,
    }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
