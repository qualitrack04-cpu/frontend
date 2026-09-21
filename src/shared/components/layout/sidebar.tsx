import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  FileWarning,
  ListChecks,
  TrendingUp,
  LogOut,
  Plus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const menuItems:  {label: string; path: string; icon: LucideIcon}[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Audits', path: '/audits', icon: ClipboardCheck },
  { label: 'Findings', path: '/findings', icon: FileWarning },
  { label: 'CAPA', path: '/capa', icon: ListChecks },
  { label: 'SPC Analysis', path: '/spc-analysis', icon: TrendingUp },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    navigate('/login', {replace: true });
  };

  return (
    <aside className="sidebar">
      <button className="btn-new-audit" onClick={() => navigate('/audits/new')}>
        <Plus size={16} /> New Audit
      </button>

      <nav className="sidebar-menu">
        {menuItems.map(( { label, path, icon:  Icon}) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              isActive ? 'sidebar-item active' : 'sidebar-item'
            }
          >
            <Icon size={20} strokeWidth={1.75} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="btn-logout" onClick={handleLogout}>
        <LogOut size={18} strokeWidth={1.75} />
        <span>Logout</span>
      </button>
    </aside>
  );
}