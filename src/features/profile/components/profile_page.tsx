import { Link } from 'react-router-dom';
import { useProfileKpi } from '../hooks/useProfileKpi';
import { useProfile } from '../hooks/use_profile';
import RecentActivity from './recent_activity';

export default function ProfilePage() {
  const { data: kpi, loading: kpiLoading, error: kpiError } = useProfileKpi();
  const { profile, loading: profileLoading, error: profileError } = useProfile();

  if (kpiLoading || profileLoading) {
    return <div className="page-container">Loading...</div>;
  }

  if (kpiError || profileError) {
    return <div className="page-container error-text">{kpiError || profileError}</div>;
  }

  if (!kpi || !profile) {
    return null;
  }

  const closeRate =
    kpi.totalCapaAssigned > 0
      ? Math.round((kpi.totalCapaClosed / kpi.totalCapaAssigned) * 100)
      : 0;
  const onTimePct = Math.round(kpi.onTimeCompletionRate * 1000) / 10;
  const lateClosed = Math.max(kpi.totalCapaClosed - kpi.totalCapaClosedOnTime, 0);
  const closeLabel =
    closeRate >= 90 ? 'Excellent' : closeRate >= 75 ? 'Good' : 'Needs Attention';

    return (
    <div className="page-container">
      <div className="profile-grid">
        {/* Kolom kiri: foto + info dasar */}
        <div className="profile-card">
          <div className="profile-avatar">
            {profile.profilePhotoUrl ? (
              <img src={profile.profilePhotoUrl} alt={profile.fullName} />
            ) : (
              <div className="avatar-placeholder">{profile.fullName.charAt(0)}</div>
            )}
          </div>
          <h2>{profile.fullName}</h2>
          <span className="role-badge">{profile.role}</span>

          <div className="profile-quickstats">
            <div>
              <strong>{kpi.totalFindingsReported}</strong>
              <span>Findings</span>
            </div>
            <div>
              <strong>{kpi.totalCapaAssigned}</strong>
              <span>CAPA</span>
            </div>
          </div>
        </div>

        {/* CAPA Close Rate */}
        <div className="profile-card center">
          <p className="card-label">CAPA CLOSE RATE</p>
          <div className="score-circle">{closeRate}%</div>
          <span className="score-tag">{closeLabel}</span>
        </div>

        {/* On-Time Rate */}
        <div className="profile-card dark">
          <p className="card-label">ON-TIME RATE</p>
          <p className="stat-big-number">
            {onTimePct}%{' '}
            <small>
              ({kpi.totalCapaClosedOnTime}/{kpi.totalCapaClosed})
            </small>
          </p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${onTimePct}%` }} />
          </div>
          <p className="target-text">Target: 85%</p>
        </div>

        {/* In Progress / Terlambat */}
        <div className="profile-stats">
          <div className="stat-box">
            <p className="stat-number">{kpi.totalCapaOpenInProgress}</p>
            <p>IN PROGRESS</p>
          </div>
          <div className="stat-box">
            <p className="stat-number stat-danger">{lateClosed}</p>
            <p>TERLAMBAT</p>
          </div>
        </div>
      </div>

      {/* Baris bawah: Account Details + Recent Activity */}
      <div className="profile-bottom-grid">
        <div className="profile-card">
          <h3>Account Details</h3>
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

        <RecentActivity />
      </div>
    </div>
  );
}