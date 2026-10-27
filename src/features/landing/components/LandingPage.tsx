import "../landing.css";
import { LOGIN_URL, SIGNUP_URL } from "../config";
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

const sectionIds = navLinks.map((l) => l.href.slice(1));

export default function LandingPage() {
  const active = useActiveSection(sectionIds);
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
      <section id="home" className="section soft hero">
        {/* <span className="pill">Quality Management System · Mobile App</span> */}
        <h1>Checklist Today,<br />Better Tomorrow</h1>
        <div className="hero-media">
          <img src="/images/hero-phones.png" alt="Tampilan aplikasi QualiTrack" />
        </div>
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