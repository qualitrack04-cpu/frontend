import { NavLink, useNavigate } from 'react-router-dom';

const menuItems = [
  { label: 'Dashboard', path: '/dashboard'},
  { label: 'Audits', path: '/audits'},
  { label: 'Findings', path: '/findings'},
  { label: 'CAPA', path: '/capa'},
  { label: 'SPC Analysis', path: '/spc-analysis'},
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <button className="btn-new-audit" onClick={() => navigate('/audits/new')}>
        + New Audit
      </button>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? 'sidebar-item active' : 'sidebar-item'
            }
          >
            <span className="icon"></span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="btn-logout" onClick={handleLogout}>
        ⏻ Logout
      </button>
    </aside>
  );
}