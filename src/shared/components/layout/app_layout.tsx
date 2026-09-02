import { Outlet } from 'react-router-dom';
import sidebar from './sidebar';
import header from './header';

export default function AppLayout() {
  return (
    <div className="app-container">
      <header />
      <div className="app-body">
        <header />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}