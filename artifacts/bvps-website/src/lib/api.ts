const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ?? '';

export async function apiPost<T = { success: boolean; message?: string; whatsappUrl?: string }>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to submit. Please try again.' }));
    throw err;
  }

  return res.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/api${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to load data.' }));
    throw err;
  }
  return res.json();
}

export async function apiGetAdmin<T>(path: string, adminKey: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    headers: { 'x-admin-key': adminKey },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed. Please try again.' }));
    throw err;
  }
  return res.json();
}

export async function apiSend<T>(method: 'PUT' | 'POST' | 'DELETE', path: string, body: unknown, adminKey: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
    body: method === 'DELETE' ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed. Please try again.' }));
    throw err;
  }
  return res.json();
}

export async function apiLogin(email: string, password: string): Promise<{ success: boolean; data?: { token: string; email: string }; error?: string }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => ({ success: false, error: 'Server se connect nahi ho paya.' }));
  if (!res.ok) return { success: false, error: json?.error ?? 'Login failed' };
  return json;
}

export function extractApiError(err: unknown): string {
  const e = err as { error?: unknown; message?: string };
  if (Array.isArray(e?.error)) {
    const first = e.error[0] as { message?: string } | undefined;
    if (first?.message) return first.message;
  }
  return typeof e?.error === 'string' ? e.error : (e?.message ?? 'Something went wrong. Please try again.');
}