"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { MoveHorizontal, RefreshCw } from "lucide-react";
import StringWall, { type StringEntry } from "./string-wall";
import { carouselTarget, dragDirection } from "../../lib/string-carousel";

type WirePage = { entries: StringEntry[]; hasMore: boolean; error?: string };
type Drag = { id: number; x: number; y: number; left: number; startedAt: number; moved: boolean };

export default function StringGallery({ createdEntry, own, busy, onCompose, onDelete }: {
  createdEntry: StringEntry | null; own: Record<string, string>; busy: boolean;
  onCompose: () => void; onDelete: (id: number) => Promise<boolean>;
}) {
  const [pages, setPages] = useState<Record<number, WirePage>>({}), [index, setIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0), [arrivalId, setArrivalId] = useState<number | null>(null);
  const latestFirst = useRef<WirePage | null>(null), snapshots = useRef(pages);
  snapshots.current = pages;
  const carousel = useRef<HTMLDivElement>(null), currentIndex = useRef(0), generation = useRef(0);
  const cursors = useRef<(number | null)[]>([null]);
  const jobs = useRef(new Map<number, Promise<void>>()), controllers = useRef(new Set<AbortController>());
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null), drag = useRef<Drag | null>(null);
  const blockClick = useRef(false), nativeScrollEnd = useRef(false);
  currentIndex.current = index;

  const load = useCallback((page: number, cursor: number | null) => {
    const running = jobs.current.get(page);
    if (running) return running;
    const epoch = generation.current, controller = new AbortController();
    controllers.current.add(controller);
    const job = (async () => {
      let result: WirePage;
      try {
        const response = await fetch(`/api/guestbook${cursor ? `?before=${cursor}` : ""}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("한줄을 불러오지 못했어요. 새로고침해 주세요.");
        const data = await response.json() as WirePage;
        if (!Array.isArray(data.entries)) throw new Error("한줄을 불러오지 못했어요.");
        result = { entries: data.entries.slice(0, 12), hasMore: data.hasMore === true };
      } catch (error) {
        if (controller.signal.aborted) return;
        result = { entries: [], hasMore: false, error: error instanceof Error ? error.message : "연결을 확인해 주세요." };
      } finally { controllers.current.delete(controller); }
      if (epoch !== generation.current) return;
      if (page === 0 && !result.error) latestFirst.current = result;
      setPages(previous => {
        const kept = result.error && previous[page]?.entries.length ? { ...previous[page], error: result.error } : result;
        const next = { ...previous, [page]: kept };
        // 현재 실과 양옆 실만 보관합니다. 관객 수만큼 화면/메모리가 늘어나지 않습니다.
        for (const key of Object.keys(next)) if (Math.abs(Number(key) - currentIndex.current) > 1) delete next[Number(key)];
        return next;
      });
    })();
    jobs.current.set(page, job);
    void job.finally(() => { if (jobs.current.get(page) === job) jobs.current.delete(page); });
    return job;
  }, []);

  useEffect(() => {
    generation.current++;
    for (const controller of controllers.current) controller.abort();
    controllers.current.clear(); jobs.current.clear(); cursors.current = [null];
    currentIndex.current = 0; setIndex(0); setArrivalId(null);
    latestFirst.current = null; setPages({});
    void load(0, null);
    return () => {
      generation.current++;
      for (const controller of controllers.current) controller.abort();
      controllers.current.clear();
    };
  }, [refreshKey, load]);

  useEffect(() => {
    if (!createdEntry) return;
    const base = latestFirst.current || snapshots.current[0] || snapshots.current[currentIndex.current];
    const oldEntries = base?.entries || [];
    const first: WirePage = {
      entries: [createdEntry, ...oldEntries.filter(entry => entry.id !== createdEntry.id)].slice(0, 12),
      hasMore: base?.hasMore === true || oldEntries.length >= 12,
    };
    generation.current++;
    for (const controller of controllers.current) controller.abort();
    controllers.current.clear(); jobs.current.clear(); cursors.current = [null];
    latestFirst.current = first;
    currentIndex.current = 0; setIndex(0); setPages({ 0: first });
    setArrivalId(createdEntry.id);
    // 먼저 기존 장식과 새 장식을 함께 유지하고, 서버 목록은 배경에서 갱신합니다.
    void load(0, null);
    const timer = setTimeout(() => setArrivalId(null), 1600);
    return () => clearTimeout(timer);
  }, [createdEntry, load]);

  const page = pages[index], canNext = page?.hasMore === true;
  const slideIndices = [...(index > 0 ? [index - 1] : []), index, ...(canNext ? [index + 1] : [])];
  const center = index > 0 ? 1 : 0;
  useEffect(() => {
    if (!page) { void load(index, cursors.current[index] ?? null); return; }
    if (index > 0 && !pages[index - 1]) void load(index - 1, cursors.current[index - 1] ?? null);
    if (canNext && page.entries.length) {
      const cursor = page.entries.at(-1)!.id;
      cursors.current[index + 1] = cursor;
      if (!pages[index + 1]) void load(index + 1, cursor);
    }
  }, [index, page, canNext, pages, load]);

  useLayoutEffect(() => {
    const element = carousel.current;
    if (!element) return;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    element.scrollLeft = center * element.clientWidth;
    const align = () => { element.scrollLeft = center * element.clientWidth; };
    const observer = new ResizeObserver(align);
    observer.observe(element);
    return () => observer.disconnect();
  }, [index, center, slideIndices.length]);

  const settle = useCallback(() => {
    const element = carousel.current;
    if (!element || drag.current?.moved || !element.clientWidth) return;
    const slot = Math.max(0, Math.min(slideIndices.length - 1, Math.round(element.scrollLeft / element.clientWidth)));
    const next = slideIndices[slot];
    if (next !== undefined && next !== index) setIndex(next);
  }, [index, slideIndices.join(",")]);
  useEffect(() => {
    const element = carousel.current;
    if (!element) return;
    nativeScrollEnd.current = "onscrollend" in element;
    element.addEventListener("scrollend", settle);
    return () => {
      element.removeEventListener("scrollend", settle);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, [settle]);
  function scheduleSettle() {
    if (nativeScrollEnd.current || drag.current?.moved) return;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(settle, 180);
  }
  function move(direction: -1 | 0 | 1) {
    const target = carouselTarget(index, direction, canNext);
    const slot = slideIndices.indexOf(target), element = carousel.current;
    if (slot < 0 || !element) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollTo({ left: slot * element.clientWidth, behavior: reduce ? "auto" : "smooth" });
    if (reduce) { if (target !== index) setIndex(target); }
    else if (!nativeScrollEnd.current) {
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(settle, 220);
    }
  }
  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    blockClick.current = false;
    if (event.pointerType !== "mouse" || event.button !== 0 || (event.target as HTMLElement).closest("dialog")) return;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, startedAt: Date.now(), moved: false };
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    if (!gesture.moved) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { drag.current = null; return; }
      if (Math.abs(dx) < 8) return;
      gesture.moved = true; blockClick.current = true;
      event.currentTarget.dataset.dragging = "true";
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    event.currentTarget.scrollLeft = gesture.left - dx;
  }
  function pointerEnd(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    drag.current = null;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (gesture.moved) move(cancelled ? 0 : dragDirection(event.clientX - gesture.x, Date.now() - gesture.startedAt, event.currentTarget.clientWidth));
  }
  async function remove(id: number) {
    if (!await onDelete(id)) return false;
    if (latestFirst.current) latestFirst.current = { ...latestFirst.current, entries: latestFirst.current.entries.filter(entry => entry.id !== id) };
    setPages(previous => Object.fromEntries(Object.entries(previous).map(([key, value]) => [key, { ...value, entries: value.entries.filter(entry => entry.id !== id) }])));
    if (page?.entries.length === 1 && index > 0) setIndex(index - 1);
    return true;
  }

  return <div className="guestbook-board" data-reveal>
    <div className="board-tools"><button onClick={() => setRefreshKey(value => value + 1)} disabled={!page} aria-label="기대평 새로고침"><RefreshCw size={18} className={!page ? "spinning" : ""} /></button></div>
    <p id="string-swipe-help" className="sr-only">좌우로 밀거나 드래그해서 다른 실을 볼 수 있어요. 키보드에서는 이 영역에 초점을 맞춘 뒤 왼쪽과 오른쪽 화살표를 눌러주세요.</p>
    <div ref={carousel} className="string-carousel" role="region" aria-roledescription="캐러셀" aria-label="연결된 기대평" aria-describedby="string-swipe-help" tabIndex={0}
      onScroll={scheduleSettle} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={event => pointerEnd(event)} onPointerCancel={event => pointerEnd(event, true)}
      onLostPointerCapture={() => { if (drag.current) { drag.current = null; delete carousel.current?.dataset.dragging; move(0); } }}
      onClickCapture={event => { if (blockClick.current && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); } }}
      onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); } }}>
      {slideIndices.map(number => {
        const data = pages[number];
        return <div className="string-slide" key={number} aria-hidden={number !== index} inert={number !== index}>
          <StringWall entries={data?.entries || []} own={own} busy={busy} loading={!data} freshId={number === index ? arrivalId : null} onCompose={onCompose} onDelete={remove} />
        </div>;
      })}
    </div>
    {(canNext || index > 0) && <p className="string-swipe-hint">옆으로 넘기세요<MoveHorizontal size={15} aria-hidden="true" /></p>}
    <div className="sr-only" aria-live="polite">{page?.error || (page ? "기대평을 불러왔어요." : "다른 실을 불러오는 중이에요.")}</div>
    {page?.error && <p className="gallery-error error" role="alert">{page.error}</p>}
  </div>;
}
