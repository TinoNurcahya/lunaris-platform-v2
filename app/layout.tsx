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
import AuditTracker from "@/components/audit/AuditTracker";

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
    default: 'Lunarys — Kutipan, Quotes & Kata Kata Bijak Indonesia',
    template: '%s | Lunarys — Quotes & Kutipan',
  },
  description:
    'Temukan kutipan inspiratif, kata kata bijak, quotes cinta, motivasi, kehidupan, filosofi, dan berbagai kutipan bermakna di Lunarys.',

  keywords: [
    // Brand
    'lunarys',
    'lunarys quotes',
    'lunarys kutipan',
    'lunarys indonesia',
    'lunarys quotes indonesia',

    // Kutipan umum
    'kutipan',
    'quotes',
    'quote',
    'kutipan terbaik',
    'quotes terbaik',
    'kutipan populer',
    'quotes populer',
    'kutipan terkenal',
    'quotes terkenal',
    'kutipan inspiratif',
    'quotes inspiratif',
    'kutipan bermakna',
    'quotes bermakna',
    'kutipan pilihan',
    'quotes pilihan',
    'kumpulan kutipan',
    'kumpulan quotes',
    'koleksi kutipan',
    'koleksi quotes',

    // Kata-kata
    'kata kata',
    'kata-kata',
    'kata kata mutiara',
    'kata-kata mutiara',
    'kata kata bijak',
    'kata-kata bijak',
    'kata kata inspiratif',
    'kata-kata inspiratif',
    'kata kata bermakna',
    'kata-kata bermakna',
    'kata kata motivasi',
    'kata-kata motivasi',
    'kata kata kehidupan',
    'kata-kata kehidupan',
    'kata kata penyemangat',
    'kata-kata penyemangat',
    'kata kata penuh makna',
    'kata-kata penuh makna',

    // Motivasi
    'kutipan motivasi',
    'quotes motivasi',
    'quote motivasi',
    'motivational quotes',
    'kata kata motivasi hidup',
    'quotes motivasi hidup',
    'kutipan penyemangat',
    'quotes penyemangat',
    'kata kata semangat',
    'quotes tentang perjuangan',
    'quotes tentang kesuksesan',
    'quotes tentang kegagalan',
    'quotes tentang impian',
    'quotes tentang masa depan',
    'quotes untuk diri sendiri',
    'quotes self improvement',
    'quotes pengembangan diri',

    // Kehidupan
    'kutipan kehidupan',
    'quotes kehidupan',
    'quotes tentang kehidupan',
    'kata kata tentang kehidupan',
    'kutipan hidup',
    'quotes hidup',
    'quotes kehidupan bermakna',
    'quotes perjalanan hidup',
    'quotes realita kehidupan',
    'quotes tentang waktu',
    'quotes tentang perubahan',
    'quotes tentang pilihan hidup',
    'quotes tentang pengalaman hidup',
    'quotes tentang kedewasaan',

    // Cinta
    'kutipan cinta',
    'quotes cinta',
    'quote cinta',
    'kata kata cinta',
    'kata-kata cinta',
    'quotes romantis',
    'kutipan romantis',
    'kata kata romantis',
    'quotes tentang cinta',
    'quotes tentang perasaan',
    'quotes tentang hubungan',
    'quotes tentang pasangan',
    'quotes untuk pasangan',
    'quotes tentang rindu',
    'quotes tentang kehilangan',
    'quotes tentang patah hati',
    'quotes galau',
    'kata kata galau',

    // Filosofi
    'filosofi hidup',
    'kutipan filosofi',
    'quotes filosofi',
    'quote filosofi',
    'kata kata filosofi',
    'quotes filosofis',
    'kutipan filosofis',
    'kata kata kehidupan filosofis',
    'quotes tentang makna hidup',
    'quotes tentang kehidupan',
    'quotes tentang manusia',
    'quotes tentang kebahagiaan',
    'quotes tentang kesendirian',
    'quotes tentang ketenangan',
    'quotes tentang waktu dan kehidupan',

    // Lirik lagu
    'lirik lagu',
    'lyrics',
    'song lyrics',
    'potongan lirik lagu',
    'kutipan lirik lagu',
    'quotes lirik lagu',
    'lirik lagu indonesia',
    'lirik lagu populer',
    'lirik lagu bermakna',
    'lirik lagu romantis',
    'lirik lagu galau',
    'lirik lagu motivasi',
    'potongan lirik',
    'kutipan lagu',
    'quotes dari lagu',

    // Estetika
    'kutipan estetis',
    'quotes estetis',
    'kata kata aesthetic',
    'quotes aesthetic',
    'aesthetic quotes',
    'aesthetic words',
    'kata kata estetik',
    'quotes estetik',
    'kutipan indah',
    'quotes indah',
    'kata kata indah',
    'kata kata penuh makna',
    'quotes singkat',
    'kutipan singkat',
    'quotes pendek',
    'kutipan pendek',

    // Berdasarkan kebutuhan pengguna
    'quotes untuk hari ini',
    'quote of the day',
    'kutipan hari ini',
    'kata kata hari ini',
    'quotes untuk status',
    'quotes untuk caption',
    'kata kata untuk caption',
    'quotes instagram',
    'quotes untuk media sosial',
    'kata kata untuk status',
    'quotes bahasa indonesia',
    'kutipan bahasa indonesia',
    'kata kata bahasa indonesia',

    // Bahasa Inggris yang masih relevan
    'quotes indonesia',
    'indonesian quotes',
    'best quotes',
    'inspirational quotes',
    'life quotes',
    'love quotes',
    'motivational quotes',
    'wisdom quotes',
    'philosophical quotes',
    'aesthetic quotes',
    'meaningful quotes',
    'famous quotes',
    'short quotes',
    'deep quotes',
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
      'Temukan ribuan kutipan inspiratif, lirik lagu, dan kata-kata mutiara dari berbagai kategori. Bagikan inspirasi setiap hari bersama Lunarys.',
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
      'Temukan ribuan kutipan inspiratif, lirik lagu, dan kata-kata mutiara dari berbagai kategori. Bagikan inspirasi setiap hari bersama Lunarys.',
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
    'Temukan ribuan kutipan inspiratif, lirik lagu, dan kata-kata mutiara dari berbagai kategori. Bagikan inspirasi setiap hari bersama Lunarys.',
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
  } catch {
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
          <AuditTracker />
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
