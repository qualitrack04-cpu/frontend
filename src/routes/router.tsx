import { createBrowserRouter, Navigate } from 'react-router-dom';
// Layout & Route Protection
import AppLayout from '../shared/components/layout/app_layout';
import ProtectedRoute from '../shared/components/protected_route';
import PublicOnlyRoute from '../shared/components/public_only_route';
import RoleRoute from '../shared/components/role_route';
import { ROLES } from '../shared/utils/role';
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
import FindingFormPage from '../features/findings/components/finding_form_page';
import FindingDetailPage from '../features/findings/components/finding_detail_page';
import CapaPage from '../features/capa/components/capa_page';
import CreateCapaPage from '../features/capa/components/create_capa_page';
import CapaDetailPage from '../features/capa/components/capa_detail_page';
import SpcAnalysisPage from '../features/spc_analysis/components/spc_analysis_page';
import SpcHistoryPage from '../features/spc_analysis/components/spc_history_page';
import SpcResultDetailPage from '../features/spc_analysis/components/spc_result_detail_page';

import ProfilePage from '../features/profile/components/profile_page';
import EditProfilePage from '../features/profile/components/edit_profile_page';

import CreateAuditPlanPage from '../features/audits/components/create_audit_page';
import AuditChecklistEditPage from '../features/audits/components/audit_checklist_edit_page';
import AuditChecklistPage from '../features/audits/components/audit_checklist_page';
import AuditReportPreviewPage from '../features/audits/components/audit_report_preview_page';
const router = createBrowserRouter([
  // Hanya untuk yang belum login
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <SignInPage /> },
      { path: '/signup', element: <SignUpPage /> },
    ],
  },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/verify-otp', element: <VerifyOtpPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'audits', element: <AuditsPage /> },
          { path: 'findings', element: <FindingsPage /> },
          { path: 'findings/new', element: <FindingFormPage mode="create" /> },
          { path: 'findings/:id', element: <FindingDetailPage /> },
          { path: 'findings/:id/edit', element: <FindingFormPage mode="edit" /> },        
          { path: 'capa', element: <CapaPage /> },
          { path: 'capa/new', element: <CreateCapaPage /> },
          { path: 'capa/:id', element: <CapaDetailPage /> },
          { path: 'spc-analysis', element: <SpcAnalysisPage /> },
          { path: 'spc-analysis/history', element: <SpcHistoryPage /> },
          { path: 'spc-analysis/history/:id', element: <SpcResultDetailPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'profile/edit', element: <EditProfilePage /> },
          {
            // Create/edit audit plan hanya untuk Admin & Quality Manager
            element: <RoleRoute allow={[ROLES.Admin, ROLES.QualityManager]} redirectTo="/audits" />,
            children: [
              { path: 'audits/new', element: <CreateAuditPlanPage /> },
              { path: 'audits/:planId/edit', element: <CreateAuditPlanPage /> },
              { path: 'audits/checklists/:checklistId/edit', element: <AuditChecklistEditPage /> },
            ],
          },
          { path: 'audits/:planId/schedule/:scheduleId/checklist',element: <AuditChecklistPage />},
          { path: 'audits/:planId/schedule/:scheduleId/report',element: <AuditReportPage />,}
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/login" replace /> },
]);

export default router;