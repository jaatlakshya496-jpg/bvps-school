import { useEffect, useState } from 'react';
import { Mail, UserRound, Star, Trash2, Loader2, Inbox } from 'lucide-react';
import { apiGetAdmin, apiSend, extractApiError } from '@/lib/api';
import type { ContactRow, AdmissionRow, FeedbackRow } from '../types';
import { formatDate } from '../types';

type Tab = 'contact' | 'admissions' | 'feedback';

const TABS: { key: Tab; label: string; icon: typeof Mail }[] = [
  { key: 'contact', label: 'Contact Messages', icon: Mail },
  { key: 'admissions', label: 'Admission Enquiries', icon: UserRound },
  { key: 'feedback', label: 'Feedback', icon: Star },
];

export function AdminMessages({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [tab, setTab] = useState<Tab>('contact');
  const [contact, setContact] = useState<ContactRow[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionRow[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const paths: Record<Tab, string> = {
      contact: '/admin/contact',
      admissions: '/admin/admissions',
      feedback: '/admin/feedback',
    };
    apiGetAdmin<{ success: boolean; data: ContactRow[] | AdmissionRow[] | FeedbackRow[] }>(paths[tab], token)
      .then(res => {
        if (!active) return;
        const data = res?.data ?? [];
        if (tab === 'contact') setContact(data as ContactRow[]);
        else if (tab === 'admissions') setAdmissions(data as AdmissionRow[]);
        else setFeedback(data as FeedbackRow[]);
      })
      .catch((err: any) => {
        if (!active) return;
        const m = String(err?.error ?? '').toLowerCase();
        if (m.includes('forbidden') || m.includes('invalid')) onExpired();
        else setError(extractApiError(err));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, token]);

  async function handleDelete(kind: Tab, id: number) {
    setDeleting(id);
    try {
      await apiSend<{ success: boolean }>('DELETE', `/admin/${kind}/${id}`, null, token);
      if (kind === 'contact') setContact(prev => prev.filter(r => r.id !== id));
      else if (kind === 'admissions') setAdmissions(prev => prev.filter(r => r.id !== id));
      else setFeedback(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      const m = String(err?.error ?? '').toLowerCase();
      if (m.includes('forbidden') || m.includes('invalid')) onExpired();
      else window.alert(extractApiError(err));
    } finally {
      setDeleting(null);
    }
  }

  const stats = {
    contact: contact.length,
    admissions: admissions.length,
    feedback: feedback.length,
  };

  const renderEmpty = () => (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-10 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
        <Inbox className="w-7 h-7" />
      </div>
      <p className="font-bold text-black">Abhi koi message nahi</p>
      <p className="text-sm text-muted-foreground mt-1">Naye messages aate hi yahan dikhenge.</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-serif font-bold text-black">Messages & Submissions</h2>
        <p className="text-sm text-muted-foreground">Website se aayi saari entries yahan dekhein.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                active ? 'bg-primary text-white' : 'bg-white text-muted-foreground border border-border hover:bg-muted/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-secondary' : ''}`} />
              {t.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                active ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
              }`}>
                {stats[t.key] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading…
        </div>
      ) : tab === 'contact' ? (
        contact.length === 0 ? renderEmpty() : (
          <div className="space-y-3">
            {contact.map(row => (
              <div key={row.id} className="bg-white rounded-2xl border border-border shadow-sm p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-black">{row.name} <span className="text-xs font-normal text-muted-foreground">· {formatDate(row.createdAt)}</span></p>
                    <p className="text-xs text-muted-foreground">{row.email} · {row.phone}</p>
                    <p className="text-sm font-semibold text-primary mt-2">{row.subject}</p>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{row.message}</p>
                  </div>
                  <button
                    onClick={() => { if (window.confirm('Yeh message delete karein?')) handleDelete('contact', row.id); }}
                    disabled={deleting === row.id}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 shrink-0"
                    title="Delete"
                  >
                    {deleting === row.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === 'admissions' ? (
        admissions.length === 0 ? renderEmpty() : (
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  <th className="text-left px-5 py-3 font-bold text-black">Student</th>
                  <th className="text-left px-4 py-3 font-bold text-black">Class</th>
                  <th className="text-left px-4 py-3 font-bold text-black">Parent</th>
                  <th className="text-left px-4 py-3 font-bold text-black">Phone</th>
                  <th className="text-left px-4 py-3 font-bold text-black">Date</th>
                  <th className="text-right px-5 py-3 font-bold text-black">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {admissions.map(row => (
                  <tr key={row.id}>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-black">{row.studentName}</p>
                      <p className="text-xs text-muted-foreground">{row.gender}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{row.classApplying}</span>
                      {row.stream && <p className="text-xs text-muted-foreground mt-1">{row.stream}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.parentName}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{row.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(row.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => { if (window.confirm(`Enquiry (${row.studentName}) delete karein?`)) handleDelete('admissions', row.id); }}
                        disabled={deleting === row.id}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        {deleting === row.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        feedback.length === 0 ? renderEmpty() : (
          <div className="space-y-3">
            {feedback.map(row => (
              <div key={row.id} className="bg-white rounded-2xl border border-border shadow-sm p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-black">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.email} · {row.role || 'N/A'}</p>
                    <div className="flex items-center gap-0.5 mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < (row.rating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                      ))}
                      <span className="text-[11px] text-muted-foreground ml-1.5">· {formatDate(row.createdAt)}</span>
                    </div>
                    {row.category && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary mt-2 inline-block">{row.category}</span>}
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{row.message}</p>
                  </div>
                  <button
                    onClick={() => { if (window.confirm('Yeh feedback delete karein?')) handleDelete('feedback', row.id); }}
                    disabled={deleting === row.id}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 shrink-0"
                    title="Delete"
                  >
                    {deleting === row.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}