import { CheckCircle2 } from 'lucide-react';
import splashLogo from '../../../assets/splash.png';
const features = ['ISO 9001 Ready', 'Real-time Analytics', 'Automated CAPA'];

export default function AuthBrandPanel() {
  return (
    <div className="auth-brand">
      <div className="auth-logo-wrapper">
        <img
          src={splashLogo}
          alt="QualiTrack - Checklist Today, Better tomorrow"
          className="auth-splash-logo"
        />
      </div>

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