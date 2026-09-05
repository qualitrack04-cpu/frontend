import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import Header from './header';

export default function AppLayout() {
  return (
    <div className="app-container">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}




