import handsPoster from "../assets/hero/hands-poster.webp";

export default function HeroVisual() {
  return <div className="main-visual-slot hero-visual">
    <div className="hero-collage">
      <img
        className="hero-hands-image"
        src={handsPoster.src}
        width={handsPoster.width}
        height={handsPoster.height}
        alt="마이크, 기타, 베이스, 건반, 드럼을 연주하는 열두 멤버의 손을 담은 빈티지 콜라주"
        fetchPriority="high"
        decoding="async"
        draggable={false}
      />
    </div>
  </div>;
}
