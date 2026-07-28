import type { Metadata } from 'next';
import { fetchProfileByUsernameServer } from '@/services/profiles-server';
import { JsonLd } from '@/components/seo/JsonLd';
import ProfilePageClient from './ProfilePageClient';

const BASE_URL = 'https://lunarys-platform.vercel.app';

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await fetchProfileByUsernameServer(username);

  if (!profile) {
    return {
      title: 'Profil Tidak Ditemukan',
      robots: { index: false },
    };
  }

  const description = profile.bio
    ? profile.bio.slice(0, 160)
    : `Lihat profil @${profile.username} di Lunarys — ${profile.quotes_count || 0} kutipan, ${profile.followers_count || 0} pengikut.`;

  return {
    title: `${profile.name} (@${profile.username})`,
    description,
    alternates: {
      canonical: `${BASE_URL}/profile/${username}`,
    },
    openGraph: {
      title: `${profile.name} (@${profile.username}) | Lunarys`,
      description,
      url: `${BASE_URL}/profile/${username}`,
      type: 'profile',
      username: profile.username,
      images: profile.avatar_url
        ? [
            {
              url: profile.avatar_url,
              width: 400,
              height: 400,
              alt: `Foto profil ${profile.name}`,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary',
      title: `${profile.name} (@${profile.username}) | Lunarys`,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  const profile = await fetchProfileByUsernameServer(username);

  const personSchema = profile
    ? {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: profile.name,
        url: `${BASE_URL}/profile/${profile.username}`,
        identifier: `@${profile.username}`,
        image: profile.avatar_url || undefined,
        description: profile.bio || undefined,
        sameAs: [`${BASE_URL}/profile/${profile.username}`],
      }
    : null;

  return (
    <>
      {personSchema && <JsonLd data={personSchema} />}
      <ProfilePageClient params={params} />
    </>
  );
}
