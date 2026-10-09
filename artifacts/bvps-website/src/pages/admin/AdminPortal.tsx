import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import {
  LayoutDashboard, Newspaper, IndianRupee, MessageSquare, LogOut, ExternalLink,
  GraduationCap, Mail, Globe2, Images,
} from 'lucide-react';
import { apiGetAdmin } from '@/lib/api';
import { getAdminToken, getAdminEmail, clearAdminSession } from '@/lib/admin-store';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './views/AdminDashboard';
import { AdminBlog } from './views/AdminBlog';
import { AdminBlogEditor } from './views/AdminBlogEditor';
import { AdminFees } from './views/AdminFees';
import { AdminMessages } from './views/AdminMessages';
import { AdminSite } from './views/AdminSite';
import { AdminImages } from './views/AdminImages';

type View = 'dashboard' | 'site' | 'images' | 'blog' | 'blog-new' | 'blog-edit' | 'fees' | 'messages';

const NAV_ITEMS: { view: View; label: string; icon: typeof LayoutDashboard; path: string }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { view: 'site', label: 'Website', icon: Globe2, path: '/admin/site' },
  { view: 'images', label: 'Photos', icon: Images, path: '/admin/images' },
  { view: 'blog', label: 'Blog', icon: Newspaper, path: '/admin/blog' },
  { view: 'fees', label: 'Fee Structure', icon: IndianRupee, path: '/admin/fees' },
  { view: 'messages', label: 'Messages', icon: MessageSquare, path: '/admin/messages' },
];

function parseView(pathname: string): View {
  const path = pathname.replace(/^\/admin/, '') || '/';
  if (path === '/' || path === '') return 'dashboard';
  if (path === '/site') return 'site';
  if (path === '/images') return 'images';
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

  // Pehle ye <Helmet> sirf authenticated branch ke andar tha (line ke baad
  // `if (!token) return <AdminLogin/>`). Matlab crawler sirf wahi state reach
  // kar sakta tha — jahan `robots: index, follow` aur homepage ka title
  // inherit hota tha. Ab noindex early return se pehle hi apply ho jaata hai.
  const noindexHelmet = (
    <Helmet>
      <title>Admin — BVPS</title>
      <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
      <meta name="googlebot" content="noindex, nofollow, noarchive" />
    </Helmet>
  );

  if (!token) {
    if (checking) {
      return (
        <div className="min-h-[100dvh] bg-slate-950 flex items-center justify-center text-white text-sm">
          {noindexHelmet}
          Checking session…
        </div>
      );
    }
    return (
      <>
        {noindexHelmet}
        <AdminLogin
          onSuccess={() => { setToken(getAdminToken()); setEmail(getAdminEmail()); setSessionError(''); }}
          initialError={sessionError || undefined}
        />
      </>
    );
  }

  const view = parseView(location);

  // View ko active nav item tak map karo (blog-new/blog-edit → blog active)
  const activeNav: View = view === 'blog-new' || view === 'blog-edit' ? 'blog' : view;

  return (
    <div className="min-h-[100dvh] bg-slate-100 flex flex-col lg:flex-row">
      {noindexHelmet}
      {/* ── Sidebar (mobile par upar ke scrollable menu ki tarah) ── */}
      <aside className="w-full lg:w-64 shrink-0 bg-slate-900 text-white flex flex-col lg:min-h-[100dvh]">
        <div className="px-4 lg:px-5 py-3 lg:py-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-secondary text-primary flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-serif font-bold leading-tight truncate text-sm lg:text-base">BVPS Admin</p>
            <p className="text-[11px] text-slate-400 truncate hidden sm:block">Bal Vikas Public School</p>
          </div>
          {/* Mobile par sidebar me hi Logout — header wala button chhota screens par jagah bana sakta hai */}
          <button
            onClick={logout}
            className="lg:hidden shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-300 border border-red-400/40 rounded-full px-2.5 py-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>

        <nav className="flex lg:flex-col gap-1.5 lg:gap-1 p-2.5 lg:p-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeNav === item.view;
            return (
              <button
                key={item.view}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2.5 lg:gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  isActive ? 'bg-primary text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-secondary' : ''}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-3 border-t border-white/10 hidden lg:flex flex-col gap-2">
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
        <header className="bg-white border-b border-border px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-serif font-bold text-black truncate text-lg sm:text-xl">
              {NAV_ITEMS.find(i => i.view === activeNav)?.label ?? 'Dashboard'}
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <Mail className="w-3 h-3 shrink-0" /> <span className="truncate">{email || 'admin'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/20 rounded-full px-3 py-1.5 lg:hidden"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Site
            </a>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-5 overflow-x-auto">
          {view === 'dashboard' && <AdminDashboard token={token} onExpired={onExpired} />}
          {view === 'site' && <AdminSite token={token} onExpired={onExpired} />}
          {view === 'images' && <AdminImages token={token} onExpired={onExpired} />}
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