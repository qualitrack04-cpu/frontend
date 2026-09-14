import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, KeyRound, Eye, EyeOff, Pencil } from 'lucide-react';
import ChangePhotoModal from './change_photo_modal';

export default function EditProfilePage() {
  const [username, setUsername] = useState('SakyBauBau');
  const [email, setEmail] = useState('SakyBauBau@qualitrack.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const navigate = useNavigate();

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword && newPassword !== confirmPassword) {
      setError('Password baru dan konfirmasi tidak sama.');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    console.log('Menyimpan perubahan profile:', { username, email, newPassword });
    setShowConfirmModal(false);
    navigate('/profile');
  };

  const handleSavePhoto = (file: File | null) => {
    console.log('Foto baru dipilih:', file);
    setShowPhotoModal(false);
  };

  return (
    <div className="page-container">
      <button className="back-btn" onClick={() => navigate('/profile')}>← Back</button>
      <h1>Edit Profile</h1>
      <p className="page-subtitle">Manage your personal information and security preferences.</p>

      <div className="edit-profile-grid">
        {/* ---- Kartu Avatar (kiri) ---- */}
        <div className="profile-card center">
          <button className="avatar-edit-btn" onClick={() => setShowPhotoModal(true)}>
            <div className="avatar-placeholder large">{username.charAt(0).toUpperCase()}</div>
            <span className="edit-icon"><Pencil size={12} /></span>
          </button>
          <h3 className="profile-name">{username}</h3>
          <span className="role-badge">QUALITY AUDITOR</span>
          <button className="link-danger">Remove Photo</button>
        </div>

        {/* ---- Form (kanan) ---- */}
        <div className="profile-card">
          <h3 className="form-section-title">Personal Information</h3>
          <hr className="form-section-divider" />

          <div className="form-row">
            <div className="form-group">
              <label>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <h3 className="form-section-title">Security</h3>
          <hr className="form-section-divider" />

          <div className="form-group">
            <label>Current Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon-left" />
              <input
                type={showCurrentPw ? 'text' : 'password'}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowCurrentPw((v) => !v)}
                aria-label={showCurrentPw ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>New Password</label>
              <div className="input-with-icon">
                <KeyRound size={16} className="input-icon-left" />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-with-icon">
                <KeyRound size={16} className="input-icon-left" />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="form-actions">
            <button className="btn-secondary" onClick={() => navigate('/profile')}>Cancel</button>
            <button className="btn-primary" onClick={handleSaveClick}>Save Changes</button>
          </div>
        </div>
      </div>

      {showPhotoModal && (
        <ChangePhotoModal
          currentName={username}
          currentRole="Quality Auditor"
          onClose={() => setShowPhotoModal(false)}
          onSave={handleSavePhoto}
        />
      )}

      {/* Modal konfirmasi simpan */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Are you sure you want to save the changes to your profile? This action will update your account information.</p>
            <button className="btn-confirm-save" onClick={handleConfirmSave}>✎ Save</button>
            <button className="btn-cancel-text" onClick={() => setShowConfirmModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}