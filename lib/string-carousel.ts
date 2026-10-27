export function dragDirection(deltaX: number, elapsedMs: number, width: number): -1 | 0 | 1 {
  const distance = Math.abs(deltaX);
  const threshold = Math.min(70, Math.max(38, width * .18));
  const fast = distance >= 22 && distance / Math.max(1, elapsedMs) > .5;
  if (distance < threshold && !fast) return 0;
  return deltaX < 0 ? 1 : -1;
}

export function carouselTarget(current: number, direction: -1 | 0 | 1, canNext: boolean) {
  if (direction === -1) return Math.max(0, current - 1);
  if (direction === 1 && canNext) return current + 1;
  return current;
}
