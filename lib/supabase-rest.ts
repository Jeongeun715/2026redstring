// 이 모듈은 서버 API에서만 사용합니다. Secret key를 클라이언트에 전달하지 않습니다.
export class SupabaseError extends Error {
  constructor(public status: number, public code = "") { super(`Supabase request failed (${status})`); }
}
export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key || /YOUR_PROJECT|YOUR_SECRET/.test(`${url}/${key}`)) throw new SupabaseError(503, "NOT_CONFIGURED");
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && ["127.0.0.1", "localhost"].includes(parsed.hostname))) throw new SupabaseError(503, "INVALID_URL");
  if (typeof window !== "undefined") throw new Error("Server-only module");
  return { url: parsed.origin, key };
}
export async function supabaseRest<T>(path: string, init: RequestInit = {}, fetcher: typeof fetch = fetch): Promise<T> {
  const { url, key } = getSupabaseConfig();
  if (!path.startsWith("/") || path.startsWith("//")) throw new Error("Invalid API path");
  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  headers.set("Content-Type", "application/json");
  const response = await fetcher(`${url}/rest/v1${path}`, { ...init, headers, cache: "no-store", signal: init.signal || AbortSignal.timeout(10000) });
  if (!response.ok) {
    let code = ""; try { code = ((await response.json()) as { code?: string }).code || ""; } catch {}
    // 요청 URL·키·응답 본문을 오류 메시지나 브라우저에 내보내지 않습니다.
    throw new SupabaseError(response.status, code);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export async function hmac(value: string) {
  const { key } = getSupabaseConfig();
  const cryptoKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(`red-string/v1/${value}`));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, "0")).join("");
}
