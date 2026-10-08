import AuditSchedule from './audit_schedule';
import SummaryCards from './summary_cards';
import ComplianceScore from './compliance_score';
import AuditReport from './audit_report';
import QualityTrend from './quality_trend';

export default function DashboardPage() {
  const fullName = localStorage.getItem('fullName') || 'there';

  return (
    <div className="max-w-full m-0 text-left">
      <h1 className="text-[3rem] font-bold text-[#0f2c52] m-0 mb-[20px] tracking-[-0.5px] leading-[1.25]">Hello, {fullName}</h1>
      <p className="text-slate-500 mt-[-6px] mb-[24px] text-[13px]">Welcome back to your dashboard</p>

      <QualityTrend />

      <div className="grid grid-cols-1 min-[900px]:grid-cols-[2fr_1fr] gap-[20px] mb-[24px] items-start">
        <AuditSchedule />
        <SummaryCards />
      </div>

      <ComplianceScore />
      <AuditReport />
    </div>
  );
}