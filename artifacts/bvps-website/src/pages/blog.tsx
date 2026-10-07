import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Newspaper, ArrowLeft, ArrowRight, Calendar, Tag, Loader2 } from 'lucide-react';
import { PageSeo } from '@/lib/seo';
import { useSiteContent } from '@/lib/site-content';
import { apiGet } from '@/lib/api';
import type { BlogPost } from '@/pages/admin/types';
import { formatDate } from '@/pages/admin/types';
import heroImg from '@assets/bal-vikas-public-school-kalayat-kaithal-schools-3t6w6qk_1784611430223.webp';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { get } = useSiteContent();

  useEffect(() => {
    let active = true;
    apiGet<{ success: boolean; data: BlogPost[] }>('/blog')
      .then(res => { if (active) setPosts(res?.data ?? []); })
      .catch(() => { /* blog down → empty list */ })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="flex flex-col">
      {/* SEO tags ab central PageSeo se (lib/seo.tsx) — react-helmet-async
          pichle page ke og/twitter tags hata deta tha, isliye pehle ye page
          poora og/twitter block khud likhta tha. */}
      <PageSeo path="/blog" />

      <div className="bg-primary pt-24 pb-16 px-4 relative overflow-hidden">
        <img src={heroImg} alt="Bal Vikas Public School campus building, Railway Road, Kalayat, Haryana" className="absolute inset-0 w-full h-full object-cover object-center opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 to-primary/60" />
        <div className="container mx-auto text-center relative z-10">
          <ScrollReveal>
            <span className="text-secondary font-semibold uppercase tracking-widest text-sm">News &amp; Updates</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 mt-2">{get('blog.hero.title', 'BVPS Blog & News')}</h1>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
            <p className="mt-6 text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              {get('blog.hero.subtitle', 'School ki taaza khabarein, events aur updates — ek jagah par.')}
            </p>
          </ScrollReveal>
          <ScrollReveal>
            <Link href="/" className="inline-flex items-center gap-2 mt-6 text-primary-foreground/70 hover:text-secondary transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </ScrollReveal>
        </div>
      </div>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading posts…
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                <Newspaper className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-serif font-bold text-black">Abhi koi post nahi hai</h2>
              <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
                School jald hi naye posts publish karega. Naye updates ke liye baar-baar visit karein.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {posts.map((post, index) => (
                <ScrollReveal key={post.id}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className={`block bg-white rounded-3xl border border-border shadow-md overflow-hidden group hover:shadow-xl transition-all ${
                      index === 0 ? 'md:col-span-2' : ''
                    }`}
                  >
                    {post.coverImage ? (
                      <div className={`${index === 0 ? 'h-56 md:h-64' : 'h-44'} overflow-hidden`}>
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    ) : (
                      <div className={`${index === 0 ? 'h-44 md:h-52' : 'h-32'} bg-gradient-to-br from-primary to-[#18315e] flex items-center justify-center`}>
                        <Newspaper className="w-10 h-10 text-secondary opacity-60" />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        {post.category && (
                          <span className="inline-flex items-center gap-1 font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            <Tag className="w-3 h-3" /> {post.category}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5" /> {formatDate(post.publishedAt)}
                        </span>
                      </div>

                      <h2 className={`font-serif font-bold text-black group-hover:text-primary transition-colors ${index === 0 ? 'text-2xl' : 'text-xl'}`}>
                        {post.title}
                      </h2>

                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{post.excerpt}</p>
                      )}

                      <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-secondary">
                        Read More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}