import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="app-header">
      <div className="logo">
        <span className="logo-text">QualiTrack</span>
      </div>

      <Link to="/profile" className="user-avatar">
        <img src="/default-avatar.png" alt="User avatar" />
      </Link>
    </header>
  );
}