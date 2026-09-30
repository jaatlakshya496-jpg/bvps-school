import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  LayoutDashboard, Newspaper, IndianRupee, MessageSquare, LogOut, ExternalLink,
  GraduationCap, Mail,
} from 'lucide-react';
import { apiGetAdmin } from '@/lib/api';
import { getAdminToken, getAdminEmail, clearAdminSession } from '@/lib/admin-store';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './views/AdminDashboard';
import { AdminBlog } from './views/AdminBlog';
import { AdminBlogEditor } from './views/AdminBlogEditor';
import { AdminFees } from './views/AdminFees';
import { AdminMessages } from './views/AdminMessages';

type View = 'dashboard' | 'blog' | 'blog-new' | 'blog-edit' | 'fees' | 'messages';

const NAV_ITEMS: { view: View; label: string; icon: typeof LayoutDashboard; path: string }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { view: 'blog', label: 'Blog', icon: Newspaper, path: '/admin/blog' },
  { view: 'fees', label: 'Fee Structure', icon: IndianRupee, path: '/admin/fees' },
  { view: 'messages', label: 'Messages', icon: MessageSquare, path: '/admin/messages' },
];

function parseView(pathname: string): View {
  const path = pathname.replace(/^\/admin/, '') || '/';
  if (path === '/' || path === '') return 'dashboard';
  if (path === '/blog') return 'blog';
  if (path === '/blog/new') return 'blog-new';
  if (/^\/blog\/\d+\/edit$/.test(path)) return 'blog-edit';
  if (path === '/fees') return 'fees';
  if (path === '/messages') return 'messages';
  return 'dashboard';
}

export default function AdminPortal() {
  const [location, navigate] = useLocation();
  const [token, setToken] = useState<string>(() => getAdminToken());
  const [email, setEmail] = useState<string>(() => getAdminEmail());
  const [checking, setChecking] = useState<boolean>(() => Boolean(getAdminToken()));
  const [sessionError, setSessionError] = useState('');

  // Token se ek baar session verify karo — taaki invalid/expired token par
  // dobara email+password na maange jaaye nahi, balki login screen dikhe.
  useEffect(() => {
    if (!token) return;
    let active = true;
    setChecking(true);
    apiGetAdmin<{ success: boolean; data?: { email?: string } }>('/admin/status', token)
      .then(res => {
        if (!active) return;
        if (res?.success) {
          setEmail(res.data?.email ?? getAdminEmail());
        } else {
          clearAdminSession();
          setToken('');
        }
      })
      .catch((err: any) => {
        if (!active) return;
        const msg = String(err?.error ?? '').toLowerCase();
        if (msg.includes('forbidden') || msg.includes('not configured') || msg.includes('invalid')) {
          clearAdminSession();
          setToken('');
          setSessionError(msg.includes('forbidden')
            ? 'Session expire ho gaya. Dobara login karein.'
            : msg.includes('not configured')
            ? 'Server par admin set nahi hai (ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_SECRET).'
            : '');
        } else {
          // network failure — token ko preserve rakhte hain; views retry karenge
        }
      })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function logout() {
    clearAdminSession();
    setToken('');
    setEmail('');
    setSessionError('');
    navigate('/admin');
  }

  const onExpired = logout;

  if (!token) {
    if (checking) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm">
          Checking session…
        </div>
      );
    }
    return (
      <AdminLogin
        onSuccess={() => { setToken(getAdminToken()); setEmail(getAdminEmail()); setSessionError(''); }}
        initialError={sessionError || undefined}
      />
    );
  }

  const view = parseView(location);

  // View ko active nav item tak map karo (blog-new/blog-edit → blog active)
  const activeNav: View = view === 'blog-new' || view === 'blog-edit' ? 'blog' : view;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* ── Sidebar ── */}
      <aside className="w-full lg:w-64 shrink-0 bg-slate-900 text-white flex flex-col">
        <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="font-serif font-bold leading-tight truncate">BVPS Admin</p>
            <p className="text-[11px] text-slate-400 truncate">Bal Vikas Public School</p>
          </div>
        </div>

        <nav className="flex lg:flex-col gap-1 p-3 overflow-x-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeNav === item.view;
            return (
              <button
                key={item.view}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-secondary' : ''}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-3 border-t border-white/10 flex flex-col gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> View Website
          </a>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-border px-5 py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-serif font-bold text-black truncate">
              {NAV_ITEMS.find(i => i.view === activeNav)?.label ?? 'Dashboard'}
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <Mail className="w-3 h-3" /> {email || 'admin'}
            </p>
          </div>
          <button
            onClick={logout}
            className="lg:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-full px-3 py-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </header>

        <main className="flex-1 p-5 overflow-x-auto">
          {view === 'dashboard' && <AdminDashboard token={token} onExpired={onExpired} />}
          {view === 'blog' && <AdminBlog token={token} onExpired={onExpired} />}
          {(view === 'blog-new' || view === 'blog-edit') && (
            <AdminBlogEditor
              token={token}
              postId={view === 'blog-edit' ? Number(location.match(/\/blog\/(\d+)\/edit/)?.[1] ?? 0) : 0}
              onDone={() => navigate('/admin/blog')}
              onCancel={() => navigate('/admin/blog')}
              onExpired={onExpired}
            />
          )}
          {view === 'fees' && <AdminFees token={token} onExpired={onExpired} />}
          {view === 'messages' && <AdminMessages token={token} onExpired={onExpired} />}
        </main>
      </div>
    </div>
  );
}