import { Link } from 'react-router-dom';
import { useProfileKpi } from '../hooks/useProfileKpi';
import { useProfile } from '../hooks/use_profile';
import RecentActivity from './recent_activity';
import { fileUrl } from '../../../shared/utils/file_url';
import { hasRole, ROLES } from '../../../shared/utils/role';
import type { ProfileData } from '../../auth/api/auth_api';

export default function ProfilePage() {
  // Quality Score, Success Rate, On Time/Overdue & Recent Activity hanya untuk Auditor Internal.
  // (Auditee cuma ada di mobile; KPI berbasis CAPA-nya dihitung di backend.)
  const showKpi = hasRole(ROLES.AuditorInternal);

  const { data: kpi, loading: kpiLoading, error: kpiError } = useProfileKpi(showKpi);
  const { profile, loading: profileLoading, error: profileError } = useProfile();

  if (kpiLoading || profileLoading) {
    return <div className="page-container">Loading...</div>;
  }

  if (kpiError || profileError) {
    return <div className="page-container error-text">{kpiError || profileError}</div>;
  }

  if (!profile) {
    return null;
  }

  // Role lain (mis. Quality Manager): cukup info akun + Edit Profile
  if (!showKpi || !kpi) {
    return (
      <div className="page-container">
        <div className="profile-bottom-grid">
          <ProfileIdentityCard profile={profile} />
          <AccountDetailsCard profile={profile} />
        </div>
      </div>
    );
  }

  const toPct = (rate: number) => Math.round(rate * 1000) / 10;
  const qualityPct = toPct(kpi.qualityScore);
  const successPct = toPct(kpi.successRate);
  const taskLabel = kpi.kpiBasis === 'Capa' ? 'CAPA' : 'audit';
  const qualityLabel =
    kpi.totalCompleted === 0
      ? `Belum ada ${taskLabel}`
      : qualityPct >= 90 ? 'Excellent' : qualityPct >= 75 ? 'Good' : 'Needs Attention';

  return (
    <div className="page-container">
      <div className="profile-grid">
        {/* Kolom kiri: foto + info dasar */}
        <ProfileIdentityCard profile={profile}>
          <div className="profile-quickstats">
            <div>
              <strong>{kpi.totalAssigned}</strong>
              <span>{kpi.kpiBasis === 'Capa' ? 'CAPA' : 'Audits'}</span>
            </div>
            <div>
              <strong>{kpi.totalFindingsReported}</strong>
              <span>Findings</span>
            </div>
          </div>
        </ProfileIdentityCard>

        {/* Quality Score: selesai tepat waktu / yang sudah dikerjakan */}
        <div className="profile-card center">
          <p className="card-label">QUALITY SCORE</p>
          <div className="score-circle">{qualityPct}%</div>
          <span className="score-tag">{qualityLabel}</span>
          <p className="target-text">
            {kpi.totalCompletedOnTime}/{kpi.totalCompleted} {taskLabel} tepat waktu
          </p>
        </div>

        {/* Success Rate: selesai / seluruh tugas yang diberikan */}
        <div className="profile-card dark">
          <p className="card-label">SUCCESS RATE</p>
          <p className="stat-big-number">
            {successPct}%{' '}
            <small>
              ({kpi.totalCompleted}/{kpi.totalAssigned})
            </small>
          </p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${successPct}%` }} />
          </div>
          <p className="target-text">Target: 85%</p>
        </div>

        {/* On Time / Overdue */}
        <div className="profile-stats">
          <div className="stat-box">
            <p className="stat-number">{kpi.totalCompletedOnTime}</p>
            <p>ON TIME</p>
          </div>
          <div className="stat-box">
            <p className="stat-number stat-danger">{kpi.totalOverdue}</p>
            <p>OVERDUE</p>
          </div>
        </div>
      </div>

      {/* Baris bawah: Account Details + Recent Activity */}
      <div className="profile-bottom-grid">
        <AccountDetailsCard profile={profile} />

        <RecentActivity />
      </div>
    </div>
  );
}

function ProfileIdentityCard({ profile, children }: { profile: ProfileData; children?: React.ReactNode }) {
  return (
    <div className="profile-card">
      <div className="profile-avatar">
        {profile.profilePhotoUrl ? (
          <img
            src={fileUrl(profile.profilePhotoUrl)}
            alt={profile.fullName}
            className="avatar-placeholder"
          />
        ) : (
          <div className="avatar-placeholder">{profile.fullName.charAt(0)}</div>
        )}
      </div>
      <h2 className="profile-name">{profile.fullName}</h2>
      <span className="role-badge">{profile.role}</span>
      {children}
    </div>
  );
}

function AccountDetailsCard({ profile }: { profile: ProfileData }) {
  return (
    <div className="profile-card">
      <h3 className="profile-detail">Account Details</h3>
      <div className="detail-row">
        <label>Full Name</label>
        <div className="detail-value">{profile.fullName}</div>
      </div>
      <div className="detail-row">
        <label>Email</label>
        <div className="detail-value">{profile.email}</div>
      </div>
      <div className="detail-row">
        <label>Role</label>
        <div className="detail-value">{profile.role}</div>
      </div>
      <Link to="/profile/edit" className="btn-edit-profile">
        Edit Profile
      </Link>
    </div>
  );
}
