// Nilai role mengikuti backend (Models/UserRole.cs)
export const ROLES = {
  Admin: 'Admin',
  QualityManager: 'QualityManager',
  AuditorInternal: 'AuditorInternal',
  Auditee: 'Auditee',
} as const;

export function getCurrentRole() {
  return localStorage.getItem('role') ?? '';
}

export function hasRole(...roles: string[]) {
  return roles.includes(getCurrentRole());
}

// Sesuai backend: create/edit/delete audit plan hanya Admin & QualityManager
export function canManageAuditPlans() {
  return hasRole(ROLES.Admin, ROLES.QualityManager);
}

export function canEditAuditPlans() {
  return hasRole(ROLES.QualityManager, ROLES.Admin);
}

export function canCreateCapa() {
  return !hasRole(ROLES.Auditee);
}