import { useEffect, useRef } from "react";
import "../landing.css";
import { LOGIN_URL, SIGNUP_URL, PLAY_STORE_URL } from "../config";
import {
  navLinks,
  aboutChips,
  features,
  flowSteps,
} from "../data";
import { useMouseFollow, useActiveSection } from "../hooks/hooks";
import Reveal from "./Reveal";
import TeamCarousel from "./TeamCarousel";

// Kartu fitur dibuat komponen sendiri supaya tiap kartu punya "sorotan" sendiri
function FeatureCard({ f }: { f: (typeof features)[number] }) {
  const ref = useMouseFollow<HTMLDivElement>();
  return (
    <div ref={ref} className="card feature">
      <f.icon className="icon" size={28} />
      <h3>{f.title}</h3>
      <p className="muted">{f.desc}</p>
      <div className="chips">
        {f.tags.map((t) => (
          <span className="chip small" key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// Video demo: otomatis diputar (tanpa suara) saat terlihat di layar,
// dan berhenti saat di-scroll keluar. Kontrol tetap tersedia.
function DemoVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const pausedByUser = useRef(false);
  const autoPausing = useRef(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true; // browser hanya mengizinkan autoplay jika video tanpa suara

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!pausedByUser.current) video.play().catch(() => {});
        } else if (!video.paused) {
          autoPausing.current = true; // pause otomatis, bukan dari user
          video.pause();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src="/videos/promo.mp4"
      controls
      muted
      loop
      playsInline
      preload="metadata"
      onPause={() => {
        // kalau user sendiri yang pause, jangan diputar ulang otomatis
        if (!autoPausing.current) pausedByUser.current = true;
        autoPausing.current = false;
      }}
      onPlay={() => { pausedByUser.current = false; }}
    >
      Browser kamu tidak mendukung pemutaran video.
    </video>
  );
}

const sectionIds = navLinks.map((l) => l.href.slice(1));

export default function LandingPage() {
  const active = useActiveSection(sectionIds);

  // Efek parallax: HP sedikit bergeser mengikuti posisi kursor di hero
  const phonesRef = useRef<HTMLDivElement>(null);
  const onHeroMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = phonesRef.current;
    if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    el.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    el.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };
  const onHeroLeave = () => {
    phonesRef.current?.style.setProperty("--mx", "0");
    phonesRef.current?.style.setProperty("--my", "0");
  };
  return (
    <div className="landing">
      {/* NAVBAR */}
      <header className="navbar">
        <a href="#home" className="brand">
          <img src="/images/logo.png" alt="QualiTrack" />
          QualiTrack
        </a>
        <nav>
          {navLinks.map((l) => {
            const isActive = active === l.href.slice(1);
            return (
              <a
                key={l.href}
                href={l.href}
                className={isActive ? "active" : undefined}
                aria-current={isActive ? "location" : undefined}
              >
                {l.label}
              </a>
            );
          })}
          <div className="nav-actions">
            <a href={LOGIN_URL} className="btn ghost">Sign in</a>
            <a href={SIGNUP_URL} className="btn">Sign up</a>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section id="home" className="section soft hero" onMouseMove={onHeroMove} onMouseLeave={onHeroLeave}>
        {/* <span className="pill">Quality Management System · Mobile App</span> */}
        <div className="hero-bg" aria-hidden="true">
          <span className="blob" />
        </div>
        <h1>Checklist Today,<br />Better Tomorrow</h1>
        <div className="hero-cta">
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="store-btn"
            aria-label="Download QualiTrack di Google Play"
          >
            <img className="store-icon" src="/images/google-play-icon.png" alt="" />
            <span>
              <small>GET IT ON</small>
              <strong>Google Play</strong>
            </span>
          </a>
        </div>
        <div className="hero-media">
          <div className="phones" ref={phonesRef}>
            <div className="phone p-left">
              <img src="/images/hero-phone-left.png" alt="" />
            </div>
            <div className="phone p-center">
              <img src="/images/hero-phone-center.png" alt="Tampilan aplikasi QualiTrack" />
            </div>
            <div className="phone p-right">
              <img src="/images/hero-phone-right.png" alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* DEMO VIDEO */}
      <section id="demo" className="section soft demo-section">
        <Reveal>
          <p className="eyebrow center">DEMO</p>
          <h2 className="center">See QualiTrack in action</h2>
          <p className="muted center demo-sub">
            Watch how an audit moves from plan to report, all from one app.
          </p>
        </Reveal>
        <Reveal delay={100}>
          <div className="demo-video">
            <DemoVideo />
          </div>
        </Reveal>
      </section>

      {/* ABOUT */}
      <section id="about" className="section about-section">
        <Reveal>
          <div className="about">
            <div className="about-text">
              <p className="eyebrow">ABOUT</p>
              <h2>Quality that's assured and documented.</h2>
              <p className="muted">
                Scattered findings, untracked CAPA and last-minute audit prep
                slow teams down. QualiTrack centralizes audit planning,
                checklists, findings and CAPA - so you're always ready for the
                next external audit.
              </p>
              <div className="chips">
                {aboutChips.map((c) => (
                  <span className="chip" key={c}>{c}</span>
                ))}
              </div>
            </div>
            <div className="about-visual">
              <img className="about-img" src="/images/about-phone.png" alt="Dashboard QualiTrack" />
              <div className="float-card fc-1"><i></i> CAPA closed</div>
              <div className="float-card fc-2"><i></i> 3 new findings</div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FEATURES */}
      <section id="features" className="section soft">
        <Reveal>
          <p className="eyebrow center">FEATURES</p>
          <h2 className="center">Everything for your<br />quality cycle</h2>
        </Reveal>
        <Reveal delay={100}>
          <div className="feature-grid">
            {features.map((f) => (
              <FeatureCard f={f} key={f.title} />
            ))}
          </div>
        </Reveal>
      </section>

      {/* FLOW */}
      <section id="flow" className="section grid-bg alt">
        <Reveal>
          <p className="eyebrow center">FLOW</p>
          <h2 className="center">From plan to proof in five steps</h2>
        </Reveal>
        <Reveal delay={100}>
          <div className="flow-box">
            {flowSteps.map((s, i) => (
              <div className="step" key={s.title}>
                <div className="step-icon">
                  <s.icon size={28} />
                  <span className="badge">{i + 1}</span>
                </div>
                <h3>{s.title}</h3>
                <strong className="role">{s.role}</strong>
                <p className="muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* TEAM */}
      <section id="team" className="section soft">
        <Reveal>
          <p className="eyebrow center">OUR TEAM</p>
          <h2 className="center">The people behind QualiTrack</h2>
        </Reveal>
        <Reveal delay={100}>
          <TeamCarousel />
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p className="footer-copy">
          © {new Date().getFullYear()} QualiTrack by PT. Sinergi Dimensi Informatika (Sindika). All rights reserved.
        </p>
      </footer>
    </div>
  );
}