export const ADMIN_TOKEN_KEY = 'bvps_admin_token';
// fee-structure page ke purane key — us page par "Manage Fees" buttons bhi dikhne chahiye
export const ADMIN_LEGACY_KEY = 'bvps_admin_key';
export const ADMIN_EMAIL_KEY = 'bvps_admin_email';

export function getAdminToken(): string {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

export function getAdminEmail(): string {
  try {
    return localStorage.getItem(ADMIN_EMAIL_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setAdminSession(token: string, email?: string) {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    // Legacy fee-page key bhi set karo taaki fee-structure pe bhi owner controls dikhein
    localStorage.setItem(ADMIN_LEGACY_KEY, token);
    if (email) localStorage.setItem(ADMIN_EMAIL_KEY, email);
  } catch {
    // ignore
  }
}

export function clearAdminSession() {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_LEGACY_KEY);
    localStorage.removeItem(ADMIN_EMAIL_KEY);
  } catch {
    // ignore
  }
}