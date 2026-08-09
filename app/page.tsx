import { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchQuotesServer, fetchCategoriesServer } from '@/services/quotes-server';
import HomeFeedClient from '@/components/home/HomeFeedClient';

export const metadata: Metadata = {
  title: 'Lunarys — Beranda Kutipan & Lirik Lagu',
  description: 'Jelajahi ribuan kutipan inspiratif dan potongan lirik lagu dari berbagai kategori.',
};

export default async function HomePage(props: { searchParams: Promise<{ category?: string }> }) {
  const searchParams = await props.searchParams;
  const categoryId = searchParams.category ? parseInt(searchParams.category, 10) : undefined;

  const [initialQuotes, initialCategories] = await Promise.all([
    fetchQuotesServer({ categoryId, limit: 20 }),
    fetchCategoriesServer()
  ]);

  return (
    <Suspense fallback={<div className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse transition-colors duration-200" />}>
      <HomeFeedClient initialQuotes={initialQuotes} initialCategories={initialCategories} />
    </Suspense>
  );
}
