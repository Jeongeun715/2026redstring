export const GUESTBOOK_COOLDOWN_MS = 10_000;

export function cooldownMs(createdAt: number, now = Date.now()) {
  if (!Number.isFinite(createdAt)) return GUESTBOOK_COOLDOWN_MS;
  return Math.min(GUESTBOOK_COOLDOWN_MS, Math.max(0, createdAt + GUESTBOOK_COOLDOWN_MS - now));
}

export function remainingSeconds(until: number, now = Date.now()) {
  return Math.max(0, Math.ceil((until - now) / 1000));
}

export function retryDelay(value: unknown, header: string | null) {
  if (typeof value === "number" && Number.isFinite(value))
    return Math.min(GUESTBOOK_COOLDOWN_MS, Math.max(0, value));
  const seconds = header === null ? NaN : Number(header);
  return Number.isFinite(seconds)
    ? Math.min(GUESTBOOK_COOLDOWN_MS, Math.max(0, seconds * 1000))
    : GUESTBOOK_COOLDOWN_MS;
}
