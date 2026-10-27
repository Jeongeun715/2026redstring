import { ArrowUpRight, Play } from "lucide-react";
import { YoutubeIcon } from "./social-icons";
import { socialLinks } from "../data/site";

export default function BandNotes() {
  return <section id="notes" className="band-notes" aria-labelledby="notes-title">
    <div className="notes-heading" data-reveal><span>OFF STAGE</span><h2 id="notes-title">밴드 노트</h2><p>합주와 공연을 준비하는 기록.</p></div>
    <a className="notes-video" data-reveal href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="레드스트링 유튜브에서 영상 기록 보기">
      <div className="notes-cover" aria-hidden="true"><div className="notes-cover-top"><span>RED STRING / RECORDS</span><YoutubeIcon size={21} /></div><img src="/logo.svg" alt="" width="946" height="239" /><span className="notes-play"><Play size={21} fill="currentColor" /></span><span className="notes-cover-bottom">REHEARSAL & LIVE</span></div>
      <div className="notes-caption"><span>유튜브에서 영상 보기</span><ArrowUpRight size={21} /></div>
    </a>
  </section>;
}
