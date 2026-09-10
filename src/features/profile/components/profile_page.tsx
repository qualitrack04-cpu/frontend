import { Link } from 'react-router-dom';
import { useProfileKpi } from '../hooks/useProfileKpi';

const dummyUserInfo = {
  name: 'SAKY Auditor',
  role: 'Quality Auditor',
  photoUrl: '',
  username: 'saky_po_sm',
  email: 'sakyyyyyyy@company.com',
  detailRole: 'Senior Quality Auditor',
};

export default function ProfilePage() {
  const { data: kpi, loading, error } = useProfileKpi();
  const userInfo = dummyUserInfo;

  if (loading) {
    return <div className="page-container">Loading...</div>;
  }

  if (error) {
    return <div className="page-container error-text">{error}</div>;
  }

  if (!kpi) {
    return null;
  }

  return (
    <div className="page-container">
      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-avatar">
            {userInfo.photoUrl ? (
              <img src={userInfo.photoUrl} alt={userInfo.name} />
            ) : (
              <div className="avatar-placeholder">{userInfo.name.charAt(0)}</div>
            )}
          </div>
          <h2>{userInfo.name}</h2>
          <span className="role-badge">{userInfo.role}</span>
        </div>

        <div className="profile-card center">
          <p className="card-label">QUALITY SCORE</p>
          <div className="score-circle">{kpi.qualityScore}%</div>
          <span className="score-tag">{kpi.qualityLabel}</span>
        </div>

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

      <div className="profile-card">
        <h3>Account Details</h3>
        <div className="detail-row">
          <label>Username</label>
          <div className="detail-value">{userInfo.username}</div>
        </div>
        <div className="detail-row">
          <label>Email</label>
          <div className="detail-value">{userInfo.email}</div>
        </div>
        <div className="detail-row">
          <label>Role</label>
          <div className="detail-value">{userInfo.detailRole}</div>
        </div>
        <Link to="/profile/edit" className="btn-edit-profile">Edit Profile</Link>
      </div>
    </div>
  );
}