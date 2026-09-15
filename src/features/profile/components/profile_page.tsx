import { Link } from 'react-router-dom';
import { useProfileKpi } from '../hooks/useProfileKpi';
import { useProfile } from '../hooks/use_profile';

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
        </div>

        {/* Quality Score */}
        <div className="profile-card center">
          <p className="card-label">QUALITY SCORE</p>
          <div className="score-circle">{kpi.qualityScore}%</div>
          <span className="score-tag">{kpi.qualityLabel}</span>
        </div>

        {/* Success Rate */}
        <div className="profile-card dark">
          <p className="card-label">SUCCESS RATE</p>
          <p className="stat-big-number">
            {kpi.successRate}% <small>({kpi.successCount})</small>
          </p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${kpi.successRate}%` }} />
          </div>
          <p className="target-text">Target: {kpi.target}%</p>
        </div>

        {/* On Time / Overdue */}
        <div className="profile-stats">
          <div className="stat-box">
            <p className="stat-number">{kpi.onTime}</p>
            <p>ON TIME</p>
          </div>
          <div className="stat-box">
            <p className="stat-number">{kpi.overdue}</p>
            <p>OVERDUE</p>
          </div>
        </div>
      </div>

      {/* Account Details */}
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
        <Link to="/profile/edit" className="btn-edit-profile">Edit Profile</Link>
      </div>
    </div>
  );
}