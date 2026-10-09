import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Save, Loader2, Images, EyeOff, Eye, Upload, RotateCcw, Trash2, Plus, Check, ImagePlus,
} from 'lucide-react';
import { apiGet, apiSend, extractApiError } from '@/lib/api';
import { compressImageFile } from '@/lib/image-utils';
import { baseGalleryImages, type GalleryItem } from '@/lib/gallery-data';
import { baseHeroSlides } from '@/lib/hero-data';
import {
  IMAGE_KEYS,
  type GalleryAdminConfig,
  type HomeHeroAdminConfig,
} from '@/lib/site-images';

/**
 * Photos editor — website ki saari pictures yahan se badalti hain:
 *
 * - **Home hero slider** — har slide ki photo replace/hide.
 * - **Gallery** — base photos ki photo/caption/category badalna, hide karna,
 *   aur nayi photo add karna.
 * - **Gallery hero** — gallery page ki badi featured photo.
 *
 * Sab `site_content` table ki `image.*` keys me save hota hai (alag bada
 * limit, kyunki values base64 data URLs hoti hain). Normal `GET /api/content`
 * me ye keys nahi aati (har page load par MBs download na ho) — public pages
 * `GET /api/content/images` se lazy load karti hain.
 *
 * `hidden`/`overrides` ke indices hamesha **base list** ke hain, isliye save
 * hone ke baad bhi admin ka UI aur public page ek hi numbering dekhte hain.
 */

type Target =
  | { kind: 'hero'; index: number }
  | { kind: 'gallery'; index: number }
  | { kind: 'added'; index: number }
  | { kind: 'galleryHero' };

const GALLERY_CATEGORIES = ['Campus', 'Students', 'Staff & Faculty', 'Events & Achievements'];

// Server par stored value (save ke baad isse compare karke dirty detect hota hai)
type ServerState = {
  hero: HomeHeroAdminConfig;
  gallery: GalleryAdminConfig;
  galleryHero?: string;
};

const emptyServer: ServerState = { hero: {}, gallery: {} };

