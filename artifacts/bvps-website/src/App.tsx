import { Suspense, lazy, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LanguageProvider } from '@/lib/language-context';
import { HelmetProvider } from 'react-helmet-async';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

// Layout & Pages
import { RootLayout } from '@/components/layout/RootLayout';

// Pehle saare 19 pages statically import the, jiski wajah se ek hi 1MB+ ka
// bundle banta tha aur har visitor ko admission/contact page ka code bhi
// download karna pada. Ab har page apna alag chunk hai, jo sirf tab download
// hota hai jab woh actually visit hota hai.
const Home = lazy(() => import('@/pages/home'));
const About = lazy(() => import('@/pages/about'));
const Facilities = lazy(() => import('@/pages/facilities'));
const Admissions = lazy(() => import('@/pages/admissions'));
const Contact = lazy(() => import('@/pages/contact'));
const Gallery = lazy(() => import('@/pages/gallery'));
const Feedback = lazy(() => import('@/pages/feedback'));
const Results = lazy(() => import('@/pages/results'));

// Admissions sub-pages
const FeeStructure = lazy(() => import('@/pages/fee-structure'));
const Application = lazy(() => import('@/pages/application'));
const Interview = lazy(() => import('@/pages/interview'));
const SchoolTiming = lazy(() => import('@/pages/school-timing'));
const Enrollment = lazy(() => import('@/pages/enrollment'));
const Streams = lazy(() => import('@/pages/streams'));
const PrincipalMessage = lazy(() => import('@/pages/principal-message'));
const Academics = lazy(() => import('@/pages/academics'));

// Blog (public)
const Blog = lazy(() => import('@/pages/blog'));
const BlogPostPage = lazy(() => import('@/pages/blog-post'));

// Admin portal (website ki layout se alag, apna alag page)
const AdminPortal = lazy(() => import('@/pages/admin/AdminPortal'));

const queryClient = new QueryClient();

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground text-sm">
      Loading…
    </div>
  );
}

/**
 * Admin portal ka hidden entry: kisi bhi page par URL me `#admin` daalne se
 * /admin portal khul jata hai (mobile par bhi). `?admin=1` fee-structure page ka
 * apna shortcut hai, isliye yahan use nahi kiya.
 */
function AdminShortcut() {
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (location.startsWith('/fee-structure')) return; // wahan apna admin shortcut hai
    if (window.location.hash !== '#admin') return;
    // hash hata dete hain, warna baad me har navigation par portal dobara khulta
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    navigate('/admin', { replace: true });
  }, [location, navigate]);

  return null;
}

function PublicRouter() {
  return (
    <RootLayout>
      <Suspense fallback={<RouteFallback />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/facilities" component={Facilities} />
          <Route path="/admissions" component={Admissions} />
          <Route path="/academics" component={Academics} />
          <Route path="/contact" component={Contact} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/feedback" component={Feedback} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:slug" component={BlogPostPage} />
          {/* Admissions sub-pages */}
          <Route path="/fee-structure" component={FeeStructure} />
          <Route path="/application" component={Application} />
          <Route path="/interview" component={Interview} />
          <Route path="/school-timing" component={SchoolTiming} />
          <Route path="/enrollment" component={Enrollment} />
          <Route path="/streams" component={Streams} />
          <Route path="/principal-message" component={PrincipalMessage} />
          <Route path="/results" component={Results} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </RootLayout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Admin portal website se alag page hai — iska apna layout/login hai.
          NOTE: wouter me wildcard "/admin/*" hota hai (":rest*" nahi) — ":rest*" se
          /admin/blog/new jaise nested pages match hi nahi hote the aur 404 page aa raha tha. */}
      <Route path="/admin" component={AdminPortal} />
      <Route path="/admin/*" component={AdminPortal} />
      {/* Baaki sab public website */}
      <Route component={PublicRouter} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <HelmetProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <AdminShortcut />
              <Suspense fallback={<RouteFallback />}>
                <Router />
              </Suspense>
              <Toaster />
            </WouterRouter>
          </HelmetProvider>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
