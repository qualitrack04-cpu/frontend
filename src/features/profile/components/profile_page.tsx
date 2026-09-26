import { Link } from 'react-router-dom';
import { Clock, AlertTriangle, Users } from 'lucide-react';
import { useProfileKpi } from '../hooks/useProfileKpi';
import { useProfile } from '../hooks/use_profile';
import RecentActivity from './recent_activity';
import { fileUrl } from '../../../shared/utils/file_url';
import { hasRole, ROLES } from '../../../shared/utils/role';
import type { ProfileData } from '../../auth/api/auth_api';

export default function ProfilePage() {
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

  // Selisih success rate vs target 85%
  const targetDiff = Math.round((successPct - 85) * 10) / 10;
  const diffLabel = targetDiff >= 0 ? `+${targetDiff}%` : `${targetDiff}%`;

  return (
    <div className="page-container">
      <div className="profile-grid">

        {/* Kolom 1: Identity */}
        <ProfileIdentityCard profile={profile}>
          <div className="profile-quickstats">
            <div>
              <strong>{kpi.totalAssigned}</strong>
              <span>{kpi.kpiBasis === 'Capa' ? 'CAPA' : 'Audits'}</span>
            </div>
            <div>
              <strong>{(Math.min(qualityPct / 20, 5)).toFixed(1)}</strong>
              <span>Rating</span>
            </div>
          </div>
        </ProfileIdentityCard>

        {/* Kolom 2: Quality Score */}
        <div className="profile-card center">
          <p className="card-label">QUALITY SCORE</p>
          <div className="score-circle">{qualityPct}<span className="score-pct">%</span></div>
          <span className="score-tag">{qualityLabel}</span>
          <p className="target-text">
            {kpi.totalCompletedOnTime}/{kpi.totalCompleted} {taskLabel} tepat waktu
          </p>
        </div>

        {/* Kolom 3: Success Rate */}
        <div className="profile-card dark">
          <p className="card-label-light">SUCCESS RATE</p>
          <p className="stat-big-number">
            {successPct}%{' '}
            <small>({kpi.totalCompleted}/{kpi.totalAssigned})</small>
          </p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(successPct, 100)}%` }} />
          </div>
          <div className="success-rate-footer">
            <span className="target-text">Target: 85%</span>
            <span className={`diff-badge ${targetDiff >= 0 ? 'diff-positive' : 'diff-negative'}`}>
              {diffLabel}
            </span>
          </div>
          <p className="success-volume-target">
            Volume: {kpi.totalCompleted}/{kpi.totalAssigned} {taskLabel}
          </p>
        </div>

        {/* Kolom 4: On Time + Overdue */}
        <div className="profile-stats">
          <div className="stat-box">
            <div className="stat-box-row">
              <div>
                <p className="stat-number">{kpi.totalCompletedOnTime}</p>
                <p className="stat-box-label">ON TIME</p>
              </div>
              <span className="stat-icon stat-icon-green">
                <Clock size={18} strokeWidth={2} />
              </span>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-box-row">
              <div>
                <p className="stat-number stat-danger">{kpi.totalOverdue}</p>
                <p className="stat-box-label">OVERDUE</p>
              </div>
              <span className="stat-icon stat-icon-red">
                <AlertTriangle size={18} strokeWidth={2} />
              </span>
            </div>
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
    <div className="profile-card profile-identity-card">
      <div className="profile-avatar-wrapper">
        {profile.profilePhotoUrl ? (
          <img
            src={fileUrl(profile.profilePhotoUrl)}
            alt={profile.fullName}
            className="avatar-img"
          />
        ) : (
          <div className="avatar-initials">{profile.fullName?.charAt(0) ?? '?'}</div>
        )}
      </div>
      <h2 className="profile-name">{profile.fullName ?? '-'}</h2>
      <span className="role-badge">{profile.role}</span>
      {children}
    </div>
  );
}

function AccountDetailsCard({ profile }: { profile: ProfileData }) {
  return (
    <div className="profile-card">
      <h3 className="profile-detail">
        <Users size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
        Account Details
      </h3>
      <div className="detail-row">
        <label>Username</label>
        <div className="detail-value">{profile.fullName ?? '-'}</div>
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
