// Nilai role mengikuti backend (Models/UserRoles.cs)
export const ROLES = {
  Admin: 'Admin',
  QualityManager: 'QualityManager',
  AuditorInternal: 'AuditorInternal',
  Auditee: 'Auditee',
} as const;

// Selaras dengan BE (UserRoles.NormalizeRole) & Mobile (UserRole.fromApi): 'Auditor' dinormalisasi ke 'AuditorInternal'
export function normalizeRole(role?: string | null): string {
  if (!role) return '';
  const trimmed = role.trim();
  if (trimmed.toLowerCase() === 'auditor') {
    return ROLES.AuditorInternal;
  }
  return trimmed;
}

export function getCurrentRole() {
  return normalizeRole(localStorage.getItem('role'));
}

export function hasRole(...roles: string[]) {
  const current = getCurrentRole();
  return roles.some((r) => normalizeRole(r) === current);
}

export function hasRoleFor(role: string, ...roles: string[]) {
  const norm = normalizeRole(role);
  return roles.some((r) => normalizeRole(r) === norm);
}

export function canManageAuditPlansFor(role: string) {
  return hasRoleFor(role, ROLES.Admin, ROLES.QualityManager);
}

export function canCreateCapaFor(role: string) {
  return !hasRoleFor(role, ROLES.Auditee);
}

// Sesuai Mobile: Auditee tidak bisa menjalankan checklist; AuditorInternal hanya untuk audit yang ditugaskan padanya
export function canRunChecklistFor(role: string, auditorName?: string, currentUserName?: string) {
  const normRole = normalizeRole(role);
  if (normRole === ROLES.Auditee) return false;
  if (hasRoleFor(normRole, ROLES.Admin, ROLES.QualityManager)) return true;
  if (normRole === ROLES.AuditorInternal) {
    if (!auditorName || !currentUserName) return false;
    return auditorName.trim().toLowerCase() === currentUserName.trim().toLowerCase();
  }
  return false;
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