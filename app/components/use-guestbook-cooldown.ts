"use client";
import { useCallback, useEffect, useState } from "react";
import { GUESTBOOK_COOLDOWN_MS, remainingSeconds } from "../../lib/guestbook-cooldown";

const storageKey = "redstring-cooldown-until";
export function useGuestbookCooldown() {
  const [until, setUntil] = useState(0), [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const restore = () => {
      try {
        const stored = Number(localStorage.getItem(storageKey));
        if (Number.isFinite(stored) && stored > Date.now() && stored <= Date.now() + GUESTBOOK_COOLDOWN_MS) {
          setUntil(stored); setSeconds(remainingSeconds(stored));
        } else { setUntil(0); setSeconds(0); }
      } catch { }
    };
    restore();
    const onStorage = (event: StorageEvent) => { if (event.key === storageKey) restore(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  useEffect(() => {
    if (!until) return;
    const update = () => {
      const next = remainingSeconds(until);
      setSeconds(next);
      if (!next) {
        setUntil(0);
        try { if (localStorage.getItem(storageKey) === String(until)) localStorage.removeItem(storageKey); } catch { }
      }
    };
    update();
    const timer = setInterval(update, 100);
    return () => clearInterval(timer);
  }, [until]);
  const start = useCallback((milliseconds: number) => {
    const deadline = Date.now() + Math.min(GUESTBOOK_COOLDOWN_MS, Math.max(0, milliseconds));
    setUntil(deadline); setSeconds(remainingSeconds(deadline));
    try { localStorage.setItem(storageKey, String(deadline)); } catch { }
  }, []);
  return { seconds, start };
}
