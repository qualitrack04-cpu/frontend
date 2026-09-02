export default function header() {
  return (
    <header className="app-header">
      <div className="logo">
        <span className="logo-icon">🛡️</span>
        <span className="logo-text">QualiTrack</span>
      </div>

      <div className="user-avatar">
        <img src="/default-avatar.png" alt="User avatar" />
      </div>
    </header>
  );
}