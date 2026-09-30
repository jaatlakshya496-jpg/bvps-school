import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found — Bal Vikas Public School Kalayat</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://bvps-school.vercel.app/" />
      </Helmet>
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">
                Page Not Found
              </h1>
            </div>

            <p className="mt-2 text-sm text-gray-600">
              Ye page abhi available nahi hai ya link galat type ho gaya hai.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Kripya niche diye gaye menus se apna page chunein, ya homepage par laut jayein.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Home className="h-4 w-4" /> Home
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
