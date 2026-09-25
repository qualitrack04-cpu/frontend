import { Navigate, Outlet } from 'react-router-dom';
import { hasRole } from '../utils/role';

// Hanya role di `allow` yang boleh membuka route ini, selain itu dialihkan ke `redirectTo`
export default function RoleRoute({ allow, redirectTo = '/dashboard' }: { allow: string[]; redirectTo?: string }) {
  return hasRole(...allow) ? <Outlet /> : <Navigate to={redirectTo} replace />;
}
