import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import ToasterProvider from "@/components/ui/ToasterProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { createClient } from "@/utils/supabase/server";
import { Profile } from "@/types";
import { JsonLd } from "@/components/seo/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = 'https://lunarys-platform.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  applicationName: 'Lunarys',
  title: {
    default: 'Lunarys — Platform Kutipan & Lirik Lagu',
    template: '%s | Lunarys',
  },
  description:
    'Temukan, bagikan, dan simpan kutipan inspiratif, lirik lagu favorit, dan kata-kata mutiara dari komunitas Lunarys.',
  keywords: [
    'kutipan',
    'lirik lagu',
    'kata-kata mutiara',
    'inspirasi',
    'quotes',
    'lunarys',
  ],
  authors: [{ name: 'Lunarys', url: BASE_URL }],
  creator: 'Lunarys',
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: BASE_URL,
    siteName: 'Lunarys',
    title: 'Lunarys — Platform Kutipan & Lirik Lagu',
    description:
      'Temukan, bagikan, dan simpan kutipan inspiratif, lirik lagu favorit, dan kata-kata mutiara dari komunitas Lunarys.',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Lunarys — Platform Kutipan & Lirik Lagu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lunarys — Platform Kutipan & Lirik Lagu',
    description:
      'Temukan, bagikan, dan simpan kutipan inspiratif, lirik lagu favorit, dan kata-kata mutiara dari komunitas Lunarys.',
    images: [`${BASE_URL}/og-image.png`],
  },
  verification: {
    google: 'qRcUhVxFJqfZWasUslN3sqwooMZbj2xl3938wvu2bEU',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Lunarys',
  url: BASE_URL,
  description:
    'Platform kutipan inspiratif, lirik lagu, dan kata-kata mutiara dari komunitas Indonesia.',
  inLanguage: 'id-ID',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let profile: Profile | null = null;

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        profile = data as Profile;
      }
    }
  } catch (err) {
    // Supabase credentials fallback for dev
  }

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-600 selection:text-white font-sans transition-colors duration-200">
        <JsonLd data={websiteSchema} />
        <ThemeProvider>
          <ToasterProvider />
          <Navbar profile={profile} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 pb-20 md:pb-6 flex-1 flex gap-8">
            <Sidebar profile={profile} isAdmin={profile?.role === 'admin'} />
            <main className="flex-1 min-w-0">{children}</main>
          </div>

          <Footer />
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
