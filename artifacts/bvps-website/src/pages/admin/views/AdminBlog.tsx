import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Plus, Pencil, Trash2, Eye, Loader2, Newspaper } from 'lucide-react';
import { apiGetAdmin, apiSend, extractApiError } from '@/lib/api';
import type { BlogPost } from '../types';
import { formatDate } from '../types';

export function AdminBlog({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [, navigate] = useLocation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    setError('');
    apiGetAdmin<{ success: boolean; data: BlogPost[] }>('/blog/admin', token)
      .then(res => setPosts(res?.data ?? []))
      .catch((err: any) => {
        const msg = String(err?.error ?? '').toLowerCase();
        if (msg.includes('forbidden') || msg.includes('invalid')) onExpired();
        else setError(extractApiError(err));
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  async function handleDelete(post: BlogPost) {
    if (!window.confirm(`Delete "${post.title}"? Ye hamesha ke liye remove ho jayega.`)) return;
    setDeletingId(post.id);
    try {
      await apiSend<{ success: boolean }>('DELETE', `/blog/admin/${post.id}`, null, token);
      setPosts(prev => prev.filter(p => p.id !== post.id));
    } catch (err: any) {
      const msg = String(err?.error ?? '').toLowerCase();
      if (msg.includes('forbidden') || msg.includes('invalid')) onExpired();
      else window.alert(extractApiError(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-serif font-bold text-black">Blog Posts</h2>
          <p className="text-sm text-muted-foreground">Naye posts banao, purane edit ya delete karo.</p>
        </div>
        <button
          onClick={() => navigate('/admin/blog/new')}
          className="inline-flex items-center gap-2 bg-primary text-white font-bold rounded-xl px-5 h-11 text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading posts…
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
            <Newspaper className="w-7 h-7" />
          </div>
          <p className="font-bold text-black">Abhi koi blog post nahi hai</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5">Pehli post banakar website par dikhana shuru karein.</p>
          <button
            onClick={() => navigate('/admin/blog/new')}
            className="inline-flex items-center gap-2 bg-primary text-white font-bold rounded-xl px-5 h-11 text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create First Post
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left px-5 py-3 font-bold text-black">Title</th>
                <th className="text-left px-4 py-3 font-bold text-black">Status</th>
                <th className="text-left px-4 py-3 font-bold text-black">Category</th>
                <th className="text-left px-4 py-3 font-bold text-black">Updated</th>
                <th className="text-right px-5 py-3 font-bold text-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-muted/20">
                  <td className="px-5 py-3.5 max-w-[320px]">
                    <p className="font-semibold text-black truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{post.category}</td>
                  <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{formatDate(post.updatedAt)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {post.status === 'published' && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                          title="View on website"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => navigate(`/admin/blog/${post.id}/edit`)}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post)}
                        disabled={deletingId === post.id}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        {deletingId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}