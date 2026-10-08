import { CheckCircle2 } from 'lucide-react';
import splashLogo from '../../../assets/splash.png';

const features = ['ISO 9001 Ready', 'Real-time Analytics', 'Automated CAPA'];

interface AuthBrandPanelProps {
  side?: 'left' | 'right';
}

const gradientClass = 'bg-gradient-to-br from-[#0f2c52] to-[#1e6fd9]';

function BrandContent() {
  return (
    <>
      <div className="mb-9">
        <img
          src={splashLogo}
          alt="QualiTrack"
          className="max-w-[220px] h-auto object-contain block"
        />
      </div>

      <div className="text-[40px] font-bold leading-[1.15] text-white !m-0 !mb-6 max-w-[520px] text-left !tracking-[-0.04em]">
        Quality &amp; Audit Management, Simplified
      </div>
      <p className="text-blue-100 text-lg leading-snug max-w-[420px] text-left !m-0 !mb-9">
        Plan audits, manage findings, track CAPA, and monitor quality performance in one integrated platform.
      </p>

      <div className="flex flex-wrap gap-3.5">
        {features.map((feature) => (
          <span
            key={feature}
            className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-base font-semibold"
          >
            <CheckCircle2 size={16} className="text-green-400 shrink-0" />
            {feature}
          </span>
        ))}
      </div>
    </>
  );
}

export default function AuthBrandPanel({ side = 'left' }: AuthBrandPanelProps) {
  if (side === 'left') {
    return (
      <>
        <div
          className={`hidden md:block absolute top-0 bottom-0 left-0 z-0 pointer-events-none ${gradientClass}`}
          style={{ clipPath: 'polygon(0 0, 100% 0, 83.6% 100%, 0 100%)', width: '54%' }}
        />
        <div className="hidden md:flex flex-[0_0_50%] z-10 text-white flex-col justify-center pl-[56px] pr-[40px] py-16 [&_*]:box-border">
          <BrandContent />
        </div>
      </>
    );
  }

  // Kanan: background dan konten dalam SATU wrapper, jadi posisinya pasti sejajar.
  return (
    <div className="hidden md:block absolute top-0 bottom-0 right-0 w-[54%] z-10 text-white [&_*]:box-border">
      <div
        className={`absolute inset-0 z-0 pointer-events-none ${gradientClass}`}
        style={{ clipPath: 'polygon(16.4% 0, 100% 0, 100% 100%, 0 100%)' }}
      />
      <div
        className="relative z-10 h-full flex flex-col justify-center py-16 pr-[40px]"
        style={{ paddingLeft: '15vw' }}
      >
        <BrandContent />
      </div>
    </div>
  );
}