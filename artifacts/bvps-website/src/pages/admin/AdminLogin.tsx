import { useState } from 'react';
import { Link } from 'wouter';
import { GraduationCap, Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { apiLogin } from '@/lib/api';
import { setAdminSession } from '@/lib/admin-store';

export function AdminLogin({ onSuccess, initialError }: { onSuccess: () => void; initialError?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialError ?? '');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setError('Email aur password dono daalein.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiLogin(email.trim(), password);
      if (res.success && res.data?.token) {
        setAdminSession(res.data.token, res.data.email);
        onSuccess();
      } else {
        setError(res.error ?? 'Login failed. Email/password check karein.');
      }
    } catch {
      setError('Server se connect nahi ho paya. Internet/server check karein.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-secondary/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          <div className="bg-primary px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary text-primary mb-4">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white">BVPS Admin Portal</h1>
            <p className="text-primary-foreground/70 text-xs mt-1">Bal Vikas Public School, Kalayat</p>
          </div>

          <div className="p-8 space-y-5">
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Email / Gmail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                  placeholder="admin email id"
                  className="w-full border-2 border-primary/30 focus:border-primary rounded-xl pl-10 pr-4 py-3 text-sm text-black bg-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                  placeholder="••••••••"
                  className="w-full border-2 border-primary/30 focus:border-primary rounded-xl pl-10 pr-4 py-3 text-sm text-black bg-white outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-xl h-12 text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {loading ? 'Logging in…' : 'Login to Admin Portal'}
            </button>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Sirf school admin ke liye. Correct Gmail aur password daalein.
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to School Website
            </Link>
          </div>
        </div>

        <p className="text-center text-slate-500 text-[11px] mt-4">
          Secure admin access · © {new Date().getFullYear()} BVPS
        </p>
      </div>
    </div>
  );
}