function parseImageMap(raw: Record<string, unknown>): ServerState {
  const parse = <T,>(v: unknown, fb: T): T => {
    if (v && typeof v === 'object') return v as T;
    if (typeof v === 'string') {
      try {
        const p = JSON.parse(v);
        if (p && typeof p === 'object') return p as T;
      } catch { /* corrupt — default */ }
    }
    return fb;
  };
  return {
    hero: parse<HomeHeroAdminConfig>(raw[IMAGE_KEYS.homeHero], {}),
    gallery: parse<GalleryAdminConfig>(raw[IMAGE_KEYS.gallery], {}),
    galleryHero: typeof raw[IMAGE_KEYS.galleryHero] === 'string'
      ? (raw[IMAGE_KEYS.galleryHero] as string)
      : undefined,
  };
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function toggleIndex(list: number[] | undefined, index: number): number[] {
  const arr = list ?? [];
  return arr.includes(index) ? arr.filter(i => i !== index) : [...arr, index];
}

function setOverride(
  cfg: GalleryAdminConfig,
  index: number,
  patch: Partial<GalleryItem>,
): GalleryAdminConfig {
  const overrides = { ...(cfg.overrides ?? {}) };
  const key = String(index);
  const next = { ...(overrides[key] ?? {}), ...patch };
  // Base value ke barabar ho toh override hata do (sirf zaroori fields rakho)
  const base = baseGalleryImages[index];
  const cleaned: Partial<GalleryItem> = {};
  const src = next.src ?? base?.src;
  const caption = next.caption ?? base?.caption;
  const category = next.category ?? base?.category;
  if (src !== base?.src) cleaned.src = src;
  if (caption !== base?.caption) cleaned.caption = caption;
  if (category !== base?.category) cleaned.category = category;
  if (Object.keys(cleaned).length) overrides[key] = cleaned;
  else delete overrides[key];
  return { ...cfg, overrides };
}

function HeroCard({
  index, src, label, tag, hidden, replaced,
  onReplace, onToggle,
}: {
  index: number; src: string; label: string; tag: string;
  hidden: boolean; replaced: boolean;
  onReplace: () => void; onToggle: () => void;
}) {
  return (
    <div className={`rounded-2xl border overflow-hidden bg-white ${hidden ? 'border-border opacity-60' : replaced ? 'border-amber-400' : 'border-border'}`}>
      <div className="relative aspect-[16/10] bg-slate-100">
        <img src={src} alt={label} className="w-full h-full object-cover" loading="lazy" />
        {hidden && (
          <span className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
            Hidden
          </span>
        )}
        <span className="absolute top-2 left-2 bg-black/65 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          Slide {index + 1}
        </span>
        {replaced && (
          <span className="absolute top-2 right-2 bg-amber-400 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
            Replaced
          </span>
        )}
      </div>
      <div className="p-3 space-y-2">
        <p className="text-xs font-semibold text-black leading-snug line-clamp-2">{label}</p>
        <p className="text-[11px] text-muted-foreground">{tag}</p>
        <div className="flex gap-2">
          <button
            onClick={onReplace}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-primary border border-primary/25 rounded-lg py-2 hover:bg-primary/5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Replace
          </button>
          <button
            onClick={onToggle}
            className={`inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-2 border transition-colors ${
              hidden
                ? 'text-green-700 border-green-300 bg-green-50 hover:bg-green-100'
                : 'text-slate-600 border-border hover:bg-muted'
            }`}
            title={hidden ? 'Slide wapas dikhao' : 'Slide hide karo'}
          >
            {hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminImages({ token, onExpired }: { token: string; onExpired: () => void }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyIndex, setBusyIndex] = useState<string | null>(null);
  const [open, setOpen] = useState<string>('hero');
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [server, setServer] = useState<ServerState>(emptyServer);
  const [hero, setHero] = useState<HomeHeroAdminConfig>({});
  const [gallery, setGallery] = useState<GalleryAdminConfig>({});
  const [galleryHero, setGalleryHero] = useState<string | undefined>(undefined);

  // File input ek hi hidden hai — target batata hai photo kis cheez me jaani hai
  const fileRef = useRef<HTMLInputElement>(null);
  const targetRef = useRef<Target | null>(null);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    try {
      const res = await apiGet<{ success?: boolean; data?: Record<string, unknown> }>('/content/images');
      const next = parseImageMap(res?.data ?? {});
      setServer(next);
      setHero(clone(next.hero));
      setGallery(clone(next.gallery));
      setGalleryHero(next.galleryHero);
    } catch (err) {
      setMsg({ text: extractApiError(err), ok: false });
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const dirty = useMemo(() => {
    const heroDirty = JSON.stringify(hero) !== JSON.stringify(server.hero);
    const galleryDirty = JSON.stringify(gallery) !== JSON.stringify(server.gallery);
    const heroImageDirty = (galleryHero ?? '') !== (server.galleryHero ?? '');
    return { heroDirty, galleryDirty, heroImageDirty, any: heroDirty || galleryDirty || heroImageDirty };
  }, [hero, gallery, galleryHero, server]);

  // Approx payload size — server 16MB tak allow karta hai, usse pehle rok do
  const payloadChars = useMemo(
    () =>
      JSON.stringify({ [IMAGE_KEYS.homeHero]: hero, [IMAGE_KEYS.gallery]: gallery }).length +
      (galleryHero?.length ?? 0),
    [hero, gallery, galleryHero],
  );
  const payloadTooBig = payloadChars > 15_000_000;

  function handleError(err: unknown) {
    const m = String((err as { error?: unknown })?.error ?? '').toLowerCase();
    if (m.includes('forbidden') || m.includes('invalid')) onExpired();
    else setMsg({ text: extractApiError(err), ok: false });
  }

  function pickPhoto(target: Target) {
    targetRef.current = target;
    fileRef.current?.click();
  }

  async function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // dobara same file chuni ja sake
    const target = targetRef.current;
    targetRef.current = null;
    if (!file || !target) return;
    const key = `${target.kind}:${'index' in target ? target.index : 'hero'}`;
    setBusyIndex(key);
    setMsg(null);
    try {
      const dataUrl = await compressImageFile(file);
      if (target.kind === 'hero') {
        setHero(h => ({ ...h, images: { ...(h.images ?? {}), [String(target.index)]: dataUrl } }));
      } else if (target.kind === 'gallery') {
        setGallery(g => setOverride(g, target.index, { src: dataUrl }));
      } else if (target.kind === 'added') {
        setGallery(g => {
          const added = [...(g.added ?? [])];
          if (added[target.index]) added[target.index] = { ...added[target.index], src: dataUrl };
          return { ...g, added };
        });
      } else {
        setGalleryHero(dataUrl);
      }
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : extractApiError(err), ok: false });
    } finally {
      setBusyIndex(null);
    }
  }

  async function save() {
    if (!dirty.any) {
      setMsg({ text: 'Kuch badla hi nahi hai.', ok: false });
      return;
    }
    if (payloadTooBig) {
      setMsg({ text: 'Photos ka total size bahut zyada hai — kuch replaced/added photos hatao.', ok: false });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const items: Record<string, unknown> = {};
      if (dirty.heroDirty) items[IMAGE_KEYS.homeHero] = hero;
      if (dirty.galleryDirty) items[IMAGE_KEYS.gallery] = gallery;
      await apiSend('PUT', '/content', { items }, token);
      if (dirty.heroImageDirty) {
        if (galleryHero) {
          await apiSend('PUT', '/content', { items: { [IMAGE_KEYS.galleryHero]: galleryHero } }, token);
        } else {
          await apiSend('DELETE', `/content/${encodeURIComponent(IMAGE_KEYS.galleryHero)}`, {}, token);
        }
      }
      await load(true);
      queryClient.invalidateQueries({ queryKey: ['site-images'] });
      setMsg({ text: 'Photos save ho gayi ✅ Website par live (public page 5 minute me nayi load karega).', ok: true });
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  }

  async function resetSection(section: 'hero' | 'gallery' | 'galleryHero') {
    const key =
      section === 'hero' ? IMAGE_KEYS.homeHero
      : section === 'gallery' ? IMAGE_KEYS.gallery
      : IMAGE_KEYS.galleryHero;
    setBusyIndex(`reset:${section}`);
    setMsg(null);
    try {
      await apiSend('DELETE', `/content/${encodeURIComponent(key)}`, {}, token);
      await load(true);
      queryClient.invalidateQueries({ queryKey: ['site-images'] });
      setMsg({ text: `"${key}" default par reset ho gaya.`, ok: true });
    } catch (err) {
      handleError(err);
    } finally {
      setBusyIndex(null);
    }
  }

  function revertDrafts() {
    setHero(clone(server.hero));
    setGallery(clone(server.gallery));
    setGalleryHero(server.galleryHero);
    setMsg(null);
  }

  function addPhoto() {
    setGallery(g => ({
      ...g,
      added: [...(g.added ?? []), { src: '', caption: 'New photo', category: GALLERY_CATEGORIES[0] }],
    }));
    // Nayi entry sabse neeche add hoti hai — uska upload uske card se hoga
    setMsg({ text: 'Nayi photo entry add ho gayi — usme photo upload karke Save dabao.', ok: true });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading photos…
      </div>
    );
  }

  const heroHidden = new Set(hero.hidden ?? []);
  const galleryHidden = new Set(gallery.hidden ?? []);
  const added = gallery.added ?? [];

  const sections = [
    {
      id: 'hero',
      resetId: 'hero' as const,
      title: 'Home page slider',
      description: `${baseHeroSlides.length} hero slides — photo replace ya hide`,
      dirty: dirty.heroDirty,
      hasOverride: server.hero && Object.keys(server.hero).length > 0,
    },
    {
      id: 'gallery',
      resetId: 'gallery' as const,
      title: 'Gallery photos',
      description: `${baseGalleryImages.length} default + ${added.length} added — photo, caption, category`,
      dirty: dirty.galleryDirty,
      hasOverride: server.gallery && Object.keys(server.gallery).length > 0,
    },
    {
      id: 'gallery-hero',
      resetId: 'galleryHero' as const,
      title: 'Gallery hero photo',
      description: 'Gallery page ki badi featured photo',
      dirty: dirty.heroImageDirty,
      hasOverride: Boolean(server.galleryHero),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChosen}
      />

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-serif font-bold text-black">Photos</h2>
          <p className="text-sm text-muted-foreground">
            Home slider, gallery photos aur gallery hero — yahan se upload/badlo/hide karo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={revertDrafts}
            disabled={!dirty.any}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-black border border-border rounded-xl px-4 h-11 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" /> Revert edits
          </button>
          <button
            onClick={save}
            disabled={saving || !dirty.any || payloadTooBig}
            className="inline-flex items-center gap-2 bg-primary text-white font-bold rounded-xl px-6 h-11 text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : dirty.any ? 'Save photos' : 'Save'}
          </button>
        </div>
      </div>

      {payloadTooBig && (
        <p className="text-sm rounded-xl px-4 py-3 border text-red-700 bg-red-50 border-red-200">
          Total photo data ~{(payloadChars / 1_000_000).toFixed(1)} MB ho gaya hai (limit 16 MB).
          Kuch nayi/replaced photos hatao ya Reset use karo.
        </p>
      )}

      {msg && (
        <p className={`text-sm rounded-xl px-4 py-3 border ${msg.ok ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
          {msg.text}
        </p>
      )}

      <div className="space-y-4">
        {sections.map(section => {
          const isOpen = open === section.id;
          return (
            <div key={section.id} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="w-full flex items-center justify-between gap-3 px-5 py-4">
                <button
                  onClick={() => setOpen(isOpen ? '' : section.id)}
                  className="flex items-center gap-2.5 min-w-0 text-left flex-1 hover:opacity-80 transition-opacity"
                >
                  <Images className="w-4 h-4 text-primary shrink-0" />
                  <span className="min-w-0">
                    <span className="block font-bold text-black truncate">{section.title}</span>
                    <span className="block text-xs text-muted-foreground truncate">{section.description}</span>
                  </span>
                </button>
                <span className="flex items-center gap-2 shrink-0">
                  {section.dirty && (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                      unsaved
                    </span>
                  )}
                  {section.hasOverride && (
                    <button
                      onClick={() => resetSection(section.resetId)}
                      disabled={busyIndex !== null}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-red-600 underline-offset-2 hover:underline disabled:opacity-50"
                      title="Saare photos default par wapas"
                    >
                      {busyIndex === `reset:${section.resetId}`
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <RotateCcw className="w-3 h-3" />}
                      Reset
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(isOpen ? '' : section.id)}
                    className="text-xs font-semibold text-primary"
                  >
                    {isOpen ? 'Hide' : 'Open'}
                  </button>
                </span>
              </div>

              {isOpen && section.id === 'hero' && (
                <div className="border-t border-border px-5 py-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {baseHeroSlides.map((slide, i) => {
                      const replaced = Boolean((hero.images ?? {})[String(i)]);
                      const src = (hero.images ?? {})[String(i)] ?? slide.src;
                      return (
                        <HeroCard
                          key={i}
                          index={i}
                          src={src}
                          label={slide.label}
                          tag={slide.tag}
                          hidden={heroHidden.has(i)}
                          replaced={replaced}
                          onReplace={() => pickPhoto({ kind: 'hero', index: i })}
                          onToggle={() => setHero(h => ({ ...h, hidden: toggleIndex(h.hidden, i) }))}
                        />
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Hide karne par bhi slide count kam hota hai — slider hamesha chalta rahega.
                    {replacedAny(hero) && ' “Replaced” wali photos site par isi jagah dikhti hain.'}
                  </p>
                </div>
              )}

              {isOpen && section.id === 'gallery' && (
                <div className="border-t border-border px-5 py-5 space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-xs text-muted-foreground">
                      Caption/category inline edit kar sakte ho — Save dabate hi website par lag jaayega.
                    </p>
                    <button
                      onClick={addPhoto}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl px-4 py-2.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add photo
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {baseGalleryImages.map((base, i) => {
                      const ov = (gallery.overrides ?? {})[String(i)] ?? {};
                      const item = { ...base, ...ov };
                      const hidden = galleryHidden.has(i);
                      const changed = Boolean(ov.src) || ov.caption !== undefined || ov.category !== undefined;
                      const busy = busyIndex === `gallery:${i}`;
                      return (
                        <div
                          key={i}
                          className={`rounded-2xl border overflow-hidden bg-white ${hidden ? 'border-border opacity-60' : changed ? 'border-amber-400' : 'border-border'}`}
                        >
                          <div className="relative aspect-[4/3] bg-slate-100">
                            <img src={item.src} alt={item.caption} className="w-full h-full object-cover" loading="lazy" />
                            {hidden && (
                              <span className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                                Hidden
                              </span>
                            )}
                            <span className="absolute top-2 left-2 bg-black/65 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {i + 1}
                            </span>
                            {changed && (
                              <span className="absolute top-2 right-2 bg-amber-400 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Edited
                              </span>
                            )}
                            {busy && (
                              <span className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              </span>
                            )}
                          </div>
                          <div className="p-3 space-y-2">
                            <input
                              value={item.caption}
                              onChange={e => setGallery(g => setOverride(g, i, { caption: e.target.value }))}
                              className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs text-black outline-none focus:border-primary bg-white"
                              placeholder="Caption"
                            />
                            <input
                              value={item.category}
                              list="gallery-categories"
                              onChange={e => setGallery(g => setOverride(g, i, { category: e.target.value }))}
                              className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs text-black outline-none focus:border-primary bg-white"
                              placeholder="Category"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => pickPhoto({ kind: 'gallery', index: i })}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-primary border border-primary/25 rounded-lg py-1.5 hover:bg-primary/5 transition-colors"
                              >
                                <Upload className="w-3.5 h-3.5" /> Replace
                              </button>
                              <button
                                onClick={() => setGallery(g => ({ ...g, hidden: toggleIndex(g.hidden, i) }))}
                                className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 border text-xs font-semibold transition-colors ${
                                  hidden
                                    ? 'text-green-700 border-green-300 bg-green-50 hover:bg-green-100'
                                    : 'text-slate-600 border-border hover:bg-muted'
                                }`}
                                title={hidden ? 'Photo wapas dikhao' : 'Photo hide karo'}
                              >
                                {hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {added.map((item, j) => {
                      const busy = busyIndex === `added:${j}`;
                      return (
                        <div key={`added-${j}`} className="rounded-2xl border border-amber-400 overflow-hidden bg-white">
                          <div className="relative aspect-[4/3] bg-amber-50">
                            {item.src ? (
                              <img src={item.src} alt={item.caption} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-amber-700">
                                <ImagePlus className="w-6 h-6" />
                                <span className="text-[11px] font-semibold">Photo upload karo</span>
                              </div>
                            )}
                            <span className="absolute top-2 left-2 bg-amber-500 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              New
                            </span>
                            {busy && (
                              <span className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              </span>
                            )}
                          </div>
                          <div className="p-3 space-y-2">
                            <input
                              value={item.caption}
                              onChange={e => setGallery(g => {
                                const list = [...(g.added ?? [])];
                                list[j] = { ...list[j], caption: e.target.value };
                                return { ...g, added: list };
                              })}
                              className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs text-black outline-none focus:border-primary bg-white"
                              placeholder="Caption"
                            />
                            <input
                              value={item.category}
                              list="gallery-categories"
                              onChange={e => setGallery(g => {
                                const list = [...(g.added ?? [])];
                                list[j] = { ...list[j], category: e.target.value };
                                return { ...g, added: list };
                              })}
                              className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs text-black outline-none focus:border-primary bg-white"
                              placeholder="Category"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => pickPhoto({ kind: 'added', index: j })}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-primary border border-primary/25 rounded-lg py-1.5 hover:bg-primary/5 transition-colors"
                              >
                                <Upload className="w-3.5 h-3.5" /> {item.src ? 'Replace' : 'Upload'}
                              </button>
                              <button
                                onClick={() => setGallery(g => {
                                  const list = (g.added ?? []).filter((_, k) => k !== j);
                                  return { ...g, added: list.length ? list : undefined };
                                })}
                                className="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
                                title="Entry hatao"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <datalist id="gallery-categories">
                    {GALLERY_CATEGORIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              )}

              {isOpen && section.id === 'gallery-hero' && (
                <div className="border-t border-border px-5 py-5 space-y-4">
                  <div className="rounded-2xl border border-border overflow-hidden bg-slate-50 max-w-2xl">
                    <div className="relative aspect-[16/9] bg-slate-100">
                      <img
                        src={galleryHero ?? baseGalleryImages[6]?.src ?? baseGalleryImages[0]?.src}
                        alt="Gallery hero"
                        className="w-full h-full object-cover"
                      />
                      {galleryHero && (
                        <span className="absolute top-2 right-2 bg-amber-400 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex gap-2">
                      <button
                        onClick={() => pickPhoto({ kind: 'galleryHero' })}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-primary border border-primary/25 rounded-lg py-2 hover:bg-primary/5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" /> {galleryHero ? 'Replace photo' : 'Set custom photo'}
                      </button>
                      {galleryHero && (
                        <button
                          onClick={() => setGalleryHero(undefined)}
                          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 border border-border rounded-lg px-3 py-2 hover:bg-muted transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Default
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Default photo wahi hai jo gallery page code se lagata hai; custom photo sirf tab dikhti
                    hai jab tak yahan se Reset na karo.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        {dirty.any
          ? <><Check className="w-3.5 h-3.5 text-amber-600" /> Save karne ke baad public pages turant nayi photos load karte hain.</>
          : <>Sab photos saved hain. Har section ke liye “Reset” dabao toh code ki default photo wapas aa jaati hai.</>}
      </p>
    </div>
  );
}

function replacedAny(hero: HomeHeroAdminConfig): boolean {
  return Object.keys(hero.images ?? {}).length > 0;
}
