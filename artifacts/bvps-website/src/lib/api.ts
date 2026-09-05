const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ?? '';

export async function apiPost(path: string, body: unknown): Promise<{ success: boolean; message?: string }> {
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