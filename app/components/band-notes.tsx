"use client";
import { useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { socialLinks } from "../data/site";

export default function BandNotes() {
  const [thumbnailUnavailable, setThumbnailUnavailable] = useState(false);
  return <section id="notes" className="band-notes" aria-labelledby="notes-title">
    <div className="section-heading notes-heading" data-reveal><h2 id="notes-title">OFF STAGE</h2><p>우당탕탕 직장인 초보밴드 일기</p></div>
    <a className="notes-video" data-reveal href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="레드스트링 유튜브에서 영상 기록 보기">
      <div className="notes-cover">{thumbnailUnavailable ? <div className="notes-cover-fallback"><img src="/logo.svg" alt="Red String" width="946" height="239" /></div> : <img src="https://i.ytimg.com/vi/oAJFir5Wt3k/hqdefault.jpg" alt="레드스트링 밴드 일기 영상 썸네일" width="480" height="360" loading="lazy" decoding="async" onError={() => setThumbnailUnavailable(true)} />}<span className="notes-play" aria-hidden="true"><Play size={21} fill="currentColor" /></span></div>
      <div className="notes-caption"><span>유튜브에서 영상 보기</span><ArrowUpRight size={21} /></div>
    </a>
  </section>;
}
