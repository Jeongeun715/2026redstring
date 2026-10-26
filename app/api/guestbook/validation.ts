export function validateEntry(body: unknown): { ok: true; value: { nickname: string; message: string; requestId: string; ornament: string } } | { ok: false; error: string } {
  if(!body || typeof body !== "object") return { ok: false, error: "입력 내용을 확인해 주세요." }; const b = body as Record<string, unknown>;
  if(typeof b.nickname !== "string" || typeof b.message !== "string" || typeof b.requestId !== "string") return { ok: false, error: "닉네임과 한줄을 입력해 주세요." };
  const nickname = b.nickname.trim().replace(/\s+/g, " "), message = b.message.trim().replace(/\s+/g, " ");
  if(nickname.length < 1 || nickname.length > 16) return { ok: false, error: "닉네임은 1~16자로 남겨주세요." };
  if(message.length < 1 || message.length > 100) return { ok: false, error: "기대 한줄은 1~100자로 남겨주세요." };
  if(b.consent !== true) return { ok: false, error: "방명록 표시 동의가 필요해요." }; if(b.website) return { ok: false, error: "잘못된 요청입니다." };
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(b.requestId)) return { ok: false, error: "새로고침 후 다시 시도해 주세요." };
  const ornament = b.ornament ?? "star";
  if(typeof ornament !== "string" || !["star", "heart", "pick", "note"].includes(ornament)) return { ok: false, error: "장식을 다시 골라주세요." };
  return { ok: true, value: { nickname, message, requestId: b.requestId, ornament } };
}
export async function hash(text: string) { return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)))).map(v => v.toString(16).padStart(2, "0")).join(""); }
