/**
 * Kebijakan kekuatan password yang dipakai bersama.
 *
 * Aturan ini HARUS identik dengan AuthController.ValidatePasswordStrength di backend,
 * supaya tidak ada jalur (mis. Edit Profile vs Change Password modal) yang lebih longgar.
 *
 * Minimal 8 karakter, kombinasi huruf besar & kecil, angka, dan karakter spesial.
 */
export const PASSWORD_MIN_LENGTH = 8;

export interface PasswordChecks {
  hasMinLength: boolean;
  hasUpperLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    hasMinLength: password.length >= PASSWORD_MIN_LENGTH,
    hasUpperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

export function countPasswordChecks(checks: PasswordChecks): number {
  return [checks.hasMinLength, checks.hasUpperLower, checks.hasNumber, checks.hasSpecial].filter(
    Boolean
  ).length;
}

export function isPasswordStrong(password: string): boolean {
  return countPasswordChecks(getPasswordChecks(password)) === 4;
}
