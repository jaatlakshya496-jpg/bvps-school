import { useEffect, useState } from 'react';
import { Save, Loader2, IndianRupee, RotateCcw } from 'lucide-react';
import { apiGetAdmin, apiSend, extractApiError } from '@/lib/api';
import type { FeeConfig } from '../types';
import { DEFAULT_FEES, normalizeFees } from '../types';

const rupee = (n: number) => `₹ ${n.toLocaleString('en-IN')}`;
const yearTotal = (f: { monthly: number; annualFund: number }) => f.monthly * 12 + f.annualFund;

export function AdminFees({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [draft, setDraft] = useState<FeeConfig>(DEFAULT_FEES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    let active = true;
    apiGetAdmin<{ success: boolean; data: FeeConfig }>('/fees/admin', token)
      .then(res => { if (active) setDraft(normalizeFees(res?.data ?? DEFAULT_FEES)); })
      .catch((err: any) => {
        const m = String(err?.error ?? '').toLowerCase();
        if (m.includes('forbidden') || m.includes('invalid')) onExpired();
        else setMsg({ text: extractApiError(err), ok: false });
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function updateDraft(kind: 'classes' | 'streams', index: number, field: 'admission' | 'monthly' | 'annualFund', value: string) {
    const num = Math.max(0, Math.floor(Number(value) || 0));
    setDraft(d => {
      if (kind === 'classes') {
        return { ...d, classes: d.classes.map((row, i) => (i === index ? { ...row, [field]: num } : row)) };
      }
      return { ...d, streams: d.streams.map((row, i) => (i === index ? { ...row, [field]: num } : row)) };
    });
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await apiSend<{ success: boolean; data: FeeConfig }>('PUT', '/fees/admin', draft, token);
      if (res?.data) setDraft(normalizeFees(res.data));
      setMsg({ text: 'Fees save ho gayi ✅ Website par live update ho gayi.', ok: true });
    } catch (err: any) {
      const m = String(err?.error ?? '').toLowerCase();
      if (m.includes('forbidden') || m.includes('invalid')) onExpired();
      else setMsg({ text: extractApiError(err), ok: false });
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    'w-24 border border-border rounded-lg px-2 py-1.5 text-black bg-white outline-none focus:border-primary';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading fees…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-serif font-bold text-black">Fee Structure Editor</h2>
          <p className="text-sm text-muted-foreground">Save karte hi website par update ho jata hai.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setDraft(DEFAULT_FEES); setMsg(null); }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-black border border-border rounded-xl px-4 h-11 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary text-white font-bold rounded-xl px-6 h-11 text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Fees'}
          </button>
        </div>
      </div>

      {msg && (
        <p className={`text-sm rounded-xl px-4 py-3 border ${msg.ok ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
          {msg.text}
        </p>
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
          <div className="bg-primary px-5 py-4 flex items-center gap-2 text-white">
            <IndianRupee className="w-4 h-4 text-secondary" />
            <h3 className="font-bold">Class 1 – 10</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left px-5 py-2.5 font-bold text-black">Class</th>
                <th className="text-left px-3 py-2.5 font-bold text-black">Admission ₹</th>
                <th className="text-left px-3 py-2.5 font-bold text-black">Monthly ₹</th>
                <th className="text-left px-3 py-2.5 font-bold text-black">Annual Fund ₹</th>
                <th className="text-left px-3 py-2.5 font-bold text-black">Total / Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {draft.classes.map((row, i) => (
                <tr key={row.name}>
                  <td className="px-5 py-2.5 font-semibold text-black whitespace-nowrap">{row.name}</td>
                  {(['admission', 'monthly', 'annualFund'] as const).map(field => (
                    <td key={field} className="px-2 py-2">
                      <input type="number" min={0} value={row[field]} className={inputCls}
                        onFocus={e => e.currentTarget.select()}
                        onChange={e => updateDraft('classes', i, field, e.target.value)} />
                    </td>
                  ))}
                  <td className="px-3 py-2.5 font-bold text-green-700 whitespace-nowrap">{rupee(yearTotal(row))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
          <div className="bg-primary px-5 py-4 flex items-center gap-2 text-white">
            <IndianRupee className="w-4 h-4 text-secondary" />
            <h3 className="font-bold">Class 11 &amp; 12 — Streams</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left px-5 py-2.5 font-bold text-black">Stream</th>
                <th className="text-left px-3 py-2.5 font-bold text-black">Admission ₹</th>
                <th className="text-left px-3 py-2.5 font-bold text-black">Monthly ₹</th>
                <th className="text-left px-3 py-2.5 font-bold text-black">Annual Fund ₹</th>
                <th className="text-left px-3 py-2.5 font-bold text-black">Total / Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {draft.streams.map((row, i) => (
                <tr key={row.name}>
                  <td className="px-5 py-2.5 font-semibold text-black whitespace-nowrap">{row.name}</td>
                  {(['admission', 'monthly', 'annualFund'] as const).map(field => (
                    <td key={field} className="px-2 py-2">
                      <input type="number" min={0} value={row[field]} className={inputCls}
                        onFocus={e => e.currentTarget.select()}
                        onChange={e => updateDraft('streams', i, field, e.target.value)} />
                    </td>
                  ))}
                  <td className="px-3 py-2.5 font-bold text-green-700 whitespace-nowrap">{rupee(yearTotal(row))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}