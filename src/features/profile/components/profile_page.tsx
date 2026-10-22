import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Lock, Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { useProfile } from '../hooks/use_profile';
import { fileUrl } from '../../../shared/utils/file_url';
import { uploadProfilePhoto } from '../../auth/api/auth_api';
import ChangePasswordModal from './change_password_modal';

export function MascotAvatar({ className = 'w-28 h-28' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="46" fill="#789CBF" />
      <ellipse cx="50" cy="62" rx="34" ry="28" fill="#FFFFFF" />
      <circle cx="40" cy="50" r="4.5" fill="#0F172A" />
      <circle cx="60" cy="50" r="4.5" fill="#0F172A" />
      <circle cx="41.5" cy="48.5" r="1.5" fill="#FFFFFF" />
      <circle cx="61.5" cy="48.5" r="1.5" fill="#FFFFFF" />
      <polygon points="50,55 45,61 55,61" fill="#F59E0B" />
      <ellipse cx="34" cy="57" rx="3.5" ry="2" fill="#FDBA74" opacity="0.6" />
      <ellipse cx="66" cy="57" rx="3.5" ry="2" fill="#FDBA74" opacity="0.6" />
    </svg>
  );
}

export default function ProfilePage() {
  const { profile, loading, error, refetch } = useProfile();
  const navigate = useNavigate();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Photo upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    setPhotoError(null);
    setImgError(false);

    try {
      await uploadProfilePhoto(file);
      await refetch();
    } catch (err: any) {
      setPhotoError(err.response?.data?.message || 'Gagal mengunggah foto profil.');
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-full m-0 text-left py-12 text-slate-400 text-sm">
        Loading profile...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-full m-0 text-left py-8 text-red-600 text-sm">
        {error || 'Gagal memuat profil'}
      </div>
    );
  }

  const nameLength = profile.fullName ? profile.fullName.trim().length : 0;
  const nameSizeClass =
    nameLength > 30
      ? 'text-[15px] leading-snug'
      : nameLength > 20
      ? 'text-[18px] leading-snug'
      : 'text-[22px] leading-tight';

  return (
    <div className="max-w-full m-0 text-left">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#0F294A] tracking-tight m-0 mb-1.5">
            Profile
          </h1>
          <p className="text-slate-500 text-[14px] m-0">
            View and manage your personal profile and account settings.
          </p>
        </div>

        <Link
          to="/profile/edit"
          className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-[14px] transition-all shadow-sm active:scale-[0.98] cursor-pointer no-underline border-none self-start sm:self-auto shrink-0"
        >
          <Pencil size={15} strokeWidth={2.2} />
          <span>Edit Profile</span>
        </Link>
      </div>

      {/* Profile Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Left Card: Profile Avatar & Identity */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 p-8 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <div className="w-36 h-36 rounded-full bg-[#E2EDF8] flex items-center justify-center overflow-hidden shadow-xs">
              {profile.profilePhotoUrl && !imgError ? (
                <img
                  src={fileUrl(profile.profilePhotoUrl)}
                  alt={profile.fullName}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <MascotAvatar className="w-28 h-28" />
              )}
            </div>

            {/* Quick Camera Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoUploading}
              title="Change Profile Photo"
              className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer transition-colors disabled:opacity-50"
            >
              {photoUploading ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <Camera size={16} strokeWidth={2.2} />
              )}
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/jpg"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {photoError && (
            <div className="mb-3 text-[12px] text-red-600 bg-red-50 py-1 px-2.5 rounded-lg border border-red-100">
              {photoError}
            </div>
          )}

          <h2 className={`${nameSizeClass} font-bold text-[#0F294A] m-0 mb-2 max-w-full break-words [overflow-wrap:anywhere] [word-break:break-word]`}>
            {profile.fullName}
          </h2>

          <span className="inline-block bg-[#E0F7FE] text-[#0284C7] font-semibold text-[13px] px-5 py-1 rounded-lg">
            {profile.role}
          </span>
        </div>

        {/* Right Column: Account Information & Password */}
        <div className="space-y-6">
          {/* Account Information Card */}
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 p-8">
            <h3 className="text-[18px] font-bold text-[#0F294A] m-0 mb-1">
              Account Information
            </h3>
            <p className="text-slate-400 text-[13.5px] m-0 mb-6 font-normal">
              Your personal details as shown in the QualiTrack system.
            </p>

            <div className="space-y-5">
              {/* NAME */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  NAME
                </label>
                <div className="w-full bg-[#F8FAFC] border border-slate-100 rounded-lg px-4 py-3 text-[14px] text-slate-800 font-medium break-words [overflow-wrap:anywhere] [word-break:break-word]">
                  {profile.fullName}
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  EMAIL
                </label>
                <div className="w-full bg-[#F8FAFC] border border-slate-100 rounded-lg px-4 py-3 text-[14px] text-slate-700 font-normal break-words [overflow-wrap:anywhere] [word-break:break-word]">
                  {profile.email}
                </div>
              </div>

              {/* ROLE */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  ROLE
                </label>
                <div className="w-full bg-[#F8FAFC] border border-slate-100 rounded-lg px-4 py-2.5 flex items-center">
                  <span className="inline-block bg-[#E0F7FE] text-[#0284C7] font-semibold text-[12.5px] px-3 py-1 rounded-md">
                    {profile.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Password Card */}
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 p-6">
            <div className="flex items-start gap-3.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                <Lock size={18} strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="text-[16px] font-bold text-[#0F294A] m-0 mb-0.5">
                  Password
                </h4>
                <p className="text-[13px] text-slate-400 m-0 leading-relaxed font-normal">
                  Set a 4-digit PIN to secure your account.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsChangePasswordOpen(true)}
              className="px-5 py-2.5 rounded-lg border border-[#2563EB] text-[#2563EB] bg-white hover:bg-blue-50 font-medium text-[13.5px] transition-colors cursor-pointer"
            >
              Change Password / PIN
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        email={profile.email}
      />
    </div>
  );
}
