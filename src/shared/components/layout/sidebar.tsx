import { NavLink, useNavigate, useNavigation } from'react-router-dom';

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊'},
  { label: 'Audit', path: '/audit', icon:'📊'},
  { label: 'Finding', path: '/finding', icon:'📊'},
  { label: 'Capa', path: '/capa', icon: '✔️'},
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
      </button>;

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => 
            isActive ? 'sidebar-item active' : 'sidebar-item'
          }
          >
          <span className="icon">{item.icon}</span>
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