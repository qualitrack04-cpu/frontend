import { Link } from 'react-router-dom';
import { Clock, AlertTriangle, Users } from 'lucide-react';
import { useProfileKpi } from '../hooks/useProfileKpi';
import { useProfile } from '../hooks/use_profile';
import RecentActivity from './recent_activity';
import { fileUrl } from '../../../shared/utils/file_url';
import { hasRole, ROLES } from '../../../shared/utils/role';
import type { ProfileData } from '../../auth/api/auth_api';

export default function ProfilePage() {
  const showKpi = hasRole(ROLES.AuditorInternal);

  const { data: kpi, loading: kpiLoading, error: kpiError } = useProfileKpi(showKpi);
  const { profile, loading: profileLoading, error: profileError } = useProfile();

  if (kpiLoading || profileLoading) {
    return <div className="max-w-full m-0 text-left">Loading...</div>;
  }

  if (kpiError || profileError) {
    return <div className="max-w-full m-0 text-left text-red-600">{kpiError || profileError}</div>;
  }

  if (!profile) {
    return null;
  }

  if (!showKpi || !kpi) {
    return (
      <div className="max-w-full m-0 text-left">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-[24px]">
          <ProfileIdentityCard profile={profile} />
          <AccountDetailsCard profile={profile} />
        </div>
      </div>
    );
  }

  const toPct = (rate: number) => Math.round(rate * 10) / 10;
  const qualityPct = toPct(kpi.qualityScore);
  const successPct = toPct(kpi.successRate * 100);
  const taskLabel = kpi.kpiBasis === 'Capa' ? 'CAPA' : 'audit';
  const qualityLabel =
    kpi.totalCompleted === 0
      ? `Belum ada ${taskLabel}`
      : qualityPct >= 90 ? 'Excellent' : qualityPct >= 75 ? 'Good' : 'Needs Attention';

  const targetDiff = Math.round((successPct - 85) * 10) / 10;
  const diffLabel = targetDiff >= 0 ? `+${targetDiff}%` : `${targetDiff}%`;

  return (
    <div className="max-w-full m-0 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_1.2fr_240px] gap-[20px] mb-[24px]">

        <ProfileIdentityCard profile={profile}>
          <div className="flex gap-[24px] mt-[24px] pt-[20px] border-t border-[#e2e8f0] w-full justify-around">
            <div className="flex flex-col gap-[4px] items-center">
              <strong className="text-[20px] text-[#0f2c52] font-bold leading-none">{kpi.totalAssigned}</strong>
              <span className="text-[12px] text-[#64748b] uppercase tracking-[0.5px] font-semibold">{kpi.kpiBasis === 'Capa' ? 'CAPA' : 'Audits'}</span>
            </div>
            <div className="flex flex-col gap-[4px] items-center">
              <strong className="text-[20px] text-[#0f2c52] font-bold leading-none">{(Math.min(qualityPct / 20, 5)).toFixed(1)}</strong>
              <span className="text-[12px] text-[#64748b] uppercase tracking-[0.5px] font-semibold">Rating</span>
            </div>
          </div>
        </ProfileIdentityCard>

        <div className="bg-white rounded-[12px] p-[24px] border border-[#e2e8f0] flex flex-col items-center text-center justify-center">
          <p className="text-[12px] font-bold text-[#64748b] tracking-[1px] m-0 mb-[16px]">QUALITY SCORE</p>
          <div className="w-[110px] h-[110px] rounded-full bg-[#f0fdf4] border-[4px] border-[#22c55e] flex items-center justify-center text-[32px] font-[800] text-[#166534] mb-[12px] shadow-[0_4px_12px_rgba(34,197,94,0.15)]">{qualityPct}<span className="text-[16px] font-bold text-[#15803d] ml-[2px]">%</span></div>
          <span className="text-[14px] font-bold text-[#15803d] mb-[8px]">{qualityLabel}</span>
          <p className="text-[13px] text-[#64748b] m-0">
            {kpi.totalCompletedOnTime}/{kpi.totalCompleted} {taskLabel} tepat waktu
          </p>
        </div>

        <div className="bg-[#0f2c52] text-white rounded-[12px] p-[24px] flex flex-col">
          <p className="text-[12px] font-bold text-[#94a3b8] tracking-[1px] m-0 mb-[16px]">SUCCESS RATE</p>
          <p className="text-[42px] font-[800] m-0 mb-[16px] text-white leading-none">
            {successPct}%{' '}
            <small className="text-[16px] font-normal text-[#94a3b8] ml-[8px]">({kpi.totalCompleted}/{kpi.totalAssigned})</small>
          </p>
          <div className="w-full h-[8px] bg-[rgba(255,255,255,0.1)] rounded-[4px] mb-[12px] overflow-hidden">
            <div className="h-full bg-[#38bdf8] rounded-[4px] transition-[width] duration-500 ease-out" style={{ width: `${Math.min(successPct, 100)}%` }} />
          </div>
          <div className="flex justify-between items-center w-full mb-[24px]">
            <span className="text-[13px] text-[#94a3b8] m-0">Target: 85%</span>
            <span className={`p-[2px_8px] rounded-[12px] text-[12px] font-bold ${targetDiff >= 0 ? 'bg-[rgba(56,189,248,0.2)] text-[#38bdf8]' : 'bg-[rgba(239,68,68,0.2)] text-[#fca5a5]'}`}>
              {diffLabel}
            </span>
          </div>
          <p className="mt-auto mb-0 mx-0 text-[13px] text-[#94a3b8] pt-[16px] border-t border-[rgba(255,255,255,0.1)] w-full">
            Volume: {kpi.totalCompleted}/{kpi.totalAssigned} {taskLabel}
          </p>
        </div>

        <div className="flex flex-col gap-[16px]">
          <div className="bg-white rounded-[12px] border border-[#e2e8f0] p-[20px] flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[28px] font-[800] text-[#0f2c52] m-0 mb-[4px] leading-none">{kpi.totalCompletedOnTime}</p>
                <p className="text-[12px] font-bold text-[#64748b] m-0 tracking-[0.5px]">ON TIME</p>
              </div>
              <span className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center bg-[#dcfce7] text-[#16a34a]">
                <Clock size={18} strokeWidth={2} />
              </span>
            </div>
          </div>
          <div className="bg-white rounded-[12px] border border-[#e2e8f0] p-[20px] flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[28px] font-[800] text-[#dc2626] m-0 mb-[4px] leading-none">{kpi.totalOverdue}</p>
                <p className="text-[12px] font-bold text-[#64748b] m-0 tracking-[0.5px]">OVERDUE</p>
              </div>
              <span className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center bg-[#fee2e2] text-[#dc2626]">
                <AlertTriangle size={18} strokeWidth={2} />
              </span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-[24px]">
        <AccountDetailsCard profile={profile} />
        <RecentActivity />
      </div>
    </div>
  );
}

function ProfileIdentityCard({ profile, children }: { profile: ProfileData; children?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[12px] p-[24px] border border-[#e2e8f0] flex flex-col items-center text-center">
      <div className="w-[90px] h-[90px] rounded-full bg-[#f1f5f9] flex items-center justify-center overflow-hidden mb-[16px] shadow-[0_4px_12px_rgba(15,44,82,0.1)] border-[3px] border-white">
        {profile.profilePhotoUrl ? (
          <img
            src={fileUrl(profile.profilePhotoUrl)}
            alt={profile.fullName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-[32px] font-bold text-[#0f2c52]">{profile.fullName?.charAt(0) ?? '?'}</div>
        )}
      </div>
      <h2 className="text-[18px] font-bold text-[#0f2c52] m-0 mb-[6px]">{profile.fullName ?? '-'}</h2>
      <span className="bg-[#f1f5f9] text-[#0f2c52] text-[11px] font-bold p-[4px_12px] rounded-[12px] uppercase tracking-[0.5px]">{profile.role}</span>
      {children}
    </div>
  );
}

function AccountDetailsCard({ profile }: { profile: ProfileData }) {
  return (
    <div className="bg-white rounded-[12px] p-[24px] border border-[#e2e8f0] flex flex-col">
      <h3 className="text-[14px] font-bold text-[#0f2c52] uppercase tracking-[0.5px] m-0 mb-[20px] pb-[16px] border-b border-[#e2e8f0]">
        <Users size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
        Account Details
      </h3>
      <div className="flex flex-col gap-[6px] mb-[16px]">
        <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px]">Username</label>
        <div className="text-[15px] text-[#1e293b] font-medium bg-[#f8fafc] p-[12px_14px] rounded-[8px] border border-[#f1f5f9]">{profile.fullName ?? '-'}</div>
      </div>
      <div className="flex flex-col gap-[6px] mb-[16px]">
        <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px]">Email</label>
        <div className="text-[15px] text-[#1e293b] font-medium bg-[#f8fafc] p-[12px_14px] rounded-[8px] border border-[#f1f5f9]">{profile.email}</div>
      </div>
      <div className="flex flex-col gap-[6px] mb-[16px]">
        <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px]">Role</label>
        <div className="text-[15px] text-[#1e293b] font-medium bg-[#f8fafc] p-[12px_14px] rounded-[8px] border border-[#f1f5f9]">{profile.role}</div>
      </div>
      <Link to="/profile/edit" className="mt-auto bg-[#f1f5f9] text-[#475569] no-underline text-center p-[12px] rounded-[8px] text-[14px] font-semibold transition-all duration-200 hover:bg-[#e2e8f0] hover:text-[#1e293b]">
        Edit Profile
      </Link>
    </div>
  );
}
