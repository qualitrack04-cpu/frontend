import { createBrowserRouter } from 'react-router-dom';
// Layout & Route Protection
import AppLayout from '../shared/components/layout/app_layout';
import ProtectedRoute from '../shared/components/protected_route';
// Auth Pages
import SignInPage from '../features/auth/components/sign_in_page';
import SignUpPage from '../features/auth/components/sign_up_page';
import ForgotPasswordPage from '../features/auth/components/forgot_password_page';
import VerifyOtpPage from '../features/auth/components/verify_otp_page';
import ResetPasswordPage from '../features/auth/components/reset_password_page';
// Main Feature Pages
import DashboardPage from '../features/dashboard/components/dashboard_page';
import AuditsPage from '../features/audits/components/audits_page';
import FindingsPage from '../features/findings/components/findings_page';
import CapaPage from '../features/capa/components/capa_page';
import SpcAnalysisPage from '../features/spc_analysis/components/spc_analysis_page';
import SpcHistoryPage from '../features/spc_analysis/components/spc_history_page';
import SpcResultDetailPage from '../features/spc_analysis/components/spc_result_detail_page';

import ProfilePage from '../features/profile/components/profile_page';
import EditProfilePage from '../features/profile/components/edit_profile_page';

const router = createBrowserRouter([
  // Halaman publik — tidak butuh login
  { path: '/login', element: <SignInPage /> },
  { path: '/signup', element: <SignUpPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/verify-otp', element: <VerifyOtpPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

  // Halaman terproteksi — wajib login
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'audits', element: <AuditsPage /> },
          { path: 'findings', element: <FindingsPage /> },
          { path: 'capa', element: <CapaPage /> },
          { path: 'spc-analysis', element: <SpcAnalysisPage /> },
          { path: 'spc-analysis/history', element: <SpcHistoryPage /> }, 
          { path: 'spc-analysis/history/:id', element: <SpcResultDetailPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'profile/edit', element: <EditProfilePage /> },
        ],
      },
    ],
  },
]);

export default router;