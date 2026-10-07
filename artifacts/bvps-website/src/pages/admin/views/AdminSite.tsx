import { useEffect, useMemo, useState } from 'react';
import { Save, Loader2, Globe2, RotateCcw, Check } from 'lucide-react';
import { apiGetAdmin, apiSend, extractApiError } from '@/lib/api';
import { CONTENT_SECTIONS, DEFAULT_CONTENT, useSiteContent } from '@/lib/site-content';

/**
 * Website Content editor — poori website ki text yahin se badalti hai.
 *
 * - `site_content` table me sirf **overrides** save hote hain (default nahi),
 *   isliye "Reset" karne par code me likhi hui asli value wapas aa jaati hai.
 * - Save karte hi `PUT /api/content` chala jaata hai aur public site ka
 *   `GET /api/content` agle render se nayi value dikhata hai (cache 1 min).
 */
export function AdminSite({ token, onExpired }: { token: string; onExpired: () => void }) {
  const { get } = useSiteContent();
  const [server, setServer] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState<string>('site');
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await apiGetAdmin<{ success: boolean; data?: Record<string, unknown> }>(
        '/content/admin',
        token,
      );
      const raw = res?.data ?? {};
      const overrides: Record<string, string> = {};
      for (const [k, v] of Object.entries(raw)) {
        if (v === null || v === undefined) continue;
        overrides[k] = typeof v === 'string' ? v : String(v);
      }
      setServer(overrides);
      setDraft({ ...DEFAULT_CONTENT, ...overrides });
    } catch (err: any) {
      const m = String(err?.error ?? '').toLowerCase();
      if (m.includes('forbidden') || m.includes('invalid')) onExpired();
      else setMsg({ text: extractApiError(err), ok: false });
      setDraft({ ...DEFAULT_CONTENT });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const effective = useMemo(
    () => (key: string) => server[key] ?? DEFAULT_CONTENT[key] ?? '',
    [server],
  );

  const dirtyKeys = useMemo(
    () => Object.keys(DEFAULT_CONTENT).filter((key) => (draft[key] ?? '') !== effective(key)),
    [draft, effective],
  );

  const overrideCount = Object.keys(server).length;

  function update(key: string, value: string) {
    setDraft(d => ({ ...d, [key]: value }));
    setMsg(null);
  }

  async function resetField(key: string) {
    if (server[key] === undefined) return;
    try {
      const res = await apiSend<{ success: boolean; data?: Record<string, unknown> }>(
        'DELETE',
        `/content/${encodeURIComponent(key)}`,
        {},
        token,
      );
      const raw = res?.data ?? {};
      const overrides: Record<string, string> = {};
      for (const [k, v] of Object.entries(raw)) {
        if (v === null || v === undefined) continue;
        overrides[k] = typeof v === 'string' ? v : String(v);
      }
      setServer(overrides);
      setDraft(d => ({ ...d, [key]: DEFAULT_CONTENT[key] ?? '' }));
      setMsg({ text: `"${key}" default par reset ho gaya.`, ok: true });
    } catch (err: any) {
      const m = String(err?.error ?? '').toLowerCase();
      if (m.includes('forbidden') || m.includes('invalid')) onExpired();
      else setMsg({ text: extractApiError(err), ok: false });
    }
  }

  async function save() {
    if (!dirtyKeys.length) {
      setMsg({ text: 'Kuch badla hi nahi hai.', ok: false });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const items: Record<string, string> = {};
      for (const key of dirtyKeys) items[key] = draft[key] ?? '';
      const res = await apiSend<{ success: boolean; data?: Record<string, unknown> }>(
        'PUT',
        '/content',
        { items },
        token,
      );
      const raw = res?.data ?? {};
      const overrides: Record<string, string> = {};
      for (const [k, v] of Object.entries(raw)) {
        if (v === null || v === undefined) continue;
        overrides[k] = typeof v === 'string' ? v : String(v);
      }
      setServer(overrides);
      setDraft({ ...DEFAULT_CONTENT, ...overrides });
      setMsg({
        text: `${dirtyKeys.length} field save ho gaye ✅ Website par live (1 minute me sab jagah).`,
        ok: true,
      });
    } catch (err: any) {
      const m = String(err?.error ?? '').toLowerCase();
      if (m.includes('forbidden') || m.includes('invalid')) onExpired();
      else setMsg({ text: extractApiError(err), ok: false });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading website content…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-serif font-bold text-black">Website Content</h2>
          <p className="text-sm text-muted-foreground">
            Heading, contact details, notice aur SEO title/description — sab yahin se.
            {overrideCount > 0 && (
              <span className="text-primary font-semibold"> {overrideCount} field customized.</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setDraft({ ...DEFAULT_CONTENT }); setMsg(null); }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-black border border-border rounded-xl px-4 h-11 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Revert edits
          </button>
          <button
            onClick={save}
            disabled={saving || !dirtyKeys.length}
            className="inline-flex items-center gap-2 bg-primary text-white font-bold rounded-xl px-6 h-11 text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : dirtyKeys.length ? `Save ${dirtyKeys.length} change(s)` : 'Save'}
          </button>
        </div>
      </div>

      {msg && (
        <p className={`text-sm rounded-xl px-4 py-3 border ${msg.ok ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
          {msg.text}
        </p>
      )}

      <div className="space-y-4">
        {CONTENT_SECTIONS.map(section => {
          const isOpen = open === section.id;
          const sectionDirty = section.groups
            .flatMap(g => g.fields)
            .filter(field => (draft[field.key] ?? '') !== effective(field.key)).length;
          return (
            <div key={section.id} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? '' : section.id)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Globe2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="min-w-0">
                    <span className="block font-bold text-black truncate">{section.title}</span>
                    <span className="block text-xs text-muted-foreground truncate">{section.description}</span>
                  </span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  {sectionDirty > 0 && (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                      {sectionDirty} unsaved
                    </span>
                  )}
                  <span className="text-xs font-semibold text-primary">{isOpen ? 'Hide' : 'Open'}</span>
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-border px-5 py-5 space-y-6">
                  {section.groups.map(group => (
                    <div key={group.title}>
                      <h4 className="text-sm font-bold text-black mb-3 pb-2 border-b border-border/60">
                        {group.title}
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {group.fields.map(field => {
                          const isTextarea = field.type === 'textarea';
                          const value = draft[field.key] ?? '';
                          const isDirty = value !== effective(field.key);
                          const hasOverride = server[field.key] !== undefined;
                          const inputCls = `w-full border rounded-xl px-3.5 py-2.5 text-black bg-white outline-none focus:border-primary transition-colors ${isDirty ? 'border-amber-400 bg-amber-50/40' : 'border-border'}`;
                          return (
                            <div key={field.key} className={isTextarea ? 'sm:col-span-2' : ''}>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <label className="text-xs font-semibold text-foreground">{field.label}</label>
                                <span className="flex items-center gap-2">
                                  {isDirty && <Check className="w-3.5 h-3.5 text-amber-600" />}
                                  {hasOverride && (
                                    <button
                                      onClick={() => resetField(field.key)}
                                      className="text-[11px] font-semibold text-muted-foreground hover:text-red-600 underline-offset-2 hover:underline"
                                      title="Default value wapas laao"
                                    >
                                      Reset
                                    </button>
                                  )}
                                </span>
                              </div>
                              {isTextarea ? (
                                <textarea
                                  value={value}
                                  rows={field.key === 'site.announcement' ? 2 : 3}
                                  onChange={e => update(field.key, e.target.value)}
                                  className={inputCls}
                                />
                              ) : (
                                <input
                                  type={field.type ?? 'text'}
                                  value={value}
                                  onChange={e => update(field.key, e.target.value)}
                                  className={inputCls}
                                />
                              )}
                              {field.hint && <p className="text-[11px] text-muted-foreground mt-1">{field.hint}</p>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Note: content turant website par update ho jaata hai. SEO title/description Google me
        next crawl (1–7 din) par dikhta hai. Notice bar sirf tab dikhta hai jab
        “Site-wide notice” khaali na ho.
        {' '}<span className="font-semibold">{get('site.name')}</span> ka data live hai.
      </p>
    </div>
  );
}
