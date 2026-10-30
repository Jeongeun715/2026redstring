"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { X } from "lucide-react";
import { members, memberProfiles, type MemberProfile } from "../data/site";
import { newRequestId } from "../../lib/request-id";
import { createFlowerBurst, type FlowerFlight } from "./flower-burst";
import potatoBassist from "../assets/cheers/jihoon-potato-cutout.png";
import potatoSprite from "../assets/cheers/potato-sprite.png";

// 응원 꽃: 포인세티아·솔잎·열매·골드 리본. SVG라 작은 크기에서도 선명합니다.
export function Flower({ className = "" }: { className?: string }) {
  const petals = [-4, 47, 101, 151, 204, 256, 309];
  return <svg className={`christmas-flower ${className}`} viewBox="0 0 140 172" fill="none" aria-hidden="true">
    <path d="M66 86c-5 26 6 47 3 76m3-11-33-37m30 36 36-39" stroke="#E9DFC4" strokeWidth="5" strokeLinecap="round" />
    <path d="M66 86c-5 26 6 47 3 76m3-11-33-37m30 36 36-39" stroke="#176B4A" strokeWidth="2.8" strokeLinecap="round" />
    <g stroke="#4E8A64" strokeWidth="3" strokeLinecap="round">
      <path d="m41 117-17-5m21 10-19-2m24 7-19 1m23 5-19 3m23 3-17 5m56-26 16-6m-21 12 19-3m-24 8 20 1m-25 5 19 4m-24 1 17 7" />
    </g>
    <g fill="#176B4A" stroke="#E9DFC4" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M55 91 35 85l-8 4-1-12-10-1 3-12-11-9 16-1 4-10 10 8 12-4 1 13 11 5-7 25Z" />
      <path d="m86 87 18-7 9 3 1-12 10-2-4-12 10-10-16 1-5-10-9 9-12-3 1 13-11 7 8 23Z" />
      <path d="M64 122c-24-1-35-18-31-35 22 3 34 17 31 35Zm9 10c22-3 34-19 30-34-21 5-32 17-30 34Z" />
    </g>
    <path d="m22 62 29 22m65-31-26 27m-50 16 19 21m38-10-20 20" stroke="#81A985" strokeWidth="1.2" strokeLinecap="round" />
    <g stroke="#F2DCC0" strokeWidth="1.6" strokeLinejoin="round">
      {petals.map((angle, i) => <path key={angle} d="M70 65C52 46 53 27 66 8c18 18 23 40 4 57Z" transform={`rotate(${angle} 70 65)`} fill={i % 3 === 0 ? "#AB2135" : i % 3 === 1 ? "#D62839" : "#E44048"} />)}
    </g>
    <g stroke="#F0A391" strokeWidth="1.1" strokeLinejoin="round">
      {[20, 82, 143, 201, 263, 322].map((angle, i) => <path key={angle} d="M70 65c-12-12-12-25-3-39 13 13 18 28 3 39Z" transform={`rotate(${angle} 70 65)`} fill={i % 2 ? "#C32438" : "#ED5054"} />)}
    </g>
    <g fill="#E8BE61" stroke="#FFF0BB" strokeWidth=".8">
      <circle cx="65" cy="60" r="3.5" /><circle cx="73" cy="58" r="3.6" /><circle cx="78" cy="65" r="3.2" /><circle cx="71" cy="70" r="3.4" /><circle cx="63" cy="68" r="3" /><circle cx="69" cy="64" r="2.5" />
    </g>
    <g fill="#D62839" stroke="#E9DFC4" strokeWidth="1.2">
      <circle cx="28" cy="92" r="5" /><circle cx="20" cy="98" r="4.5" /><circle cx="30" cy="102" r="4.2" />
    </g>
    <path d="M69 146c-10-18-29-17-27-6 2 10 18 12 27 6Zm0 0c12-17 29-14 26-3-4 9-17 9-26 3Z" fill="#D8AB52" stroke="#F5DE9C" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="m65 149-10 20 10-4 4 5 4-20 10 16 3-7 8 1-17-16" fill="#E6BD66" stroke="#F5DE9C" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M65 143h10l2 8-11 1-1-9Z" fill="#F0D18B" stroke="#F5DE9C" strokeWidth="1.2" />
    <path d="m48 140 13 5m18 0 10-5" stroke="#A57835" strokeWidth="1.2" strokeLinecap="round" />
  </svg>;
}

