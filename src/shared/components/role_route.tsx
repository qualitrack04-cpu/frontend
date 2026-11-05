import { Navigate, Outlet } from 'react-router-dom';
import { useRole } from '../context/role_context';

// Hanya role di `allow` yang boleh membuka route ini, selain itu dialihkan ke `redirectTo`
export default function RoleRoute({ allow, redirectTo = '/dashboard' }: { allow: string[]; redirectTo?: string }) {
  const { role } = useRole();
  return allow.includes(role) ? <Outlet /> : <Navigate to={redirectTo} replace />;
}
