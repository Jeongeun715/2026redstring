"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { X } from "lucide-react";
import { members, memberProfiles, type MemberProfile } from "../data/site";
import { newRequestId } from "../../lib/request-id";

export function Flower({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 96 116" fill="none" aria-hidden="true">
    <path d="M48 55c-7 21 5 39-2 58" stroke="#176B4A" strokeWidth="4" strokeLinecap="round" />
    <path d="M47 91C25 94 17 75 19 68c18 0 29 8 28 23Zm1 9c20 3 30-13 29-21-19-1-28 6-29 21Z" fill="#176B4A" />
    <path d="m25 77 19 12m26-3-21 12" stroke="#8BB791" strokeWidth="1.5" />
    <path d="M48 52C20 57 4 45 3 28c20-2 35 4 45 24Zm0 0c1-26 13-43 31-45 4 19-5 35-31 45Z" fill="#176B4A" />
    <g fill="currentColor">
      <path d="M48 50C33 37 31 19 44 3c15 13 19 29 4 47Z" />
      <path d="M48 50c-23 1-37-10-38-28 21-3 36 7 38 28Z" />
      <path d="M48 50c-23 0-36 11-35 29 21 0 33-9 35-29Z" />
      <path d="M48 50c-8 19-3 34 14 43 11-17 5-32-14-43Z" />
      <path d="M48 50c18-12 34-9 44 6-15 14-30 10-44-6Z" />
      <path d="M48 50c0-23 11-37 30-37 2 20-8 34-30 37Z" />
    </g>
    <path d="m46 15 2 31m-27-16 22 18m-19 22 21-17m15 28L50 56m30 0-26-5m17-29L51 46" stroke="#F7F1DF" strokeOpacity=".3" strokeWidth="1.3" />
    <g fill="#F5C857"><circle cx="45" cy="46" r="3.6" /><circle cx="52" cy="46" r="3.2" /><circle cx="48" cy="53" r="3.5" /><circle cx="54" cy="52" r="2.5" /><circle cx="41" cy="52" r="2.5" /></g>
    <path d="M46 100c-10-10-17-6-13 0 3 4 10 4 13 0Zm0 0c8-9 16-5 13 1-3 4-10 3-13-1Zm0 0-6 12m6-12 8 12" stroke="#F7F1DF" strokeWidth="2" strokeLinecap="round" />
  </svg>;
}
export default function BandStage() {
  const [active, setActive] = useState<MemberProfile | null>(null);
  const [burst, setBurst] = useState(0);
  const [state, setState] = useState<"sending" | "sent" | "error">("sending");
  const dialog = useRef<HTMLDialogElement>(null);
  const pending = useRef<{ member: MemberProfile; requestId: string } | null>(null);
  const inFlight = useRef(false);
  const activeId = useRef<string | null>(null);

  useEffect(() => {
    if (!active) { dialog.current?.close(); return; }
    dialog.current?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = old; };
  }, [active]);

  async function send(member: MemberProfile, retry = false) {
    if (inFlight.current) return;
    inFlight.current = true;
    if (!retry) pending.current = { member, requestId: newRequestId() };
    const request = pending.current;
    if (!request) { inFlight.current = false; return; }
    setState("sending");
    setBurst(x => x + 1);
    try {
      const response = await fetch("/api/flowers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId: request.member.id, requestId: request.requestId }), signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error("Flower unavailable");
      pending.current = null;
      if (activeId.current === request.member.id) setState("sent");
    } catch {
      if (activeId.current === request.member.id) setState("error");
    } finally { inFlight.current = false; }
  }
  function open(member: MemberProfile) {
    if (inFlight.current) return;
    activeId.current = member.id;
    setActive(member);
    void send(member);
  }
  function close() { activeId.current = null; setActive(null); }

  return <div className="band-stage"><div className="band-cards">{members.map(m => <article className={`band-card band-${m.role.toLowerCase()}`} key={m.role} data-reveal>
    <div className="band-card-top"><h3>{m.role === "KEYS" ? "KEYBOARD" : m.role === "DRUMS" ? "DRUM" : m.role}</h3><span>{m.ko}</span></div>
    <div className="member-name-list">{memberProfiles.filter(p => p.role === m.role).map(member => <button key={member.id} className="member-name-badge" aria-label={`${member.name}에게 꽃 보내기`} aria-haspopup="dialog" onClick={() => open(member)}><span>{member.name}</span></button>)}</div>
  </article>)}</div>
    <dialog ref={dialog} className="rs-dialog flower-dialog" aria-labelledby="flower-title" onClose={close} onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <button className="dialog-close" onClick={close} aria-label="꽃 보내기 닫기"><X /></button>
      {active && <><span className="dialog-eyebrow">{active.role === "KEYS" ? "KEYBOARD" : active.role} · {active.part}</span><h3 id="flower-title">{active.name}</h3>
        <div className="flower-scene"><svg className="bouquet-thread" viewBox="0 0 300 180" fill="none" aria-hidden="true"><path d="M-5 138c80-100 200 100 310-30" stroke="currentColor" strokeWidth="1.5" /></svg><Flower className="main-flower" /><span key={burst} className="flower-burst" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <span key={i} className="flying-flower" style={{ "--flower-x": `${(i - 4) * 31}px`, "--flower-turn": `${(i - 4) * 22}deg`, "--flower-delay": `${i * .035}s`, "--flower-lift": `${-65 - (i % 3) * 30}px` } as CSSProperties}><Flower /></span>)}</span></div>
        <p className="flower-status" role="status">{state === "sending" ? "응원을 전하는 중…" : state === "error" ? "응원을 전하지 못했어요." : "응원이 닿았어요!"}</p>
        <button className="primary-button" disabled={state === "sending"} onClick={() => void send(active, state === "error")}>{state === "error" ? "다시 응원하기" : "한 번 더 응원하기"}<Flower /></button>
      </>}
    </dialog>
  </div>;
}
