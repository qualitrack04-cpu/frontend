import { useState, useEffect } from 'react';
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
    deletePhoto,
    saving,
    error: saveError,
    photoSaving,
    photoError,
  } = useEditProfile();

  const [fullName, setFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRemovePhotoConfirm, setShowRemovePhotoConfirm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (profile) setFullName(profile.fullName);
  }, [profile]);

  if (profileLoading || !profile) {
    return <div className="max-w-full m-0 text-left">Loading...</div>;
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
      setShowConfirmModal(false);
    }
  };

  const handleSavePhoto = async (file: File | null) => {
    setShowPhotoModal(false);
    if (!file) return;
    try {
      await savePhoto(file);
      await refetch();
    } catch {
      // error sudah ditangani di dalam hook (photoError)
    }
  };

  const handleConfirmRemovePhoto = async () => {
    setShowRemovePhotoConfirm(false);
    try {
      await deletePhoto();
      await refetch();
    } catch {
      // photoError akan muncul di kartu avatar
    }
  };

  return (
    <div className="max-w-full m-0 text-left">
      <button className="back-btn" onClick={() => navigate('/profile')}>← Back</button>
      <h1 className="text-[3rem] font-bold text-[#0f2c52] m-0 mb-[8px] tracking-[-0.5px] leading-[1.25]">Edit Profile</h1>
      <p className="text-slate-500 mt-[-6px] mb-[24px] text-[13px]">Manage your personal information and security preferences.</p>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-[24px] items-start">
        {/* ---- Kartu Avatar (kiri) ---- */}
        <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[24px] text-center flex flex-col items-center">
          <button className="relative w-[110px] h-[110px] rounded-full border-[3px] border-[#f1f5f9] p-0 cursor-pointer overflow-hidden mb-[16px] group" onClick={() => setShowPhotoModal(true)} disabled={photoSaving}>
            {profile.profilePhotoUrl ? (
              <img src={fileUrl(profile.profilePhotoUrl)} alt={profile.fullName} className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-70" />
            ) : (
              <div className="w-full h-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center font-bold text-[40px] transition-opacity duration-200 group-hover:opacity-70">{fullName?.charAt(0)?.toUpperCase() ?? '?'}</div>
            )}
            <span className="absolute inset-0 bg-[rgba(15,44,82,0.6)] text-white flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"><Pencil size={24} /></span>
          </button>
          <h3 className="text-[20px] font-bold text-[#0f2c52] m-0 mb-[8px] leading-[1.3]">{fullName}</h3>
          <span className="inline-block px-[10px] py-[4px] rounded-[6px] text-[11px] font-bold tracking-[0.5px] uppercase bg-[#0f2c52] text-white mb-[24px]">{profile.role.toUpperCase()}</span>

          <button
            className="w-full bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] py-[10px] rounded-[8px] text-[14px] font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#fee2e2] disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setShowRemovePhotoConfirm(true)}
            disabled={photoSaving}
          >
            Remove Photo
          </button>

          {photoError && <p className="text-[#dc2626] bg-[#fef2f2] p-[10px_14px] border border-[#fecaca] rounded-[8px] text-[13.5px] mt-[16px] w-full box-border">{photoError}</p>}
        </div>

        {/* ---- Form (kanan) ---- */}
        <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[24px]">
          <h3 className="text-[14px] font-bold text-[#0f2c52] uppercase tracking-[0.5px] m-0 mb-[16px]">Personal Information</h3>
          <hr className="border-t border-[#e2e8f0] m-0 mb-[24px]" />

          <div className="flex flex-col md:flex-row gap-[16px] mb-[20px]">
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-[#1e293b] mb-[6px]">Full Name</label>
              <input className="w-full bg-[#eef1fb] border border-[#d6dcf5] rounded-[10px] p-[14px_16px] text-[15px] text-[#1f2937] box-border outline-none transition-all duration-150 placeholder:text-[#94a3b8] focus:border-[#94a3f0] focus:ring-[3px] focus:ring-[#94a3f040]" type="text" value={fullName} maxLength={100} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-[#1e293b] mb-[6px]">Email Address</label>
              <input className="w-full bg-[#eef1fb] border border-[#d6dcf5] rounded-[10px] p-[14px_16px] text-[15px] text-[#1f2937] box-border outline-none transition-all duration-150 disabled:bg-[#f1f5f9] disabled:text-[#94a3b8] disabled:cursor-not-allowed" type="email" value={profile.email} disabled readOnly />
            </div>
          </div>

          <h3 className="text-[14px] font-bold text-[#0f2c52] uppercase tracking-[0.5px] m-0 mb-[16px] mt-[32px]">Security</h3>
          <hr className="border-t border-[#e2e8f0] m-0 mb-[24px]" />

          <div className="flex flex-col md:flex-row gap-[16px] mb-[20px]">
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-[#1e293b] mb-[6px]">New Password</label>
              <div className="relative flex items-center">
                <KeyRound size={16} className="absolute left-[14px] text-[#64748b] pointer-events-none" />
                <input
                  className="w-full bg-[#eef1fb] border border-[#d6dcf5] rounded-[10px] p-[14px_16px] pl-[40px] text-[15px] text-[#1f2937] box-border outline-none transition-all duration-150 placeholder:text-[#94a3b8] focus:border-[#94a3f0] focus:ring-[3px] focus:ring-[#94a3f040]"
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-[#1e293b] mb-[6px]">Confirm New Password</label>
              <div className="relative flex items-center">
                <KeyRound size={16} className="absolute left-[14px] text-[#64748b] pointer-events-none" />
                <input
                  className="w-full bg-[#eef1fb] border border-[#d6dcf5] rounded-[10px] p-[14px_16px] pl-[40px] text-[15px] text-[#1f2937] box-border outline-none transition-all duration-150 placeholder:text-[#94a3b8] focus:border-[#94a3f0] focus:ring-[3px] focus:ring-[#94a3f040]"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {(localError || saveError) && <p className="text-[#dc2626] bg-[#fef2f2] p-[10px_14px] border border-[#fecaca] rounded-[8px] text-[13.5px] mt-[16px] w-full box-border">{localError || saveError}</p>}

          <div className="flex items-center justify-end gap-[12px] mt-[32px] pt-[20px] border-t border-[#e2e8f0]">
            <button className="bg-[#f1f5f9] text-[#475569] border-none px-[24px] py-[12px] rounded-[8px] text-[14.5px] font-semibold cursor-pointer transition-colors hover:bg-[#e2e8f0]" onClick={() => navigate('/profile')}>Cancel</button>
            <button className="bg-[#0f5132] text-white border-none px-[24px] py-[12px] rounded-[8px] text-[14.5px] font-semibold cursor-pointer transition-colors hover:bg-[#0c4128] shadow-[0_2px_6px_rgba(15,81,50,0.25)] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-[8px]" onClick={handleSaveClick} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {showPhotoModal && (
        <ChangePhotoModal
          currentName={fullName}
          currentRole={profile.role}
          currentPhotoUrl={profile.profilePhotoUrl}
          onClose={() => setShowPhotoModal(false)}
          onSave={handleSavePhoto}
        />
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-[1000] backdrop-blur-[2px]">
          <div className="bg-white p-[30px] rounded-[12px] max-w-[400px] text-center shadow-[0_10px_25px_rgba(0,0,0,0.15)] animate-[slideUp_0.3s_ease]">
            <p className="mb-[20px] text-[15px] text-[#475569] leading-[1.5]">Are you sure you want to save the changes to your profile? This action will update your account information.</p>
            <button className="bg-[#0f2c52] text-white border-none p-[12px_24px] rounded-[8px] font-semibold cursor-pointer w-full mb-[12px] transition-colors hover:bg-[#0c2444] disabled:opacity-50" onClick={handleConfirmSave} disabled={saving}>
              {saving ? 'Saving...' : '✎ Save'}
            </button>
            <button className="bg-transparent border-none text-[#64748b] font-semibold cursor-pointer hover:text-[#334155] transition-colors" onClick={() => setShowConfirmModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showRemovePhotoConfirm && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-[1000] backdrop-blur-[2px]">
          <div className="bg-white p-[30px] rounded-[12px] max-w-[400px] text-center shadow-[0_10px_25px_rgba(0,0,0,0.15)] animate-[slideUp_0.3s_ease]">
            <p className="font-bold text-[#0f2c52] mb-[6px]">Remove Profile Photo</p>
            <p className="text-[#64748b] text-[14px] mb-[20px]">Are You Sure to remove photo?</p>
            <button
              className="bg-[#dc2626] text-white border-none p-[12px_24px] rounded-[8px] font-semibold cursor-pointer w-full mb-[12px] transition-colors hover:bg-[#b91c1c] disabled:opacity-50"
              onClick={handleConfirmRemovePhoto}
              disabled={photoSaving}
            >
              {photoSaving ? 'Removing...' : 'Remove'}
            </button>
            <button className="bg-transparent border-none text-[#64748b] font-semibold cursor-pointer hover:text-[#334155] transition-colors" onClick={() => setShowRemovePhotoConfirm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}