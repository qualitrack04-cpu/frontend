// Ini supaya kalau ganti teks tidak perlu mengganti satu satu seperti sebelumnya (pada bagian signIn signUp)

import { ShieldCheck, CheckCircle2 } from 'lucide-react';
const features = ['ISO 9001 Ready', 'Real-time Analytics', 'Automated CAPA'];

export default function AuthBrandPanel() {
  return (
    <div className="auth-brand">
      <div className="auth-logo">
        <ShieldCheck size={28} />
        <span>QualiTrack</span>
      </div>
      <p className="auth-tagline">Checklist Today, Better tomorrow</p>

      <h1 className="auth-heading">Quality &amp; Audit Management, Simplified</h1>
      <p className="auth-subtitle">
        Plan audits, manage findings, track CAPA, and monitor quality performance in one integrated platform.
      </p>

      <div className="feature-badges">
        {features.map((feature) => (
          <span className="feature-badge" key={feature}>
            <CheckCircle2 size={16} />
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
}