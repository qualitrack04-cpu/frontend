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

export function hasRoleFor(role: string, ...roles: string[]) {
  return roles.includes(role);
}

export function canManageAuditPlansFor(role: string) {
  return hasRoleFor(role, ROLES.Admin, ROLES.QualityManager);
}

export function canCreateCapaFor(role: string) {
  return !hasRoleFor(role, ROLES.Auditee);
}

// Sesuai backend: create/edit/delete audit plan hanya Admin & QualityManager
export function canManageAuditPlans() {
  return canManageAuditPlansFor(getCurrentRole());
}

export function canEditAuditPlans() {
  return hasRole(ROLES.QualityManager, ROLES.Admin);
}

export function canCreateCapa() {
  return canCreateCapaFor(getCurrentRole());
}