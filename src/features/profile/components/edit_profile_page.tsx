import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Pencil } from 'lucide-react';
import ChangePhotoModal from './change_photo_modal';
import { useProfile } from '../hooks/use_profile';
import { useEditProfile } from '../hooks/use_edit_profile';
import { fileUrl } from '../../../shared/utils/file_url';

export default function EditProfilePage() {
  const { profile, loading: profileLoading, refetch } = useProfile();
  const {
    saveProfile,
    savePhoto,
    saving,
    error: saveError,
    photoSaving,
    photoError,
  } = useEditProfile();

  const [fullName, setFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const navigate = useNavigate();

  // Set nilai awal fullName begitu data profile selesai dimuat
  useEffect(() => {
    if (profile) setFullName(profile.fullName);
  }, [profile]);

  if (profileLoading || !profile) {
    return <div className="page-container">Loading...</div>;
  }

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (newPassword && newPassword !== confirmPassword) {
      setLocalError('Password baru dan konfirmasi tidak sama.');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    try {
      await saveProfile(fullName, newPassword);
      localStorage.setItem('fullName', fullName);
      setShowConfirmModal(false);
      navigate('/profile');
    } catch {
      // error sudah ditangani di dalam hook (state saveError)
      setShowConfirmModal(false);
    }
  };

  const handleSavePhoto = async (file: File | null) => {
    setShowPhotoModal(false);
    if (!file) return;
    try {
      await savePhoto(file);
      await refetch(); // ambil ulang data profile supaya foto baru langsung tampil
    } catch {
      // error sudah ditangani di dalam hook (photoError) dan ditampilkan di kartu avatar
    }
  };

  return (
    <div className="page-container">
      <button className="back-btn" onClick={() => navigate('/profile')}>← Back</button>
      <h1>Edit Profile</h1>
      <p className="page-subtitle">Manage your personal information and security preferences.</p>

      <div className="edit-profile-grid">
        {/* ---- Kartu Avatar (kiri) ---- */}
        <div className="profile-card center">
          <button className="avatar-edit-btn" onClick={() => setShowPhotoModal(true)} disabled={photoSaving}>
            {profile.profilePhotoUrl ? (
              <img src={fileUrl(profile.profilePhotoUrl)} alt={profile.fullName} className="avatar-placeholder large" />
            ) : (
              <div className="avatar-placeholder large">{fullName.charAt(0).toUpperCase()}</div>
            )}
            <span className="edit-icon"><Pencil size={12} /></span>
          </button>
          <h3 className="profile-name">{fullName}</h3>
          <span className="role-badge">{profile.role}</span>
          <p className="text-muted" style={{ marginTop: 8, fontSize: 13 }}>
            Klik foto untuk mengganti
          </p>

          {photoError && <p className="error-text">{photoError}</p>}
        </div>

        {/* ---- Form (kanan) ---- */}
        <div className="profile-card">
          <h3 className="form-section-title">Personal Information</h3>
          <hr className="form-section-divider" />

          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={profile.email} disabled readOnly />
              {/* Email tidak diubah di sini — sudah ada alur ganti email terpisah dengan OTP */}
            </div>
          </div>

          <h3 className="form-section-title">Security</h3>
          <hr className="form-section-divider" />

          <div className="form-row">
            <div className="form-group">
              <label>New Password</label>
              <div className="input-with-icon">
                <KeyRound size={16} className="input-icon-left" />
                <input
                  type="password"
                  placeholder="New password (kosongkan jika tidak diganti)"
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

          {(localError || saveError) && <p className="error-text">{localError || saveError}</p>}

          <div className="form-actions">
            <button className="btn-secondary" onClick={() => navigate('/profile')}>Cancel</button>
            <button className="btn-primary" onClick={handleSaveClick} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {showPhotoModal && (
        <ChangePhotoModal
          currentName={fullName}
          currentRole={profile.role}
          onClose={() => setShowPhotoModal(false)}
          onSave={handleSavePhoto}
        />
      )}

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Are you sure you want to save the changes to your profile? This action will update your account information.</p>
            <button className="btn-confirm-save" onClick={handleConfirmSave} disabled={saving}>
              {saving ? 'Saving...' : '✎ Save'}
            </button>
            <button className="btn-cancel-text" onClick={() => setShowConfirmModal(false)}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}