function FlowerHead() {
  return <svg className="christmas-flower flower-head" viewBox="5 0 130 130" fill="none" aria-hidden="true">
    {[-4,47,101,151,204,256,309].map((angle,i)=><path key={angle} d="M70 65C52 46 53 27 66 8c18 18 23 40 4 57Z" transform={`rotate(${angle} 70 65)`} fill={i%3===0?"#AB2135":i%3===1?"#D62839":"#E44048"} />)}
    {[20,82,143,201,263,322].map((angle,i)=><path key={angle} d="M70 65c-12-12-12-25-3-39 13 13 18 28 3 39Z" transform={`rotate(${angle} 70 65)`} fill={i%2?"#C32438":"#ED5054"} />)}
    <g fill="#E8BE61"><circle cx="65" cy="60" r="3.5"/><circle cx="73" cy="58" r="3.6"/><circle cx="78" cy="65" r="3.2"/><circle cx="71" cy="70" r="3.4"/><circle cx="63" cy="68" r="3"/><circle cx="69" cy="64" r="2.5"/></g>
  </svg>;
}

function CheerArt({ potato, flying = false, className = "" }: { potato: boolean; flying?: boolean; className?: string }) {
  if (!potato) return flying ? <FlowerHead /> : <Flower className={className} />;
  const image = flying ? potatoSprite : potatoBassist;
  return <img className={`potato-art ${flying ? "potato-sprite" : "potato-bassist"} ${className}`} src={image.src} width={image.width} height={image.height} alt="" aria-hidden="true" draggable={false} />;
}
export default function BandStage() {
  const [active, setActive] = useState<MemberProfile | null>(null);
  const [burst, setBurst] = useState(0);
  const [flowers, setFlowers] = useState<FlowerFlight[]>([]);
  const [state, setState] = useState<"sending" | "sent" | "error">("sending");
  const dialog = useRef<HTMLDialogElement>(null);
  const pending = useRef<{ member: MemberProfile; requestId: string } | null>(null);
  const inFlight = useRef(false);
  const activeId = useRef<string | null>(null);
  const isPotato = active?.id === "bass-2";

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
    setFlowers(createFlowerBurst());
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
    <div className="member-name-list">{memberProfiles.filter(p => p.role === m.role).map(member => <button key={member.id} className="member-name-badge" aria-label={`${member.name}에게 ${member.id === "bass-2" ? "감자" : "꽃"} 보내기`} aria-haspopup="dialog" onClick={() => open(member)}><span>{member.name}</span></button>)}</div>
  </article>)}</div>
    <dialog ref={dialog} className="rs-dialog flower-dialog" aria-labelledby="flower-title" onClose={close} onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <button className="dialog-close" onClick={close} aria-label="응원 팝업 닫기"><X /></button>
      {active && <><span className="dialog-eyebrow">{active.role === "KEYS" ? "KEYBOARD" : active.role} · {active.part}</span><div className="flower-name-tag"><h3 id="flower-title">{active.name}</h3></div>
        <div className={`flower-scene${isPotato ? " potato-scene" : ""}`}><svg className="bouquet-thread" viewBox="0 0 300 180" fill="none" aria-hidden="true"><path d="M-5 138c80-100 200 100 310-30" stroke="currentColor" strokeWidth="1.8" /></svg><CheerArt potato={isPotato} className="main-flower" /><span key={burst} className="flower-burst" aria-hidden="true">{flowers.map((flower, i) => <span key={i} className="flying-flower" style={{ "--flower-left": `${flower.left}%`, "--flower-top": `${flower.top}%`, "--flower-x": `${flower.x}px`, "--flower-turn": `${flower.turn}deg`, "--flower-delay": `${flower.delay}s`, "--flower-lift": `${flower.lift}px`, "--flower-duration": `${flower.duration}s`, "--flower-size": `${flower.size * (isPotato ? 1.25 : 1)}px` } as CSSProperties}><CheerArt potato={isPotato} flying /></span>)}</span></div>
        <p className="flower-status" role="status">{state === "sending" ? "응원을 전하는 중…" : state === "error" ? "응원을 전하지 못했어요." : "응원이 닿았어요!"}</p>
        <button className="primary-button" disabled={state === "sending"} onClick={() => void send(active, state === "error")}>{state === "error" ? "다시 응원하기" : "한 번 더 응원하기"}</button>
      </>}
    </dialog>
  </div>;
}
