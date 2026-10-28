import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Lock, Clock, AlertTriangle, Users } from 'lucide-react';
import { useProfile } from '../hooks/use_profile';
import { useProfileKpi } from '../hooks/useProfileKpi';
import RecentActivity from './recent_activity';
import { fileUrl } from '../../../shared/utils/file_url';
import { getCurrentRole, ROLES } from '../../../shared/utils/role';
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

function QualityGauge({ score }: { score: number }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;

  return (
    <div className="relative w-28 h-28 flex items-center justify-center my-1">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth="9"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="9"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[24px] font-black text-slate-900 leading-none">
          {score}<span className="text-[14px] font-bold text-slate-600">%</span>
        </span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { profile, loading: profileLoading, error: profileError, refetch } = useProfile();
  const currentRole = getCurrentRole();
  const isAdmin = currentRole === ROLES.Admin;

  // Non-Admin KPI Hook
  const { data: kpi, loading: kpiLoading } = useProfileKpi(!isAdmin);

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Image error state
  const [imgError, setImgError] = useState(false);

  if (profileLoading || (!isAdmin && kpiLoading)) {
    return (
      <div className="max-w-full m-0 text-left py-12 text-slate-400 text-sm">
        Loading profile...
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="max-w-full m-0 text-left py-8 text-red-600 text-sm">
        {profileError || 'Failed to load profile'}
      </div>
    );
  }

  // ==========================================
  // 1. ADMIN PROFILE VIEW
  // ==========================================
  if (isAdmin) {
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

            </div>

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
                    Change your password securely via email verification code.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsChangePasswordOpen(true)}
                className="px-5 py-2.5 rounded-lg border border-[#2563EB] text-[#2563EB] bg-white hover:bg-blue-50 font-medium text-[13.5px] transition-colors cursor-pointer"
              >
                Change Password
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

  // ==========================================
  // 2. NON-ADMIN PROFILE DASHBOARD VIEW (Image 2)
  // ==========================================
  const toPct = (rate: number) => {
    if (rate > 1) return Math.round(rate);
    return Math.round(rate * 100);
  };

  const qualityPct = kpi ? toPct(kpi.qualityScore) : 0;
  const successPct = kpi ? toPct(kpi.successRate) : 0;
  const completedCount = kpi ? kpi.totalCompleted : 0;
  const assignedCount = kpi ? kpi.totalAssigned : 0;
  const onTimeCount = kpi ? kpi.totalCompletedOnTime : 0;
  const overdueCount = kpi ? kpi.totalOverdue : 0;
  const totalAudits = kpi ? kpi.totalAssigned : 0;
  const ratingValue = assignedCount > 0 ? (Math.min(qualityPct / 20, 5)).toFixed(1) : '0.0';

  const taskLabel = kpi?.kpiBasis === 'Capa' ? 'CAPA' : 'audits';
  const qualityLabel =
    assignedCount === 0 && completedCount === 0
      ? 'No data available'
      : qualityPct >= 90
      ? 'Excellent'
      : qualityPct >= 75
      ? 'Good'
      : 'Needs Attention';

  const targetDiff = Math.round((successPct - 85) * 10) / 10;
  const diffLabel = targetDiff >= 0 ? `+${targetDiff}%` : `${targetDiff}%`;

  // Format username from email or fullName
  const usernameDisplay = profile.email ? profile.email.split('@')[0] : profile.fullName;

  return (
    <div className="max-w-full m-0 text-left">
      {/* Top 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {/* Card 1: Identity & Quickstats */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col items-center justify-between text-center shadow-xs w-full max-w-full overflow-hidden">
          <div className="flex flex-col items-center w-full">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#E2EDF8] flex items-center justify-center overflow-hidden border-2 border-white shadow-xs mb-3.5 shrink-0">
              {profile.profilePhotoUrl && !imgError ? (
                <img
                  src={fileUrl(profile.profilePhotoUrl)}
                  alt={profile.fullName}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <MascotAvatar className="w-20 h-20 sm:w-24 sm:h-24" />
              )}
            </div>

            {(() => {
              const nameLen = profile.fullName ? profile.fullName.trim().length : 0;
              const sizeClass =
                nameLen > 40
                  ? 'text-[13px] leading-snug'
                  : nameLen > 25
                  ? 'text-[15px] leading-snug'
                  : 'text-[19px] sm:text-[20px] leading-snug';

              return (
                <h2 className={`${sizeClass} font-bold text-[#0F294A] m-0 mb-1 leading-snug text-center max-w-full break-words [overflow-wrap:anywhere] [word-break:break-word]`}>
                  {profile.fullName}
                </h2>
              );
            })()}

            <span className="inline-block bg-[#E0F2FE] text-[#0284C7] font-semibold text-[11.5px] px-3.5 py-1 rounded-full mb-4">
              {profile.role}
            </span>
          </div>

          {/* Quickstats Footer */}
          <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-around">
            <div className="text-center">
              <strong className="block text-[20px] font-bold text-slate-800 leading-tight">
                {totalAudits}
              </strong>
              <span className="text-[12px] text-slate-400 font-medium capitalize">
                {kpi?.kpiBasis === 'Capa' ? 'CAPA' : 'Audits'}
              </span>
            </div>

            <div className="w-px h-8 bg-slate-200" />

            <div className="text-center">
              <strong className="block text-[20px] font-bold text-slate-800 leading-tight">
                {ratingValue}
              </strong>
              <span className="text-[12px] text-slate-400 font-medium">Rating</span>
            </div>
          </div>
        </div>

        {/* Card 2: QUALITY SCORE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col items-center justify-between text-center shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider m-0">
            QUALITY SCORE
          </p>

          <QualityGauge score={qualityPct} />

          <div className="flex flex-col items-center gap-1">
            <span className="inline-block bg-[#FEF3C7] text-[#D97706] font-bold text-[12px] px-4 py-1 rounded-full">
              {qualityLabel}
            </span>
            <p className="text-[11.5px] text-slate-400 m-0 mt-1">
              {kpi ? `${kpi.totalCompletedOnTime}/${kpi.totalCompleted} ${taskLabel} on time` : '17/18 audits on time'}
            </p>
          </div>
        </div>

        {/* Card 3: SUCCESS RATE (Dark Navy) */}
        <div className="bg-[#0B1E38] rounded-2xl p-6 flex flex-col justify-between text-white shadow-xs">
          <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider m-0">
            SUCCESS RATE
          </p>

          <div className="my-2">
            <p className="text-[32px] sm:text-[34px] font-black text-white m-0 leading-none mb-1">
              {successPct}%{' '}
              <span className="text-[14px] text-slate-300 font-normal">
                ({completedCount}/{assignedCount})
              </span>
            </p>

            {/* Progress bar */}
            <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden mt-3 mb-2">
              <div
                className="bg-[#F59E0B] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(successPct, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[12px] text-slate-300 font-medium pt-2 border-t border-white/10">
            <span>Target: 85%</span>
            <span className="text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded text-[11px] font-bold">
              {diffLabel}
            </span>
          </div>
        </div>

        {/* Card 4: ON TIME & OVERDUE (Stacked Boxes) */}
        <div className="flex flex-col gap-4 justify-between">
          {/* Box ON TIME */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-xs flex-1">
            <div>
              <p className="text-[26px] font-black text-[#0F294A] m-0 leading-none mb-1.5">
                {onTimeCount}
              </p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider m-0">
                ON TIME
              </p>
            </div>
            <div className="w-11 h-11 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
              <Clock size={20} strokeWidth={2.4} />
            </div>
          </div>

          {/* Box OVERDUE */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-xs flex-1">
            <div>
              <p className="text-[26px] font-black text-rose-600 m-0 leading-none mb-1.5">
                {overdueCount}
              </p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider m-0">
                OVERDUE
              </p>
            </div>
            <div className="w-11 h-11 rounded-full bg-[#FEE2E2] text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} strokeWidth={2.4} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row Grid: Account Details + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start mt-6">
        {/* Account Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
          <h3 className="flex items-center gap-2.5 text-[16px] font-bold text-[#0F294A] m-0 mb-5">
            <Users size={18} className="text-[#0F294A]" />
            <span>Account Details</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-slate-500 mb-1.5">
                Username
              </label>
              <div className="w-full bg-[#EEF2F6]/70 border border-slate-200/60 rounded-xl px-4 py-3 text-[14px] text-slate-800 font-medium break-words [overflow-wrap:anywhere] [word-break:break-word]">
                {usernameDisplay}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-500 mb-1.5">
                Email
              </label>
              <div className="w-full bg-[#EEF2F6]/70 border border-slate-200/60 rounded-xl px-4 py-3 text-[14px] text-slate-800 font-medium break-words [overflow-wrap:anywhere] [word-break:break-word]">
                {profile.email}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-slate-500 mb-1.5">
                Role
              </label>
              <div className="w-full bg-[#EEF2F6]/70 border border-slate-200/60 rounded-xl px-4 py-3 text-[14px] text-slate-800 font-medium break-words [overflow-wrap:anywhere] [word-break:break-word]">
                {profile.role}
              </div>
            </div>
          </div>

          <Link
            to="/profile/edit"
            className="mt-6 w-full py-2.5 px-4 rounded-xl border border-[#0F294A] text-[#0F294A] hover:bg-slate-50 font-semibold text-[13.5px] transition-colors text-center block no-underline cursor-pointer"
          >
            Edit Profile
          </Link>
        </div>

        {/* Recent Activity Card */}
        <RecentActivity />
      </div>
    </div>
  );
}
