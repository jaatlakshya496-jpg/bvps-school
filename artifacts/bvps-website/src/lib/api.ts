const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ?? '';

export async function apiPost(path: string, body: unknown): Promise<{ success: boolean; message?: string; whatsappUrl?: string }> {
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

export async function apiSend<T>(method: 'PUT' | 'POST', path: string, body: unknown, adminKey: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed. Please try again.' }));
    throw err;
  }
  return res.json();
}