import type { Metadata } from 'next';
import { fetchQuoteByIdServer } from '@/services/quotes-server';
import { JsonLd } from '@/components/seo/JsonLd';
import QuoteDetailClient from './QuoteDetailClient';

const BASE_URL = 'https://lunarys-platform.vercel.app';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const quoteId = parseInt(id, 10);
  const quote = await fetchQuoteByIdServer(quoteId);

  if (!quote) {
    return {
      title: 'Kutipan Tidak Ditemukan',
      robots: { index: false },
    };
  }

  const snippet = quote.content.length > 160
    ? `${quote.content.slice(0, 157)}...`
    : quote.content;

  const authorName = quote.user?.name || 'Pengguna Lunarys';
  const title = quote.song_title
    ? `"${quote.song_title}" oleh ${quote.song_artist || authorName}`
    : `Kutipan oleh ${authorName}`;

  return {
    title,
    description: snippet,
    alternates: {
      canonical: `${BASE_URL}/quotes/${id}`,
    },
    openGraph: {
      title: `${title} | Lunarys`,
      description: snippet,
      url: `${BASE_URL}/quotes/${id}`,
      type: 'article',
      publishedTime: quote.created_at,
      modifiedTime: quote.updated_at,
      authors: [`${BASE_URL}/profile/${quote.user?.username}`],
    },
    twitter: {
      card: 'summary',
      title: `${title} | Lunarys`,
      description: snippet,
    },
  };
}

export default async function QuoteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const quoteId = parseInt(id, 10);
  const quote = await fetchQuoteByIdServer(quoteId);

  const articleSchema = quote
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: quote.song_title
          ? `"${quote.song_title}" oleh ${quote.song_artist || quote.user?.name}`
          : `Kutipan oleh ${quote.user?.name || 'Pengguna Lunarys'}`,
        description: quote.content.slice(0, 200),
        datePublished: quote.created_at,
        dateModified: quote.updated_at,
        author: {
          '@type': 'Person',
          name: quote.user?.name || 'Pengguna Lunarys',
          url: quote.user?.username
            ? `${BASE_URL}/profile/${quote.user.username}`
            : BASE_URL,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Lunarys',
          url: BASE_URL,
        },
        url: `${BASE_URL}/quotes/${id}`,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${BASE_URL}/quotes/${id}`,
        },
      }
    : null;

  return (
    <>
      {articleSchema && <JsonLd data={articleSchema} />}
      <QuoteDetailClient params={params} />
    </>
  );
}
