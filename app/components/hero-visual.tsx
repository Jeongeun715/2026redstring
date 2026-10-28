import bandSilhouette from "../assets/hero/band-silhouette.png";

export default function HeroVisual() {
  return <div className="main-visual-slot hero-visual" role="img" aria-label="겹친 빈티지 종이 위에서 연주하는 밴드 실루엣">
    <span className="hero-sheet hero-sheet-back" aria-hidden="true" />
    <span className="hero-sheet hero-sheet-red" aria-hidden="true" />
    <div className="hero-sheet hero-sheet-front" aria-hidden="true">
      <img className="hero-band-image" src={bandSilhouette.src} width={bandSilhouette.width} height={bandSilhouette.height} alt="" fetchPriority="high" draggable={false} />
    </div>
  </div>;
}
