import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LanguageProvider } from '@/lib/language-context';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

// Layout & Pages
import { RootLayout } from '@/components/layout/RootLayout';
import Home from '@/pages/home';
import About from '@/pages/about';
import Facilities from '@/pages/facilities';
import Admissions from '@/pages/admissions';
import Contact from '@/pages/contact';
import Gallery from '@/pages/gallery';
import Feedback from '@/pages/feedback';

import Results from '@/pages/results';

// Admissions sub-pages
import FeeStructure from '@/pages/fee-structure';
import Application from '@/pages/application';
import Interview from '@/pages/interview';
import SchoolTiming from '@/pages/school-timing';
import Enrollment from '@/pages/enrollment';
import Streams from '@/pages/streams';
import PrincipalMessage from '@/pages/principal-message';
import Academics from '@/pages/academics';

const queryClient = new QueryClient();

function Router() {
  return (
    <RootLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/facilities" component={Facilities} />
        <Route path="/admissions" component={Admissions} />
        <Route path="/academics" component={Academics} />
        <Route path="/contact" component={Contact} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/feedback" component={Feedback} />
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
    </RootLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
