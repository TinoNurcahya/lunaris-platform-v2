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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Lunarys — Platform Kutipan & Lirik Lagu',
  description: 'Bagikan inspirasi, lirik lagu favorit, dan kata-kata mutiara di Lunarys.',
  verification: {
    google: 'qRcUhVxFJqfZWasUslN3sqwooMZbj2xl3938wvu2bEU',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
