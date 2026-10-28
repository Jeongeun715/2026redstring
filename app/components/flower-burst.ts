export type FlowerFlight = {
  left: number;
  top: number;
  x: number;
  lift: number;
  turn: number;
  delay: number;
  duration: number;
  size: number;
};

// 클릭마다 새 궤적을 만들되 꽃은 팝업의 장면 안에서만 움직입니다.
export function createFlowerBurst(random: () => number = Math.random): FlowerFlight[] {
  const between = (min: number, max: number) => Math.round((min + random() * (max - min)) * 100) / 100;
  return Array.from({ length: 11 }, () => ({
    left: between(12, 88),
    top: between(40, 86),
    x: between(-92, 92),
    lift: between(-185, -72),
    turn: between(-240, 240),
    delay: between(0, .22),
    duration: between(1.3, 1.95),
    size: between(25, 43),
  }));
}
