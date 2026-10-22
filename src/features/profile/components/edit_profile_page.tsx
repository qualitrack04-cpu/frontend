import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Lock, AlertCircle } from 'lucide-react';
import { useProfile } from '../hooks/use_profile';
import { useEditProfile } from '../hooks/use_edit_profile';
import { fileUrl } from '../../../shared/utils/file_url';
import { MascotAvatar } from './profile_page';

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
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setEmail(profile.email);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setLocalError('Nama tidak boleh kosong');
      return;
    }
    if (fullName.trim().length > 60) {
      setLocalError('Nama maksimal 60 karakter');
      return;
    }
    if (!email.trim()) {
      setLocalError('Email tidak boleh kosong');
      return;
    }

    setLocalError(null);
    try {
      await saveProfile(fullName.trim(), email.trim(), '');
      localStorage.setItem('fullName', fullName.trim());
      await refetch();
      navigate('/profile');
    } catch {
      // Error handled by useEditProfile
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await savePhoto(file);
      await refetch();
    } catch {
      // Error handled by useEditProfile
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await deletePhoto();
      await refetch();
    } catch {
      // Error handled by useEditProfile
    }
  };

  const displayError = localError || saveError || photoError;

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
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 p-8 flex flex-col items-center justify-center text-center">
          {/* Avatar with Camera Icon Overlay */}
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
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Change Photo Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={photoSaving}
            className="px-6 py-2 rounded-lg border border-[#2563EB] text-[#2563EB] bg-white hover:bg-blue-50 font-medium text-[13.5px] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {photoSaving ? 'Uploading...' : 'Change Photo'}
          </button>

          {/* Remove Photo Text Button */}
          <button
            type="button"
            onClick={handleRemovePhoto}
            disabled={photoSaving || !profile.profilePhotoUrl}
            className="mt-3 text-[13px] font-semibold text-[#DC2626] hover:text-red-700 bg-transparent border-none cursor-pointer p-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Remove Photo
          </button>
        </div>

        {/* Right Card: Account Information Form */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 p-8">
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

          <form onSubmit={handleSave}>
            <div className="space-y-5">
              {/* NAME Field */}
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

              {/* EMAIL Field (Editable) */}
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

              {/* ROLE Field (Read-only) */}
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

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-[13.5px] transition-colors bg-white cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-[13.5px] transition-colors shadow-sm border-none cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}