import bandSilhouette from "../assets/hero/yearend-band-cutout.png";

export default function HeroVisual() {
  return <div className="main-visual-slot hero-visual">
    <img className="hero-band-image" src={bandSilhouette.src} width={bandSilhouette.width} height={bandSilhouette.height} alt="거친 입자감의 다섯 명 밴드 실루엣" fetchPriority="high" draggable={false} />
  </div>;
}
