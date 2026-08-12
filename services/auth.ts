import { createClient } from '@/utils/supabase/client';

export const RESERVED_USERNAMES = [
  'admin',
  'administrator',
  'system',
  'api',
  'lunarys',
  'official',
  'help',
  'support',
  'moderator',
  'root',
  'settings',
  'profile',
  'search',
  'quotes',
  'categories',
  'leaderboard',
  'notifications'
];

export function isReservedUsername(username: string): boolean {
  if (!username) return false;
  const cleanUsername = username.trim().toLowerCase();
  return RESERVED_USERNAMES.includes(cleanUsername);
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = createClient();
  const origin = window.location.origin;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}
