"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Clock3, X } from "lucide-react";
import { Ornament, ornaments, type OrnamentKind, type StringEntry } from "./string-wall";
import StringGallery from "./string-gallery";
import { useGuestbookCooldown } from "./use-guestbook-cooldown";
import { newRequestId } from "../../lib/request-id";
import { retryDelay } from "../../lib/guestbook-cooldown";
type OwnEntry = Record<string, string>;

export default function Guestbook() {
  const [own, setOwn] = useState<OwnEntry>({}), [createdEntry, setCreatedEntry] = useState<StringEntry | null>(null);
  const [nickname, setNickname] = useState(""), [message, setMessage] = useState(""), [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const [composeOpen, setComposeOpen] = useState(false), [ornament, setOrnament] = useState<OrnamentKind>("star");
  const requestId = useRef<string | null>(null), trap = useRef<HTMLInputElement>(null), composer = useRef<HTMLDialogElement>(null);
  const cooldown = useGuestbookCooldown();
  useEffect(() => {
    try { const stored = JSON.parse(localStorage.getItem("redstring-own") || "{}"); if (stored && typeof stored === "object" && !Array.isArray(stored)) setOwn(stored); } catch { }
  }, []);
  useEffect(() => {
    if (!composeOpen) { composer.current?.close(); return; }
    composer.current?.showModal();
    const old = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = old; };
  }, [composeOpen]);
  function saveOwn(next: OwnEntry) { setOwn(next); try { localStorage.setItem("redstring-own", JSON.stringify(next)); } catch { } }
  function compose() { setError(""); setNotice(""); setComposeOpen(true); }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (busy || cooldown.seconds > 0) return;
    setBusy(true); setError(""); setNotice("");
    try {
      requestId.current ??= newRequestId();
      const response = await fetch("/api/guestbook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nickname, message, ornament, consent, website: trap.current?.value || "", requestId: requestId.current }) });
      const data = await response.json() as { entry: StringEntry; deleteToken: string; error?: string; retryAfterMs?: number };
      if (response.status === 429) {
        cooldown.start(retryDelay(data.retryAfterMs, response.headers.get("Retry-After")));
        return;
      }
      if (!response.ok) throw new Error(data.error || "저장하지 못했어요. 다시 시도해 주세요.");
      saveOwn({ ...own, [data.entry.id]: data.deleteToken });
      cooldown.start(retryDelay(data.retryAfterMs, null));
      setCreatedEntry(data.entry);
      setNickname(""); setMessage(""); setConsent(false); requestId.current = null;
      setComposeOpen(false);
    } catch (e) { setError(e instanceof Error ? e.message : "연결을 확인해 주세요."); }
    finally { setBusy(false); }
  }
  async function remove(id: number) {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/guestbook/${id}`, { method: "DELETE", headers: { "X-Delete-Token": own[id] } });
      if (!response.ok) throw new Error("삭제하지 못했어요. 다시 시도해 주세요.");
      const next = { ...own }; delete next[id]; saveOwn(next); setNotice("내 장식을 삭제했어요."); return true;
    } catch (e) { setError(e instanceof Error ? e.message : "연결을 확인해 주세요."); return false; }
    finally { setBusy(false); }
  }
  return <section id="guestbook" className="guestbook-section" aria-labelledby="guestbook-title"><div className="section-heading" data-reveal><h2 id="guestbook-title">RED STRING</h2><p>우리의 실을 이어주세요.</p></div>
    <StringGallery createdEntry={createdEntry} own={own} busy={busy} onCompose={compose} onDelete={remove} />
    <button className="primary-button compose-button" onClick={compose}>기대평 남기기<ArrowUpRight size={20} /></button>
    {(notice || (error && !composeOpen)) && <div className="wall-feedback" aria-live="polite">{notice && <p className="success"><Check size={16} />{notice}</p>}{error && !composeOpen && <p className="error">{error}</p>}</div>}
    <dialog ref={composer} className="rs-dialog compose-dialog" aria-label="기대평 작성" onClose={() => setComposeOpen(false)} onClick={event => { if (event.target === event.currentTarget) setComposeOpen(false); }}><button className="dialog-close" onClick={() => setComposeOpen(false)} aria-label="작성 창 닫기"><X /></button>
      <form onSubmit={submit} className="guest-form"><fieldset className="ornament-picker"><legend>장식 고르기</legend><div>{ornaments.map(o => <button type="button" key={o.id} aria-label={`${o.label} 장식 선택`} aria-pressed={ornament === o.id} onClick={() => { setOrnament(o.id); requestId.current = null; }}><Ornament kind={o.id} />{ornament === o.id && <Check className="decor-check" size={15} />}</button>)}</div></fieldset>
        <label htmlFor="nickname">닉네임<span>{nickname.length}/16</span></label><input id="nickname" required maxLength={16} autoComplete="nickname" placeholder="이름을 남겨주세요" value={nickname} onChange={event => { setNickname(event.target.value); requestId.current = null; }} />
        <label htmlFor="message">기대평<span>{message.length}/100</span></label><textarea id="message" required maxLength={100} rows={3} placeholder="공연을 기다리는 마음" value={message} onChange={event => { setMessage(event.target.value); requestId.current = null; }} />
        <div className="honeypot" aria-hidden="true"><label>Website<input ref={trap} name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <label className="consent"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} /><span>닉네임과 한줄 공개에 동의해요.</span></label>
        <button className="primary-button" type="submit" disabled={busy || cooldown.seconds > 0 || !nickname.trim() || !message.trim() || !consent}>
          <span>{busy ? "실을 이어주는 중…" : cooldown.seconds > 0 ? <><span role="timer" aria-live="off">{cooldown.seconds}초</span> 후 실 이어주기</> : "실 이어주기"}</span>
          {cooldown.seconds > 0 ? <Clock3 size={20} /> : <ArrowUpRight size={20} />}
        </button>
        <div className="form-feedback" role="status">{error && <p className="error">{error}</p>}</div>
      </form>
    </dialog>
  </section>;
}
