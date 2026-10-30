import { ArrowUpRight } from "lucide-react";
import { InstagramIcon, YoutubeIcon } from "./components/social-icons";
import BandStage from "./components/band-stage";
import Setlist from "./components/setlist";
import Guestbook from "./components/guestbook";
import BandNotes from "./components/band-notes";
import ScrollMotion from "./components/scroll-motion";
import HeroVisual from "./components/hero-visual";
import { eventInfo, socialLinks } from "./data/site";

export default function Home() {
  return <>
    <ScrollMotion />
    <a href="#main" className="skip">본문으로 바로가기</a>
    <header className="rs-header"><a href="#main" className="rs-logo" aria-label="Red String 홈"><img className="brand-logo" src="/logo.svg" alt="Red String" width="946" height="239" /></a></header>
    <main id="main">
      <section id="info" className="concert-ticket" aria-labelledby="concert-title">
        <HeroVisual />
        <h1 id="concert-title" className="yearend-title"><span className="yearend-title-year">2026</span>{" "}<span className="yearend-title-name">YEAR-END LIVE</span></h1>
        <div className="event-date" data-reveal><p>{eventInfo.date}</p><span>{eventInfo.scheduleNote}</span></div>
        <div className="ticket-tear" aria-hidden="true" />
        <a className="event-venue" data-reveal href={eventInfo.mapUrl} target="_blank" rel="noopener noreferrer">{eventInfo.venueName}<ArrowUpRight size={20} /></a>
      </section>
      <section id="members" className="members-section" aria-labelledby="members-title">
        <div className="section-heading" data-reveal><h2 id="members-title">ON STAGE</h2><p>이름을 눌러 꽃으로 응원해주세요.</p></div>
        <BandStage />
      </section>
      <section id="setlist" className="setlist-section" aria-labelledby="setlist-title"><div className="section-heading" data-reveal><h2 id="setlist-title">SET LIST</h2></div><Setlist /></section>
      <Guestbook />
      <BandNotes />
    </main>
    <footer className="rs-footer" data-reveal><a href="#main" className="rs-logo"><img className="brand-logo" src="/logo.svg" alt="Red String" width="946" height="239" /></a><nav className="footer-social" aria-label="레드스트링 소셜 채널"><a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="레드스트링 유튜브"><YoutubeIcon /></a><a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="레드스트링 인스타그램"><InstagramIcon size={23} /></a></nav><span>© 2026 RED STRING</span></footer>
  </>;
}
