"use client";
import { useEffect } from "react";

// JS가 없거나 모션 줄이기 설정이면 모든 콘텐츠를 그대로 보여줍니다.
export default function ScrollMotion() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches || !("IntersectionObserver" in window)) return;
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.motion = "visible";
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.06, rootMargin: "0px 0px -12px 0px" });
    for (const element of elements) {
      element.dataset.motion = "pending";
      observer.observe(element);
    }
    const revealAll = () => {
      if (media.matches) {
        observer.disconnect();
        for (const element of elements) delete element.dataset.motion;
      }
    };
    media.addEventListener("change", revealAll);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", revealAll);
      for (const element of elements) delete element.dataset.motion;
    };
  }, []);
  return null;
}
