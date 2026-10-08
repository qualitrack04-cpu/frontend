import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  FileWarning,
  ListChecks,
  TrendingUp,
  LogOut,
  Plus,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { canManageAuditPlans } from '../../utils/role';

const menuItems: { label: string; path: string; icon: LucideIcon }[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Audits', path: '/audits', icon: ClipboardCheck },
  { label: 'Findings', path: '/findings', icon: FileWarning },
  { label: 'CAPA', path: '/capa', icon: ListChecks },
  { label: 'SPC Analysis', path: '/spc-analysis', icon: TrendingUp },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    navigate('/login', { replace: true });
  };

  return (
    <>
      {isOpen && <div className="max-md:block hidden fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[150]" onClick={onClose} />}
      <aside className={`w-[210px] bg-[#0f2c52] text-white py-[18px] px-[12px] flex flex-col overflow-y-auto shrink-0 transition-transform duration-300 z-[200] max-md:fixed max-md:top-0 max-md:left-0 max-md:bottom-0 max-md:-translate-x-full max-md:w-[250px] ${isOpen ? 'max-md:translate-x-0' : ''}`}>
        <div className="max-md:flex hidden items-center justify-between mb-[24px]">
          <span className="font-bold text-[20px]">QualiTrack</span>
          <button className="bg-transparent border-none text-white cursor-pointer p-[4px]" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {canManageAuditPlans() && (
          <button
            className="flex items-center justify-center gap-[8px] bg-transparent border border-[#2ecc71] text-[#2ecc71] py-[10px] rounded-[8px] text-[14px] font-semibold mb-[24px] cursor-pointer no-underline hover:bg-[rgba(46,204,113,0.1)]"
            onClick={() => navigate('/audits/new')}
          >
            <Plus size={16} /> New Audit
          </button>
        )}

        <nav className="flex flex-col gap-[4px] flex-1">
          {menuItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-[10px] p-[9px_10px] rounded-[8px] text-[14px] font-medium no-underline border-l-[3px] hover:bg-[rgba(255,255,255,0.06)] hover:text-white ${isActive ? 'bg-[#1e3a5f] border-[#60a5fa] text-white' : 'text-[#cbd5e1] border-transparent'}`
              }
            >
              <Icon size={20} strokeWidth={1.75} className="shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="flex items-center gap-[12px] bg-transparent border-none text-[#cbd5e1] text-[14px] font-medium p-[10px] cursor-pointer mt-auto hover:text-white" onClick={() => setShowLogoutModal(true)}>
          <LogOut size={18} strokeWidth={1.75} />
          <span>Logout</span>
        </button>
      </aside>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-[1000] backdrop-blur-[2px]">
          <div className="bg-white p-[30px] rounded-[12px] max-w-[400px] text-center shadow-[0_10px_25px_rgba(0,0,0,0.15)] animate-[slideUp_0.3s_ease]">
            <p className="mb-[20px] text-[15px] text-[#475569] leading-[1.5]">Are you sure you want to logout? You will need to login again to access your account.</p>
            <button className="bg-[#dc2626] text-white border-none p-[12px_24px] rounded-[8px] font-semibold cursor-pointer w-full mb-[12px] transition-colors hover:bg-[#b91c1c]" onClick={confirmLogout}>
              <LogOut size={16} className="inline-block mr-[8px] align-text-bottom" /> Logout
            </button>
            <button className="bg-transparent border-none text-[#64748b] font-semibold cursor-pointer hover:text-[#334155] transition-colors" onClick={() => setShowLogoutModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}