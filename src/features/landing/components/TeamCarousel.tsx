import { useEffect, useRef } from "react";
import { Mail } from "lucide-react";
import { team } from "../data";

const SPEED = 0.5; // makin besar makin cepat

function Instagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function Linkedin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function TeamCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const pos = useRef(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const tick = () => {
      if (!paused.current) {
        const half = el.scrollWidth / 2;
        pos.current += SPEED;
        if (pos.current >= half) pos.current -= half;
        el.scrollLeft = pos.current;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const half = el.scrollWidth / 2;
    // saat user geser manual, ikuti posisinya dan buat tetap berputar
    if (paused.current) {
      if (el.scrollLeft >= half) el.scrollLeft -= half;
      else if (el.scrollLeft <= 0) el.scrollLeft += half;
      pos.current = el.scrollLeft;
    }
  };

  const pause = () => (paused.current = true);
  const resume = () => (paused.current = false);

  // daftar digandakan supaya putarannya terlihat tanpa putus
  const items = [...team, ...team];

  return (
    <div
      className="carousel"
      ref={trackRef}
      onScroll={handleScroll}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={() => setTimeout(resume, 1500)}
    >
      {items.map((p, i) => (
        <div className="team-card" key={i}>
          <img src={p.photo} alt={p.name} />
          <h3>{p.name}</h3>
          <div className="roles">
            {p.roles.map((r) => (
              <p key={r}>{r}</p>
            ))}
          </div>
          <div className="socials">
            <a
              href={p.email ? `https://mail.google.com/mail/?view=cm&fs=1&to=${p.email}` : "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
            <a href={p.instagram || "#"} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram />
            </a>
            <a href={p.linkedin || "#"} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}