import { Link } from 'react-router-dom';

// Data dummy — nanti diganti dari API
const dummyProfile = {
  name: 'SAKY Auditor',
  role: 'Quality Auditor',
  photoUrl: '',
  qualityScore: 92,
  qualityLabel: 'Excellent',
  successRate: 90,
  successCount: '18/20',
  target: 85,
  onTime: 17,
  overdue: 1,
  username: 'saky_po_sm',
  email: 'sakyyyyyyy@company.com',
  detailRole: 'Senior Quality Auditor',
};

export default function ProfilePage() {
  const profile = dummyProfile;

  return (
    <div className="page-container">
      <div className="profile-grid">
        {/* Kolom kiri: foto + info dasar */}
        <div className="profile-card">
          <div className="profile-avatar">
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt={profile.name} />
            ) : (
              <div className="avatar-placeholder">{profile.name.charAt(0)}</div>
            )}
          </div>
          <h2>{profile.name}</h2>
          <span className="role-badge">{profile.role}</span>
        </div>

        {/* Quality Score */}
        <div className="profile-card center">
          <p className="card-label">QUALITY SCORE</p>
          <div className="score-circle">{profile.qualityScore}%</div>
          <span className="score-tag">{profile.qualityLabel}</span>
        </div>

        {/* Success Rate */}
        <div className="profile-card dark">
          <p className="card-label">SUCCESS RATE</p>
          {/* DULU: <h1>{...}</h1> — memicu style h1 global (56px), bikin kartu ini
              jauh lebih tinggi dari kartu sebelahnya dan grid jadi tidak rata.
              Sekarang pakai class khusus yang ukurannya wajar untuk sebuah stat card. */}
          <p className="stat-big-number">
            {profile.successRate}% <small>({profile.successCount})</small>
          </p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${profile.successRate}%` }} />
          </div>
          <p className="target-text">Target: {profile.target}%</p>
        </div>

        {/* On Time / Overdue */}
        <div className="profile-stats">
          <div className="stat-box">
            <p className="stat-number">{profile.onTime}</p>
            <p>ON TIME</p>
          </div>
          <div className="stat-box">
            <p className="stat-number">{profile.overdue}</p>
            <p>OVERDUE</p>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="profile-card">
        <h3>Account Details</h3>
        <div className="detail-row">
          <label>Username</label>
          <div className="detail-value">{profile.username}</div>
        </div>
        <div className="detail-row">
          <label>Email</label>
          <div className="detail-value">{profile.email}</div>
        </div>
        <div className="detail-row">
          <label>Role</label>
          <div className="detail-value">{profile.detailRole}</div>
        </div>
        <Link to="/profile/edit" className="btn-edit-profile">Edit Profile</Link>
      </div>
    </div>
  );
}