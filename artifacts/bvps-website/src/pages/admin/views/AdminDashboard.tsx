import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Newspaper, IndianRupee, Mail, UserRound, Star, TrendingUp, Loader2 } from 'lucide-react';
import { apiGetAdmin } from '@/lib/api';
import type { BlogPost } from '../types';
import { formatDate } from '../types';

interface Stats { blog: number; contact: number; admissions: number; feedback: number; }

function useAdminCounts(token: string, onExpired: () => void): Stats & { latest: BlogPost[]; loading: boolean } {
  const [stats, setStats] = useState<Stats>({ blog: 0, contact: 0, admissions: 0, feedback: 0 });
  const [latest, setLatest] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const fetchCounts = async () => {
      try {
        const [blogRes, contactRes, admissionRes, feedRes] = await Promise.all([
          apiGetAdmin<{ success: boolean; data: BlogPost[] }>('/blog/admin', token),
          apiGetAdmin<{ success: boolean; data: unknown[] }>('/admin/contact', token),
          apiGetAdmin<{ success: boolean; data: unknown[] }>('/admin/admissions', token),
          apiGetAdmin<{ success: boolean; data: unknown[] }>('/admin/feedback', token),
        ]);
        if (!active) return;
        setStats({
          blog: blogRes?.data?.length ?? 0,
          contact: contactRes?.data?.length ?? 0,
          admissions: admissionRes?.data?.length ?? 0,
          feedback: feedRes?.data?.length ?? 0,
        });
        setLatest((blogRes?.data ?? []).slice(0, 3));
      } catch (err: any) {
        const msg = String(err?.error ?? '').toLowerCase();
        if (msg.includes('forbidden') || msg.includes('invalid')) onExpired();
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchCounts();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return { ...stats, latest, loading };
}

export function AdminDashboard({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [, navigate] = useLocation();
  const { blog, contact, admissions, feedback, latest, loading } = useAdminCounts(token, onExpired);

  const cards = [
    { label: 'Blog Posts', value: blog, icon: Newspaper, color: 'bg-blue-600', view: '/admin/blog' },
    { label: 'Admission Enquiries', value: admissions, icon: UserRound, color: 'bg-emerald-600', view: '/admin/messages' },
    { label: 'Contact Messages', value: contact, icon: Mail, color: 'bg-amber-500', view: '/admin/messages' },
    { label: 'Feedback Submissions', value: feedback, icon: Star, color: 'bg-violet-600', view: '/admin/messages' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-serif font-bold text-black">Welcome back 👋</h2>
        <p className="text-sm text-muted-foreground">Website ki sabhi cheezein yahan se manage karein.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading data…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map(card => {
              const Icon = card.icon;
              return (
                <button
                  key={card.label}
                  onClick={() => navigate(card.view)}
                  className="bg-white rounded-2xl border border-border shadow-sm p-5 text-left hover:shadow-md transition-shadow"
                >
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${card.color} text-white mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-3xl font-serif font-bold text-black">{card.value}</p>
                  <p className="text-xs font-semibold text-muted-foreground mt-1">{card.label}</p>
                  <p className="text-[11px] text-primary font-semibold mt-2 flex items-center gap-1">
                    Manage <TrendingUp className="w-3 h-3" />
                  </p>
                </button>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-black">Recent Blog Posts</h3>
                <button onClick={() => navigate('/admin/blog')} className="text-xs font-semibold text-primary hover:underline">
                  View all
                </button>
              </div>
              {latest.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Abhi koi post nahi. <button onClick={() => navigate('/admin/blog/new')} className="text-primary font-semibold hover:underline">Pehli post banao →</button>
                </p>
              ) : (
                <ul className="space-y-3">
                  {latest.map(post => (
                    <li key={post.id} className="flex items-center justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <p className="font-semibold text-black truncate">{post.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {post.category} · {formatDate(post.publishedAt)}
                        </p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {post.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-gradient-to-br from-primary to-[#18315e] text-white rounded-2xl p-6">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-secondary text-primary mb-3">
                <IndianRupee className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg font-serif">Fee Structure</h3>
              <p className="text-primary-foreground/80 text-sm mt-1 mb-4">
                Class 1 se 12 tak ke admission, monthly aur annual fund fees yahan se badlein.
              </p>
              <button
                onClick={() => navigate('/admin/fees')}
                className="bg-secondary text-primary font-bold rounded-xl px-5 py-2.5 text-sm hover:bg-secondary/90 transition-colors"
              >
                Edit Fees
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}