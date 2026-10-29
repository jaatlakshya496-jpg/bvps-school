/**
 * Admin ke liye browser me sirf **non-sensitive** hint rakha jaata hai.
 *
 * Pehle `bvps_admin_key` / `bvps_admin_token` me actual ADMIN_SECRET token
 * padta tha — XSS ya shared computer par wo leak ho sakta tha. Ab session
 * HttpOnly cookie hai (JS se readable nahi), aur yahan sirf login kiya hua
 * email store hota hai:
 *  - Footer ko batane ke liye ki admin link dikhana hai ya nahi.
 *  - Admin portal header me email dikhane ke liye.
 *
 * Email bhi sensitive nahi hai (owner khud jaanta hai), par logout par hata
 * di jaati hai. Asli authorization hamesha server par hoti hai.
 */
export const ADMIN_EMAIL_KEY = 'bvps_admin_email';
// Purane keys — sirf cleanup ke liye, inme ab kuch nahi likha jaata.
const LEGACY_TOKEN_KEY = 'bvps_admin_token';
const LEGACY_SECRET_KEY = 'bvps_admin_key';

export function getAdminEmail(): string {
  try {
    return localStorage.getItem(ADMIN_EMAIL_KEY) ?? '';
  } catch {
    return '';
  }
}

/** Footer/admin UI hint — proof nahi, sirf UI convenience. */
export function isAdminHint(): boolean {
  return Boolean(getAdminEmail());
}

export function setAdminSession(email?: string) {
  try {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_SECRET_KEY);
    if (email) localStorage.setItem(ADMIN_EMAIL_KEY, email);
    else localStorage.removeItem(ADMIN_EMAIL_KEY);
  } catch {
    // localStorage blocked (private mode) — cookie session phir bhi kaam karega.
  }
}

export function clearAdminSession() {
  try {
    localStorage.removeItem(ADMIN_EMAIL_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_SECRET_KEY);
  } catch {
    // ignore
  }
}
