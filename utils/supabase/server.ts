import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;

export const createClient = (cookieStore?: Awaited<ReturnType<typeof cookies>>) => {
  if (cookieStore) {
    return createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    });
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      async getAll() {
        const store = await cookies();
        return store.getAll();
      },
      async setAll(cookiesToSet) {
        try {
          const store = await cookies();
          cookiesToSet.forEach(({ name, value, options }) =>
            store.set(name, value, options)
          );
        } catch {
          // Ignore if called from Server Component
        }
      },
    },
  });
};
