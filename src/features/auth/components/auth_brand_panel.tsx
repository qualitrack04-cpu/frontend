import { CheckCircle2 } from 'lucide-react';
import splashLogo from '../../../assets/splash.png';

const features = ['ISO 9001 Ready', 'Real-time Analytics', 'Automated CAPA'];

export default function AuthBrandPanel() {
  return (
    <div className="hidden md:flex flex-[0_0_60%] box-border bg-gradient-to-br from-[#0a2647] to-[#1e6fd9] text-white px-14 py-14 pr-[220px] flex-col justify-center [clip-path:polygon(0_0,90%_0,75%_100%,0_100%)]">
      <div className="mb-8">
        <img
          src={splashLogo}
          alt="QualiTrack - Checklist Today, Better tomorrow"
          className="max-w-[220px] h-auto object-contain block"
        />
      </div>

      <h1 className="text-[40px] font-bold leading-[1.15] text-white m-0 mb-5 max-w-[460px] text-left">
        Quality &amp; Audit Management, Simplified
      </h1>
      <p className="text-blue-100 text-base leading-relaxed max-w-[420px] mb-8 text-left">
        Plan audits, manage findings, track CAPA, and monitor quality performance in one integrated platform.
      </p>

      <div className="flex flex-wrap gap-3">
        {features.map((feature) => (
          <span
            key={feature}
            className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold"
          >
            <CheckCircle2 size={16} className="text-green-400" />
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
}