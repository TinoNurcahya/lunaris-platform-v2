import type { MetadataRoute } from 'next';
import { fetchAllQuotesForSitemap } from '@/services/quotes-server';
import { fetchAllProfilesForSitemap } from '@/services/profiles-server';
import { createClient } from '@/utils/supabase/server';

const BASE_URL = 'https://lunarys-platform.vercel.app';

async function fetchCategoriesForSitemap(): Promise<{ slug: string; created_at: string }[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('slug, created_at');

  if (error || !data) return [];
  return data as { slug: string; created_at: string }[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [quotes, profiles, categories] = await Promise.all([
    fetchAllQuotesForSitemap(),
    fetchAllProfilesForSitemap(),
    fetchCategoriesForSitemap(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  const quoteRoutes: MetadataRoute.Sitemap = quotes.map((q) => ({
    url: `${BASE_URL}/quotes/${q.id}`,
    lastModified: new Date(q.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const profileRoutes: MetadataRoute.Sitemap = profiles.map((p) => ({
    url: `${BASE_URL}/profile/${p.username}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE_URL}/?category=${c.slug}`,
    lastModified: new Date(c.created_at),
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...quoteRoutes, ...profileRoutes, ...categoryRoutes];
}