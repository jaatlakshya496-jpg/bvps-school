import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ImagePlus, Loader2, Newspaper, Save, Trash2 } from 'lucide-react';
import { apiGetAdmin, apiSend, extractApiError } from '@/lib/api';
import { compressImageFile, readFileAsDataUrl } from '@/lib/image-utils';
import type { BlogPost } from '../types';
import { slugify } from '../types';

const inputCls =
  'w-full border-2 border-primary/30 focus:border-primary rounded-xl px-4 py-3 text-sm text-black bg-white outline-none';

export function AdminBlogEditor({
  token, postId, onDone, onCancel, onExpired,
}: { token: string; postId: number; onDone: () => void; onCancel: () => void; onExpired?: () => void }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('General');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [author, setAuthor] = useState('BVPS');
  const [coverImage, setCoverImage] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [loading, setLoading] = useState(postId > 0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImagePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Sirf image file (jpg, png, webp) chuniye.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      setCoverImage(await compressImageFile(file));
    } catch (err: any) {
      setError(err?.message ?? 'Image upload nahi ho payi.');
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    if (postId <= 0) return;
    let active = true;
    apiGetAdmin<{ success: boolean; data: BlogPost[] }>('/blog/admin', token)
      .then(res => {
        if (!active) return;
        const post = (res?.data ?? []).find(p => p.id === postId);
        if (!post) { setError('Post nahi mila.'); return; }
        setTitle(post.title);
        setSlug(post.slug);
        setCategory(post.category);
        setStatus(post.status);
        setAuthor(post.author);
        setCoverImage(post.coverImage ?? '');
        setExcerpt(post.excerpt ?? '');
        setContent(post.content ?? '');
        setPublishedDate(post.publishedAt ? post.publishedAt.slice(0, 10) : '');
      })
      .catch((err: any) => {
        if (active) {
          const m = String(err?.error ?? '').toLowerCase();
          if (m.includes('forbidden') || m.includes('invalid')) onExpired?.();
          else setError(extractApiError(err));
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [postId, token]);

  async function handleSave() {
    if (!title.trim()) { setError('Title daalein.'); return; }
    const finalSlug = slug.trim() || slugify(title);
    if (!finalSlug) { setError('Slug invalid hai. Sirf a-z, 0-9 aur hyphens.'); return; }
    if (!content.trim()) { setError('Content likhein (post ki body).'); return; }

    setSaving(true);
    setError('');

    const body = {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverImage: coverImage.trim(),
      category: category.trim() || 'General',
      status,
      author: author.trim() || 'BVPS',
      ...(publishedDate ? { publishedAt: publishedDate } : {}),
    };

    try {
      if (postId > 0) {
        await apiSend<{ success: boolean }>('PUT', `/blog/admin/${postId}`, body, token);
      } else {
        await apiSend<{ success: boolean }>('POST', '/blog/admin', body, token);
      }
      onDone();
    } catch (err: any) {
      const m = String(err?.error ?? '').toLowerCase();
      if (m.includes('forbidden') || m.includes('invalid')) onExpired?.();
      else setError(extractApiError(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading post…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button onClick={onCancel} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-xl font-serif font-bold text-black">{postId > 0 ? 'Edit Post' : 'New Post'}</h2>
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Newspaper className="w-5 h-5" />
          </div>
          <p className="text-sm text-muted-foreground">Public website par <span className="font-semibold text-black">/blog</span> page par published posts dikhte hain.</p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Title *</label>
          <input className={inputCls} value={title} onChange={e => {
            setTitle(e.target.value);
            if (!slugTouched && !slug) setSlug(slugify(e.target.value));
          }} placeholder="Post ka title, e.g. School Annual Function 2026" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Slug *</label>
            <input
              className={inputCls}
              value={slug}
              onChange={e => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
              placeholder="annual-function-2026"
            />
            <p className="text-[11px] text-muted-foreground mt-1">URL: /blog/{slug || '…'}</p>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Category</label>
            <input className={inputCls} value={category} onChange={e => setCategory(e.target.value)} placeholder="News, Events, Results…" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Status</label>
            <select className={inputCls} value={status} onChange={e => setStatus(e.target.value as 'published' | 'draft')}>
              <option value="published">Published (website par visible)</option>
              <option value="draft">Draft (hidden)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Author</label>
            <input className={inputCls} value={author} onChange={e => setAuthor(e.target.value)} placeholder="BVPS / Principal" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Published Date</label>
            <input type="date" className={inputCls} value={publishedDate} onChange={e => setPublishedDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Cover Image</label>
            <div className="flex items-center gap-2">
              <input
                className={inputCls}
                value={coverImage}
                onChange={e => setCoverImage(e.target.value)}
                placeholder="https://… image link"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="shrink-0 inline-flex items-center gap-1.5 h-[46px] px-3 rounded-xl border-2 border-primary/30 text-primary text-xs font-bold hover:bg-primary/5 disabled:opacity-60 transition-colors"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                {uploading ? '…' : 'Upload'}
              </button>
              {coverImage && (
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className="shrink-0 inline-flex items-center justify-center w-[46px] h-[46px] rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Remove cover image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImagePick}
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Mobile se photo khud choose karein (ya link paste karein). Image chhoti karke save hoti hai.
            </p>
            {coverImage && (
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="h-16 w-24 rounded-lg object-cover border border-border"
                />
                <p className="text-[11px] text-muted-foreground">
                  {coverImage.startsWith('data:') ? 'Uploaded photo' : 'Linked photo'} · preview
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Excerpt (short summary)</label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={2}
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="Ek chhota sa summary (list par dikhta hai)"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Content *</label>
          <textarea
            className={`${inputCls} resize-y`}
            rows={12}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Post ka pura content. Alag paragraphs ke liye ek blank line chhoren (enter × 2)."
          />
          <p className="text-[11px] text-muted-foreground mt-1">Ek khali line se naya paragraph banega.</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pb-6">
        <button onClick={onCancel} className="text-sm font-semibold text-muted-foreground hover:text-black px-4 py-2.5">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary text-white font-bold rounded-xl px-6 h-11 text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : postId > 0 ? 'Update Post' : 'Publish Post'}
        </button>
      </div>
    </div>
  );
}