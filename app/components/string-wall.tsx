"use client";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Plus, Trash2, X } from "lucide-react";

export type OrnamentKind = "star" | "heart" | "pick" | "note";
export type StringEntry = { id: number; nickname: string; message: string; createdAt: number; ornament?: OrnamentKind };
export const ornaments: { id: OrnamentKind; label: string }[] = [{ id: "star", label: "별" }, { id: "heart", label: "하트" }, { id: "note", label: "음표" }, { id: "pick", label: "기타 피크" }];
const ornamentColors: Record<OrnamentKind, string> = { star: "#F5C857", heart: "#D62839", note: "#176B4A", pick: "#D62839" };
const ornamentShapes: Record<OrnamentKind, string> = {
  star: "M38 20 48 40 72 39 54 54 62 79 40 65 17 80 23 55 5 40 30 39Z",
  heart: "M40 33 51 24 63 27 71 38 69 53 41 79 14 55 9 39 17 28 29 24Z",
  note: "M32 33 64 24 68 26 68 65 60 75 50 76 44 71 45 63 54 57 59 57 59 40 40 45 40 69 32 79 22 80 15 75 15 67 24 61 32 61Z",
  pick: "M16 26 29 22 47 21 61 25 70 35 69 47 59 64 43 80 36 79 19 61 10 44 10 34Z",
};
const ornamentCuts: Record<OrnamentKind, string> = {
  star: "m45 33 4 7-3 7-2-10Zm-27 22 7-2-4 5-5-2Zm34 16 7 6-8-2Z",
  heart: "m60 28 4 4-6-1Zm7 21 5-1-6 7 1-3ZM15 57l6-2-4 5Z",
  note: "m58 27 5-2-2 6Zm-22 17 5-2-2 4Zm16 17 2 5-5-4Z",
  pick: "m17 27 5 5-6-2Zm50 12 4 1-3 6-1-3ZM22 64l5-1-3 5Z",
};
export function Ornament({ kind }: { kind: OrnamentKind }) {
  const inkId = `ornament-ink-${useId().replace(/:/g, "")}`;
  const shape = ornamentShapes[kind];
  return <svg viewBox="0 0 80 88" fill="none" aria-hidden="true" className={`ornament-art ornament-${kind}`} style={{ color: ornamentColors[kind] }} strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="3">
    <defs><pattern id={inkId} width="17" height="19" patternUnits="userSpaceOnUse">
      <path d="M2 3h.9v1.2H2ZM11 1h.8v.8H11ZM7 12h1.2v.7H7ZM15 9h.7v1.1H15ZM3 17h.8v.7H3Z" fill="#0B0B0D" />
      <circle cx="6" cy="6" r=".45" fill="#0B0B0D" /><circle cx="12" cy="15" r=".5" fill="#F7F1DF" />
    </pattern></defs>
    <path d="m35 7 5-3 5 3 2 6-4 5h-6l-4-5Z" stroke="#F7F1DF" strokeWidth="2.8" />
    <path d="M40 0v10m0 7v16" stroke="#D62839" strokeWidth="2.7" />
    <path d={shape} transform="translate(1.5 2)" fill="#F7F1DF" stroke="#F7F1DF" strokeWidth="4.2" />
    <path d={shape} fill="currentColor" stroke="#F7F1DF" strokeWidth="3.2" />
    <path d={shape} fill={`url(#${inkId})`} opacity=".5" />
    <path d={ornamentCuts[kind]} fill="#0B0B0D" />
    {kind === "pick" && <>
      <title>RS</title>
      <path d="M24 35h10l5 5v8l-4 4 5 10h-8l-4-9v9h-6V41Zm5 6v6h3l1-1v-4l-1-1ZM46 35h9l4 4v5h-6v-2l-2-2h-3l-1 2v2l10 7 2 4v4l-4 4H45l-4-4v-6h6v3l2 2h3l1-2v-2l-10-7-2-4v-4Z" fill="#F7F1DF" fillRule="evenodd" />
      <path d="M30 34h1.8v8H30Zm17 23h1.8v7H47Z" fill="currentColor" />
    </>}
  </svg>;
}
function point(index: number, cols: number) {
  const row = Math.floor(index / cols);
  const col = row % 2 ? cols - 1 - index % cols : index % cols;
  return { x: (col + .5) * 1000 / cols, y: 34 + row * 126, row };
}
function wire(count: number, cols: number) {
  const points = Array.from({ length: count }, (_, i) => point(i, cols));
  let d = `M -20 20 Q 0 34 ${points[0].x} 34`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    d += a.row === b.row ? ` Q ${(a.x + b.x) / 2} ${a.y + 24} ${b.x} ${b.y}` : ` C ${a.x > 500 ? 1000 : 0} ${a.y + 20} ${a.x > 500 ? 1000 : 0} ${b.y - 20} ${b.x} ${b.y}`;
  }
  const last = points[points.length - 1];
  return d + ` Q ${last.x + (last.row % 2 ? -100 : 100)} ${last.y + 20} ${last.row % 2 ? -20 : 1020} ${last.y + 5}`;
}
export default function StringWall({ entries, own, busy, loading, freshId, onCompose, onDelete }: { entries: StringEntry[]; own: Record<string, string>; busy: boolean; loading: boolean; freshId: number | null; onCompose: () => void; onDelete: (id: number) => Promise<boolean> }) {
  const [activeId, setActiveId] = useState<number | null>(null), [confirm, setConfirm] = useState(false), [deleteError, setDeleteError] = useState("");
  const detail = useRef<HTMLDialogElement>(null);
  const active = entries.find(e => e.id === activeId);
  // 1페이지 12개. 이전 페이지를 가져와도 DOM과 화면 높이를 늘리지 않습니다.
  const showing = entries.slice(0, 12);
  const count = Math.max(8, Math.min(12, showing.length + 1));
  useEffect(() => {
    setConfirm(false); setDeleteError("");
    if (active) detail.current?.showModal(); else detail.current?.close();
  }, [activeId, !!active]);
  useEffect(() => {
    if (!active) return;
    const old = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = old; };
  }, [!!active]);

  return <><div className={`string-wall ${freshId && entries.some(entry => entry.id === freshId) ? "arrival-active" : ""}`} aria-busy={loading}>
    <div className="string-canvas" style={{ "--wide-height": `${Math.ceil(count / 4) * 126 + 24}px`, "--narrow-height": `${Math.ceil(count / 3) * 126 + 24}px` } as CSSProperties}>
      {[4, 3].map(cols => <svg key={cols} className={`wall-wire wire-${cols}`} viewBox={`0 0 1000 ${Math.ceil(count / cols) * 126 + 24}`} preserveAspectRatio="none" fill="none" aria-hidden="true"><path d={wire(count, cols)} /></svg>)}
      {Array.from({ length: count }, (_, index) => {
        const entry = showing[index], wide = point(index, 4), narrow = point(index, 3);
        return <div key={entry?.id ?? `space-${index}`} className={`wall-node ${entry ? `filled ${entry.id === freshId ? "fresh" : ""}` : "unfilled"}`} style={{ "--wx": `${wide.x / 10}%`, "--wy": `${wide.y}px`, "--nx": `${narrow.x / 10}%`, "--ny": `${narrow.y}px`, "--tilt": `${[5, -5, 3, -3][index % 4]}deg` } as CSSProperties}>
          <span className="thread-knot" /><span className="hanging-thread" />
          {entry ? <button className="ornament-button" aria-label={`${entry.nickname}님의 기대평 보기`} onClick={() => setActiveId(entry.id)}><Ornament kind={entry.ornament || "star"} /><span className="ornament-name">{entry.nickname}</span></button> : <button className="add-ornament" onClick={onCompose} aria-label="이 자리에 기대평 걸기"><span><Plus size={20} /></span></button>}
        </div>;
      })}
    </div>
  </div>
  <dialog ref={detail} className="rs-dialog message-dialog" aria-label={active ? `${active.nickname}님의 기대평` : "기대평"} onClose={() => setActiveId(null)} onClick={e => { if (e.target === e.currentTarget) detail.current?.close(); }}>{active && <>
    <button className="dialog-close" onClick={() => detail.current?.close()} aria-label="기대평 닫기"><X /></button><div className="message-ornament"><Ornament kind={active.ornament || "star"} /></div><p className="message-content">{active.message}</p><div className="message-signature"><b>{active.nickname}</b><time dateTime={new Date(active.createdAt).toISOString()}>{new Date(active.createdAt).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit", timeZone: "Asia/Seoul" })}</time></div>
    {own[active.id] && (confirm ? <div className="ornament-delete-confirm"><p>내 장식을 지울까요?</p><button disabled={busy} onClick={async () => { if (!await onDelete(active.id)) setDeleteError("삭제하지 못했어요. 다시 시도해 주세요."); }}>삭제</button><button disabled={busy} onClick={() => setConfirm(false)}>취소</button></div> : <button className="ornament-delete" onClick={() => setConfirm(true)}><Trash2 size={15} />내 장식 지우기</button>)}{deleteError && <p role="alert" className="error">{deleteError}</p>}
  </>}</dialog></>;
}
