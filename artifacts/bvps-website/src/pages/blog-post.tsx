import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useRoute } from 'wouter';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Newspaper, ArrowLeft, Calendar, Tag, User, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';
import type { BlogPost } from '@/pages/admin/types';
import { formatDate } from '@/pages/admin/types';

function renderContent(content: string) {
  return content
    .split(/\n{2,}/)
    .map(block => block.replace(/\n/g, ' ').trim())
    .filter(Boolean)
    .map((para, i) => (
      <p key={i} className="text-[15px] leading-relaxed text-gray-700 mb-5">
        {para.split('\n').map((line, j) => (
          <span key={j}>
            {line}
            {j < para.split('\n').length - 1 && <br />}
          </span>
        ))}
      </p>
    ));
}

export default function BlogPostPage() {
  const [, params] = useRoute('/blog/:slug');
  const slug = params?.slug ?? '';
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    let active = true;
    apiGet<{ success: boolean; data: BlogPost }>(`/blog/${slug}`)
      .then(res => { if (active) { if (res?.data) setPost(res.data); else setNotFound(true); } })
      .catch(() => { if (active) setNotFound(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
        <Helmet>
          <title>Loading… — BVPS Blog</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading post…
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    // Pehle ye branch <Helmet> se pehle return ho jata tha, jiski wajah se
    // delete/galti se likha koi URL homepage ka default title + `index, follow`
    // inherit kar leta tha. Ab is state par noindex + apna title set hota hai.
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <Helmet>
          <title>Page not found — Bal Vikas Public School Kalayat</title>
          <meta
            name="description"
            content="This BVPS blog post is unavailable. Browse the latest news and announcements from Bal Vikas Public School, Kalayat."
          />
          <meta name="robots" content="noindex, follow" />
          <link rel="canonical" href="https://bvps-school.vercel.app/blog" />
        </Helmet>
        <Newspaper className="w-12 h-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-serif font-bold text-black">Post not found</h1>
        <p className="text-muted-foreground text-sm mt-2 mb-6">
          This post may have been removed, or the link is incorrect.
        </p>
        <Link href="/blog" className="inline-flex items-center gap-2 bg-primary text-white font-bold rounded-full px-6 h-11 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  const postUrl = `https://bvps-school.vercel.app/blog/${slug}`;
  const postDescription =
    post.excerpt?.trim() ||
    `${post.title} — news and updates from Bal Vikas Public School, Kalayat.`;
  const blogPostSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: postDescription,
    url: postUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    image: [post.coverImage || 'https://bvps-school.vercel.app/og-bvps.jpg'],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    inLanguage: 'en-IN',
    author: { '@type': 'Organization', name: 'Bal Vikas Public School, Kalayat' },
    publisher: {
      '@type': 'Organization',
      name: 'Bal Vikas Public School, Kalayat',
      logo: {
        '@type': 'ImageObject',
        url: 'https://bvps-school.vercel.app/school-logo.png',
      },
    },
  };

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>{post.title} — BVPS Blog</title>
        <meta name="description" content={postDescription} />
        <link rel="canonical" href={postUrl} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={postDescription} />
        <meta property="og:url" content={postUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={post.coverImage || 'https://bvps-school.vercel.app/og-bvps.jpg'} />
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:author" content="Bal Vikas Public School, Kalayat" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={postDescription} />
        <meta
          name="twitter:image"
          content={post.coverImage || 'https://bvps-school.vercel.app/og-bvps.jpg'}
        />
        <script type="application/ld+json">{JSON.stringify(blogPostSchema)}</script>
      </Helmet>

      <div className="bg-primary pt-24 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/50 to-primary/70" />
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 text-secondary font-semibold uppercase tracking-widest text-sm">
              <Tag className="w-4 h-4" /> {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 mt-2 leading-tight">
              {post.title}
            </h1>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
            <div className="mt-6 flex items-center justify-center gap-4 text-primary-foreground/80 text-sm flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {formatDate(post.publishedAt)}
              </span>
              {post.author && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="w-4 h-4" /> {post.author}
                </span>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> All Blog Posts
          </Link>

          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full rounded-3xl border border-border shadow-md mb-10 max-h-[420px] object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          )}

          <article className="bg-white rounded-3xl border border-border shadow-sm p-6 md:p-10">
            {post.excerpt && (
              <p className="text-lg font-semibold text-black border-l-4 border-secondary pl-4 mb-8">
                {post.excerpt}
              </p>
            )}
            <div className="space-y-1">{renderContent(post.content)}</div>

            <div className="mt-10 pt-6 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
              <Newspaper className="w-4 h-4 text-secondary" />
              Published by Bal Vikas Public School, Kalayat
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}