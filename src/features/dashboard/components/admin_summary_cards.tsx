import { Users, ShieldCheck, Building2, CheckSquare, BarChart2 } from 'lucide-react';
import type { AdminDashboardSummary } from '../api/admin_api';

interface AdminSummaryCardsProps {
  summary: AdminDashboardSummary;
}

export default function AdminSummaryCards({ summary }: AdminSummaryCardsProps) {
  const cards = [
    {
      title: 'Total Users',
      value: summary?.totalUsers ?? '-',
      icon: Users,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
    {
      title: 'Total ISO Standards',
      value: summary?.totalIsoStandards ?? '-',
      icon: ShieldCheck,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Total Departments',
      value: summary?.totalDepartments ?? '-',
      icon: Building2,
      iconBg: 'bg-fuchsia-50',
      iconColor: 'text-fuchsia-500',
    },
    {
      title: 'Active Templates',
      value: summary?.totalChecklistTemplates ?? '-',
      icon: CheckSquare,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      title: 'Total SPC Units',
      value: summary?.totalSpcUnits ?? '-',
      icon: BarChart2,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white rounded-[16px] p-[24px] shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 flex flex-col">
          <div className={`w-[40px] h-[40px] rounded-[10px] flex items-center justify-center mb-6 ${card.iconBg} ${card.iconColor}`}>
            <card.icon size={20} strokeWidth={2} />
          </div>
          <h2 className="text-[32px] font-extrabold text-[#0f2c52] m-0 mb-1 leading-none">{card.value}</h2>
          <p className="text-[13px] font-medium text-slate-400 m-0">{card.title}</p>
        </div>
      ))}
    </div>
  );
}
