"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Plus, Trash2, X } from "lucide-react";
import starOrnament from "../assets/ornaments/star.png";
import heartOrnament from "../assets/ornaments/heart.png";
import noteOrnament from "../assets/ornaments/note.png";
import pickOrnament from "../assets/ornaments/pick.png";

export type OrnamentKind = "star" | "heart" | "pick" | "note";
export type StringEntry = { id: number; nickname: string; message: string; createdAt: number; ornament?: OrnamentKind };
export const ornaments: { id: OrnamentKind; label: string }[] = [{ id: "star", label: "별" }, { id: "heart", label: "하트" }, { id: "note", label: "음표" }, { id: "pick", label: "기타 피크" }];
const ornamentImages = { star: starOrnament, heart: heartOrnament, note: noteOrnament, pick: pickOrnament };
export function Ornament({ kind }: { kind: OrnamentKind }) {
  const image = ornamentImages[kind] ?? ornamentImages.star;
  return <img src={image.src} width={image.width} height={image.height} alt="" aria-hidden="true" className={`ornament-art ornament-${kind}`} draggable={false} decoding="async" />;
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
