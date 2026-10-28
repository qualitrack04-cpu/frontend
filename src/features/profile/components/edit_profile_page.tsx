import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Lock, KeyRound, Pencil, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useProfile } from '../hooks/use_profile';
import { useEditProfile } from '../hooks/use_edit_profile';
import { fileUrl } from '../../../shared/utils/file_url';
import { getCurrentRole, ROLES } from '../../../shared/utils/role';
import { MascotAvatar } from './profile_page';
import ChangePhotoModal from './change_photo_modal';

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

  const currentRole = getCurrentRole();
  const isAdmin = currentRole === ROLES.Admin;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Modals state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
  const [showRemovePhotoConfirm, setShowRemovePhotoConfirm] = useState(false);

  const [localError, setLocalError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setEmail(profile.email || '');
      setImgError(false);
    }
  }, [profile]);

  if (profileLoading || !profile) {
    return (
      <div className="max-w-full m-0 text-left py-12 text-slate-400 text-sm">
        Loading profile...
      </div>
    );
  }

  // Handle Photo Changes
  const handleSavePhoto = async (file: File | null) => {
    setShowPhotoModal(false);
    if (!file) return;
    try {
      await savePhoto(file);
      await refetch();
    } catch {
      // Handled in useEditProfile
    }
  };

  const handleConfirmRemovePhoto = async () => {
    setShowRemovePhotoConfirm(false);
    try {
      await deletePhoto();
      await refetch();
    } catch {
      // Handled in useEditProfile
    }
  };

  // Submit Handler -> Opens Confirm Modal
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!fullName.trim()) {
      setLocalError('Name cannot be empty');
      return;
    }

    if (fullName.trim().length > 60) {
      setLocalError('Name cannot exceed 60 characters');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setLocalError('New password and confirmation password do not match');
      return;
    }

    setShowSaveConfirmModal(true);
  };

  // Confirm Save Changes
  const handleConfirmSave = async () => {
    try {
      await saveProfile(fullName.trim(), email.trim(), newPassword || undefined);
      localStorage.setItem('fullName', fullName.trim());
      if (newPassword) {
        localStorage.setItem('user_pin', newPassword);
      }
      setShowSaveConfirmModal(false);
      await refetch();
      navigate('/profile');
    } catch {
      setShowSaveConfirmModal(false);
    }
  };

  const displayError = localError || saveError || photoError;

  // ==========================================
  // 1. ADMIN EDIT PROFILE VIEW
  // ==========================================
  if (isAdmin) {
    return (
      <div className="max-w-full m-0 text-left">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#0F294A] tracking-tight m-0 mb-1.5">
            Edit Profile
          </h1>
          <p className="text-slate-500 text-[14px] m-0">
            Update your profile details and personal account settings.
          </p>
        </div>

        {/* Edit Profile Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
          {/* Left Card: Profile Avatar & Actions */}
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 p-6 sm:p-8 flex flex-col items-center justify-center text-center">
            <div className="relative mb-6">
              <div className="w-36 h-36 rounded-full bg-[#E2EDF8] flex items-center justify-center overflow-hidden shadow-xs">
                {profile.profilePhotoUrl && !imgError ? (
                  <img
                    src={fileUrl(profile.profilePhotoUrl)}
                    alt={fullName}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <MascotAvatar className="w-28 h-28" />
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoSaving}
                title="Change Photo"
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer transition-colors disabled:opacity-50"
              >
                <Camera size={16} strokeWidth={2.2} />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/jpg"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await handleSavePhoto(file);
                }}
                className="hidden"
              />
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoSaving}
              className="px-6 py-2 rounded-lg border border-[#2563EB] text-[#2563EB] bg-white hover:bg-blue-50 font-medium text-[13.5px] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {photoSaving ? 'Uploading...' : 'Change Photo'}
            </button>

            <button
              type="button"
              onClick={() => setShowRemovePhotoConfirm(true)}
              disabled={photoSaving || !profile.profilePhotoUrl}
              className="mt-3 text-[13px] font-semibold text-[#DC2626] hover:text-red-700 bg-transparent border-none cursor-pointer p-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Remove Photo
            </button>
          </div>

          {/* Right Card: Account Information Form */}
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 p-5 sm:p-8">
            <h2 className="text-[18px] font-bold text-[#0F294A] m-0 mb-1">
              Account Information
            </h2>
            <p className="text-slate-400 text-[13.5px] m-0 mb-6 font-normal">
              Your personal details as shown in the QualiTrack system.
            </p>

            {displayError && (
              <div className="mb-5 p-3.5 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                <AlertCircle size={16} className="shrink-0" />
                <span>{displayError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      NAME
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {fullName.length}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={60}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 rounded-lg px-4 py-3 text-[14px] text-slate-800 font-medium outline-none transition-all placeholder-slate-400"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 rounded-lg px-4 py-3 text-[14px] text-slate-800 font-medium outline-none transition-all placeholder-slate-400"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    ROLE
                  </label>
                  <div className="w-full bg-[#F8FAFC] border border-slate-100 rounded-lg px-4 py-2.5 flex items-center justify-between">
                    <span className="inline-block bg-[#E0F7FE] text-[#0284C7] font-semibold text-[12.5px] px-3 py-1 rounded-md">
                      {profile.role}
                    </span>
                    <Lock size={16} className="text-slate-400 shrink-0" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  disabled={saving}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-[13.5px] transition-colors bg-white cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-[13.5px] transition-colors shadow-sm border-none cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Remove Photo Confirm Modal */}
        {showRemovePhotoConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-[360px] p-6 text-center">
              <h3 className="text-[17px] font-bold text-[#0F294A] m-0 mb-2">Remove Photo</h3>
              <p className="text-[13.5px] text-slate-500 m-0 mb-6 font-normal">
                Are you sure you want to remove your profile photo?
              </p>
              <button
                type="button"
                onClick={handleConfirmRemovePhoto}
                disabled={photoSaving}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-[13.5px] transition-colors mb-2.5 border-none cursor-pointer"
              >
                {photoSaving ? 'Removing...' : 'Remove Photo'}
              </button>
              <button
                type="button"
                onClick={() => setShowRemovePhotoConfirm(false)}
                className="w-full py-2 text-slate-500 hover:text-slate-700 font-medium text-[13px] bg-transparent border-none cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 2. NON-ADMIN EDIT PROFILE VIEW (Image 1, 3, 4)
  // ==========================================
  return (
    <div className="max-w-full m-0 text-left">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate('/profile')}
        className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-[13.5px] font-semibold mb-4 bg-transparent border-none cursor-pointer p-0 transition-colors"
      >
        <span>&larr; Back</span>
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] md:text-[32px] font-bold text-[#0F294A] tracking-tight m-0 mb-1.5">
          Edit Profile
        </h1>
        <p className="text-slate-500 text-[14px] m-0">
          Manage your personal information and security preferences.
        </p>
      </div>

      {displayError && (
        <div className="mb-5 p-3.5 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2 border border-red-100 max-w-full">
          <AlertCircle size={16} className="shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      {/* Main Grid: Left Card (Avatar) & Right Card (Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Left Card: Profile Avatar & Details */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 p-8 flex flex-col items-center justify-center text-center w-full max-w-full overflow-hidden">
          {/* Avatar with Pencil Badge */}
          <div className="relative mb-6">
            <button
              type="button"
              onClick={() => setShowPhotoModal(true)}
              className="w-36 h-36 rounded-full overflow-hidden border-2 border-white shadow-xs p-0 bg-[#E2EDF8] flex items-center justify-center cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
              title="Click to change photo"
            >
              {profile.profilePhotoUrl && !imgError ? (
                <img
                  src={fileUrl(profile.profilePhotoUrl)}
                  alt={fullName}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <MascotAvatar className="w-28 h-28" />
              )}
            </button>

            {/* Dark edit pencil badge */}
            <button
              type="button"
              onClick={() => setShowPhotoModal(true)}
              className="w-9 h-9 rounded-full bg-[#0F294A] hover:bg-[#0B1E38] text-white flex items-center justify-center shadow-md absolute bottom-1 right-1 border-2 border-white cursor-pointer transition-colors"
              title="Change photo"
            >
              <Pencil size={15} strokeWidth={2.2} />
            </button>
          </div>

          {/* Name with text wrapping and dynamic size */}
          {(() => {
            const nonAdminNameLen = (fullName || profile.fullName || '').length;
            const nonAdminNameSize =
              nonAdminNameLen > 40
                ? 'text-[14px] leading-snug'
                : nonAdminNameLen > 25
                ? 'text-[16px] leading-snug'
                : 'text-[20px] leading-snug';

            return (
              <h3 className={`${nonAdminNameSize} font-bold text-[#0F294A] m-0 mb-2 leading-snug text-center max-w-full break-words [overflow-wrap:anywhere] [word-break:break-word]`}>
                {fullName || profile.fullName}
              </h3>
            );
          })()}

          <span className="inline-block bg-[#E0F2FE] text-[#0284C7] font-semibold text-[13px] px-5 py-1 rounded-lg mb-6">
            {profile.role}
          </span>

          {/* Remove Photo Link */}
          <button
            type="button"
            onClick={() => setShowRemovePhotoConfirm(true)}
            disabled={photoSaving || !profile.profilePhotoUrl}
            className="text-[13px] font-semibold text-[#DC2626] hover:text-red-700 bg-transparent border-none cursor-pointer p-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:underline"
          >
            Remove Photo
          </button>
        </div>

        {/* Right Card: Personal Information & Security */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleFormSubmit}>
            {/* Section 1: Personal Information */}
            <div className="mb-8">
              <h3 className="text-[17px] font-bold text-[#0F294A] m-0 mb-3">
                Personal Information
              </h3>
              <div className="h-px bg-slate-100 w-full mb-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username with 60 Char Counter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[12.5px] font-medium text-slate-700">
                      Username
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {fullName.length}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={60}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#EEF1FB] border border-[#D6DCF5] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 rounded-xl px-4 py-3 text-[14px] text-slate-800 font-medium outline-none transition-all placeholder-slate-400"
                    placeholder="Username"
                    required
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[12.5px] font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#EEF1FB] border border-[#D6DCF5] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 rounded-xl px-4 py-3 text-[14px] text-slate-800 font-medium outline-none transition-all placeholder-slate-400"
                    placeholder="Email address"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Security */}
            <div className="mb-8">
              <h3 className="text-[17px] font-bold text-[#0F294A] m-0 mb-3">
                Security
              </h3>
              <div className="h-px bg-slate-100 w-full mb-6" />

              {/* Only New Password and Confirm New Password (no digit limit) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* New Password */}
                <div>
                  <label className="block text-[12.5px] font-medium text-slate-700 mb-2">
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400 pointer-events-none flex items-center">
                      <KeyRound size={16} />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="w-full bg-[#EEF1FB] border border-[#D6DCF5] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 rounded-xl pl-11 pr-11 py-3 text-[14px] text-slate-800 font-medium outline-none transition-all placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-0 flex items-center"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-[12.5px] font-medium text-slate-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400 pointer-events-none flex items-center">
                      <KeyRound size={16} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full bg-[#EEF1FB] border border-[#D6DCF5] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 rounded-xl pl-11 pr-11 py-3 text-[14px] text-slate-800 font-medium outline-none transition-all placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-0 flex items-center"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-[13.5px] transition-colors bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#0F5132] hover:bg-[#0C4128] text-white font-medium text-[13.5px] transition-colors shadow-sm border-none cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal 1: Change Photo Modal (Image 3) */}
      {showPhotoModal && (
        <ChangePhotoModal
          currentName={fullName || profile.fullName}
          currentRole={profile.role}
          currentPhotoUrl={profile.profilePhotoUrl}
          onClose={() => setShowPhotoModal(false)}
          onSave={handleSavePhoto}
        />
      )}

      {/* Modal 2: Save Confirmation Modal (Image 4) */}
      {showSaveConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[360px] p-6 text-center animate-[scaleIn_0.15s_ease-out]">
            {/* Top rounded bar handle */}
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4" />

            <p className="text-[13.5px] text-slate-800 leading-relaxed font-semibold mb-6">
              Are you sure you want to save the changes to your profile? This action will update your account information.
            </p>

            {/* Green Save button */}
            <button
              type="button"
              onClick={handleConfirmSave}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-semibold text-[14px] transition-colors shadow-sm flex items-center justify-center gap-2 border-none cursor-pointer mb-2.5 disabled:opacity-50"
            >
              <Pencil size={14} />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>

            {/* Cancel text button */}
            <button
              type="button"
              onClick={() => setShowSaveConfirmModal(false)}
              className="w-full py-2 bg-transparent text-slate-500 hover:text-slate-700 font-medium text-[13.5px] border-none cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modal 3: Remove Photo Confirmation Modal */}
      {showRemovePhotoConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[360px] p-6 text-center animate-[scaleIn_0.15s_ease-out]">
            <h3 className="text-[17px] font-bold text-[#0F294A] m-0 mb-2">Remove Photo</h3>
            <p className="text-[13.5px] text-slate-500 m-0 mb-6 font-normal">
              Are you sure you want to remove your profile photo?
            </p>
            <button
              type="button"
              onClick={handleConfirmRemovePhoto}
              disabled={photoSaving}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-[13.5px] transition-colors mb-2.5 border-none cursor-pointer"
            >
              {photoSaving ? 'Removing...' : 'Remove Photo'}
            </button>
            <button
              type="button"
              onClick={() => setShowRemovePhotoConfirm(false)}
              className="w-full py-2 text-slate-500 hover:text-slate-700 font-medium text-[13px] bg-transparent border-none cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}