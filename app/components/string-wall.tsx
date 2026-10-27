"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Plus, Trash2, X } from "lucide-react";

export type OrnamentKind = "star" | "heart" | "pick" | "note";
export type StringEntry = { id: number; nickname: string; message: string; createdAt: number; ornament?: OrnamentKind };
export const ornaments: { id: OrnamentKind; label: string }[] = [{ id: "star", label: "별" }, { id: "heart", label: "하트" }, { id: "note", label: "음표" }, { id: "pick", label: "기타 피크" }];
const ornamentColors: Record<OrnamentKind, string> = { star: "#F5C857", heart: "#D62839", note: "#176B4A", pick: "#D62839" };
export function Ornament({ kind }: { kind: OrnamentKind }) {
  return <svg viewBox="0 0 80 88" fill="none" aria-hidden="true" className={`ornament-art ornament-${kind}`} style={{ color: ornamentColors[kind] }} strokeLinecap="round" strokeLinejoin="round">
    <path d="M36 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2.2" />
    {kind === "star" ? <>
      <path d="m40 13 8 24 23 10-23 10-8 24-8-24L9 47l23-10Z" fill="currentColor" stroke="#A87E22" strokeWidth="1.1" />
      <path d="m40 25 4 17 16 5-16 5-4 17-4-17-16-5 16-5Z" stroke="#B7871F" strokeWidth="1.2" />
      <path d="m57 21 2 5 5 2-5 2-2 5-2-5-5-2 5-2ZM20 64l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5Z" fill="currentColor" />
    </> : kind === "heart" ? <>
      <path d="M35 12h10v8H35Z" fill="currentColor" />
      <path d="M40 79C32 72 8 55 8 37c0-19 23-24 32-8 9-16 32-11 32 8 0 18-24 35-32 42Z" fill="currentColor" />
      <path d="M40 68C29 59 18 47 18 38c0-9 11-13 17-4" stroke="#F7F1DF" strokeWidth="2" />
      <path d="m52 35 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#F7F1DF" />
    </> : kind === "note" ? <>
      <path d="M40 11v11" stroke="currentColor" strokeWidth="2.2" />
      <path d="m30 24 38-10v47c0 11-15 17-23 10-7-6-2-16 12-16V34l-16 4v32c0 11-15 17-23 10-8-7-2-19 12-17Z" fill="currentColor" /><path d="M34 29v24m-12 19c2-3 6-4 9-3" stroke="#F7F1DF" strokeWidth="2" strokeOpacity=".8" />
    </> : <>
      <path d="M35 12h10v6H35Z" fill="currentColor" />
      <path d="M40 17c15 0 29 3 29 15 0 17-16 41-29 49-13-8-29-32-29-49 0-12 14-15 29-15Z" fill="currentColor" /><path d="M23 36c0-7 8-11 15-10" stroke="#F7F1DF" strokeWidth="2" /><path d="m51 40 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#F7F1DF" />
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
