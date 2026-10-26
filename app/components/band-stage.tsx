"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { members } from "../data/site";

function Instrument({ role }: { role: string; }) {
  return <svg viewBox="0 0 160 130" fill="none" aria-hidden="true" className="instrument-art"><g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {role === "VOCAL" ? <><rect x="63" y="14" width="36" height="63" rx="18" transform="rotate(22 81 46)" /><path d="m64 31 29 12m-33 0 29 12m-32 0 28 12M51 61c-12 34 29 48 43 18M68 92l-9 24m-20 0h40" /><path d="M77 103c26 22 54-15 68 3" /></> : role === "GUITAR" || role === "BASS" ? <><path d="m93 50 37-38 10 10-37 38M91 51c-11-7-22 0-22 11 0 10-16 4-24 11-13 10-9 29 2 39 11 10 31 13 40-1 6-10 0-22 10-24 13-2 15-18 6-28" /><circle cx="74" cy="88" r="10" /><path d="m71 91 65-73M61 104l13-15m-16 10 12 11m57-94-5-5m12 13 5 5M38 42l13-4m-7-5 2 12" /></> : role === "KEYS" ? <><path d="m23 53 107-24 14 57-107 24z" /><path d="m34 64 99-22m-87 20 10 42m4-45 10 42m4-45 10 42m4-45 10 42m4-45 10 42m4-45 10 42m4-45 10 42" /><path d="m50 60 5 22m9-26 5 22m23-28 5 22m9-26 5 22m9-26 5 22" strokeWidth="6" /><path d="m52 117 17-13m56-14 17 12" /></> : <><circle cx="84" cy="82" r="29" /><circle cx="84" cy="82" r="22" /><path d="m33 48 24 3-2 23-24-3zm58-10 26 3-3 24-26-4zM20 26l39 7M38 30l-6 67m-8 12 8-12 8 15m70-92 37 7m-19-4-5 76m-10 13 10-13 10 16M65 108l-5 13m46-17 9 14M50 19l20 25m25-35-9 32" /></>}
  </g></svg>;
}
export function Flower({ className = "" }: { className?: string; }) {
  return <svg className={className} viewBox="0 0 42 70" fill="none" aria-hidden="true"><path d="M23 25c-8 16 6 29-4 43m3-20c-15 1-16-13-16-13 11-1 16 8 16 13m0 10c13-1 16-13 16-13-11-2-16 7-16 13" stroke="#71876b" strokeWidth="2" /><path d="M21 11C11-4 0 11 10 20-5 28 9 40 20 29c8 15 23 3 14-9C49 11 33-2 25 11Z" fill="currentColor" /><circle cx="22" cy="20" r="5" fill="#e8ca92" /></svg>;
}
export default function BandStage() {
  const [burst, setBurst] = useState<{ name: string; id: number; } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function throwFlowers(name: string) {
    if (timer.current) clearTimeout(timer.current);
    setBurst({ name, id: Date.now() });
    timer.current = setTimeout(() => setBurst(null), 2400);
  }
  return <div className="band-stage"><div className="band-cards">{members.map((m, index) => <article className={`band-card band-${m.role.toLowerCase()}`} key={m.role}>
    <div className="band-card-top"><span className="part-no">0{index + 1}</span><h3>{m.role === "KEYS" ? "KEYBOARD" : m.role === "DRUMS" ? "DRUM" : m.role}</h3><span className="part-ko">{m.ko}</span></div>
    <Instrument role={m.role} /><div className="name-tickets">{m.names.map(name => <button key={name} className={burst?.name === name ? "name-ticket applauded" : "name-ticket"} aria-label={`${name}에게 꽃 던지기`} onClick={() => throwFlowers(name)}><span>{name}</span><span className="ticket-flower" aria-hidden="true">✳</span>{burst?.name === name && <span key={burst.id} className="flower-burst" aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <span className="flying-flower" key={i} style={{ "--flower-x": `${(i - 3) * 26}px`, "--flower-turn": `${(i - 3) * 24}deg`, "--flower-delay": `${i * .045}s`, "--flower-lift": `${-45 - (i % 3) * 18}px` } as CSSProperties}><Flower /></span>)}</span>}</button>)}</div>
  </article>)}</div><p className="flower-feedback" role="status">{burst ? `${burst.name}님에게 꽃을 보냈어요.` : "이름을 눌러 꽃을 보내주세요."}</p></div>;
}
