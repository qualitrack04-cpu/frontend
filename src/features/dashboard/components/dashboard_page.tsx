import AuditSchedule from './audit_schedule';
import SummaryCards from './summary_cards';
import ComplianceScore from './compliance_score';
import AuditReport from './audit_report';

export default function DashboardPage() {

  const fullName = localStorage.getItem('fullName') || 'there';

  return (
    <div className="page-container">
      <h1>Hello, {fullName}</h1>
      <p className="page-subtitle">Welcome back to your dashboard</p>

      <div className="dashboard-top-grid">
        <AuditSchedule />
        <SummaryCards />
      </div>

      <ComplianceScore />
      <AuditReport />
    </div>
  );
}