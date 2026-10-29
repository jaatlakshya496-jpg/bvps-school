const configuredApiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ?? '';
// Production requests stay on the website origin and are proxied by Vercel to
// Render. This keeps the HttpOnly admin cookie first-party in browsers that
// block third-party cookies.
const API_BASE_URL = import.meta.env.PROD ? '' : configuredApiBase;

/**
 * Admin auth ab HttpOnly cookie se hoti hai. Browser JavaScript kabhi
 * ADMIN_SECRET ya session token nahi dekhta — sirf CSRF token memory me rakhta
 * hai (page reload par `/api/admin/status` se dobara mil jaata hai).
 *
 * CSRF token ko localStorage me nahi rakhte: wo sirf is tab ke requests ke
 * liye chahiye aur XSS ki soorat me bhi session cookie HttpOnly hi rehti hai.
 */
let csrfToken = '';

export function setCsrfToken(token: string | null | undefined) {
  csrfToken = typeof token === 'string' ? token : '';
}

export function getCsrfToken(): string {
  return csrfToken;
}

export type ApiError = {
  status: number;
  error: string;
  [key: string]: unknown;
};

function normalizeErrorMessage(json: unknown): string {
  if (!json || typeof json !== 'object') return '';
  const body = json as { error?: unknown; message?: unknown };
  if (Array.isArray(body.error)) {
    const first = body.error[0] as { message?: string } | undefined;
    if (first?.message) return first.message;
  }
  if (typeof body.error === 'string') return body.error;
  if (typeof body.message === 'string') return body.message;
  return '';
}

async function request<T>(url: string, init: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { ...init, credentials: 'include' });
  } catch {
    throw {
      status: 0,
      error: 'Server se connect nahi ho paya. Internet check karein aur dobara koshish karein.',
    } satisfies ApiError;
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw {
      status: res.status,
      error: normalizeErrorMessage(json) || `Request failed (${res.status}). Please try again.`,
      ...(json && typeof json === 'object' ? json : {}),
    } satisfies ApiError;
  }

  if (json === null) {
    throw { status: res.status, error: 'Server returned an empty response. Please try again.' } satisfies ApiError;
  }

  return json as T;
}

function authHeaders(): Record<string, string> {
  return csrfToken ? { 'x-csrf-token': csrfToken } : {};
}

export async function apiPost<T = { success: boolean; message?: string; whatsappUrl?: string }>(
  path: string,
  body: unknown,
): Promise<T> {
  return request<T>(`${API_BASE_URL}/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(`${API_BASE_URL}/api${path}`, { method: 'GET' });
}

/**
 * Admin GET. `legacyKey` sirf backward-compatible scripts ke liye hai —
 * website ise kabhi nahi bhejti, isliye secret browser storage me nahi jaata.
 */
export async function apiGetAdmin<T>(path: string, legacyKey?: string): Promise<T> {
  const headers: Record<string, string> = legacyKey ? { 'x-admin-key': legacyKey } : {};
  return request<T>(`${API_BASE_URL}/api${path}`, { method: 'GET', headers });
}

export async function apiSend<T>(
  method: 'PUT' | 'POST' | 'DELETE',
  path: string,
  body: unknown,
  legacyKey?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders(),
    ...(legacyKey ? { 'x-admin-key': legacyKey } : {}),
  };
  return request<T>(`${API_BASE_URL}/api${path}`, {
    method,
    headers,
    body: method === 'DELETE' ? undefined : JSON.stringify(body),
  });
}

export type AdminSessionInfo = {
  email: string;
  csrfToken?: string | null;
  expiresAt?: string | null;
  mode?: string;
};

export async function apiAdminStatus(): Promise<AdminSessionInfo> {
  const res = await apiGetAdmin<{ success: boolean; data?: AdminSessionInfo }>('/admin/status');
  return res?.data ?? { email: '' };
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<{ success: boolean; data?: AdminSessionInfo; error?: string; status?: number }> {
  try {
    const json = await request<{ success: boolean; data?: AdminSessionInfo; error?: string }>(
      `${API_BASE_URL}/api/admin/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      },
    );
    if (json?.success && json.data?.csrfToken) setCsrfToken(json.data.csrfToken);
    return json;
  } catch (err) {
    const apiErr = err as ApiError;
    return { success: false, error: apiErr?.error ?? 'Login failed', status: apiErr?.status };
  }
}

/** Fee-page passcode gate — ADMIN_SECRET ki jagah server session cookie milti hai. */
export async function apiUnlockPasscode(secret: string): Promise<{ success: boolean; data?: AdminSessionInfo; error?: string; status?: number }> {
  try {
    const json = await request<{ success: boolean; data?: AdminSessionInfo; error?: string }>(
      `${API_BASE_URL}/api/admin/session`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      },
    );
    if (json?.success && json.data?.csrfToken) setCsrfToken(json.data.csrfToken);
    return json;
  } catch (err) {
    const apiErr = err as ApiError;
    return { success: false, error: apiErr?.error ?? 'Passcode verification failed', status: apiErr?.status };
  }
}

export async function apiLogout(): Promise<void> {
  try {
    await request<{ success: boolean }>(`${API_BASE_URL}/api/admin/logout`, {
      method: 'POST',
      headers: authHeaders(),
    });
  } catch {
    // Network down ho toh bhi local state clear hoti hai; cookie agle login par
    // overwrite ho jayegi. Server-side revoke best-effort hai.
  } finally {
    setCsrfToken('');
  }
}

export function isAuthError(err: unknown): boolean {
  const status = (err as ApiError | undefined)?.status;
  return status === 401 || status === 403;
}

export function extractApiError(err: unknown): string {
  const e = err as { error?: unknown; message?: string };
  if (Array.isArray(e?.error)) {
    const first = e.error[0] as { message?: string } | undefined;
    if (first?.message) return first.message;
  }
  return typeof e?.error === 'string' ? e.error : (e?.message ?? 'Something went wrong. Please try again.');
}
