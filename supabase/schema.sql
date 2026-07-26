-- --------------------------------------------------------
-- LUNARYS V2 -- FULL DATABASE SCHEMA & SEED DATA
-- --------------------------------------------------------

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- TABLE 1: PROFILES
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  xp INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- TABLE 2: CATEGORIES
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Sparkles',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- TABLE 3: QUOTES
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quotes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  song_title TEXT,
  song_artist TEXT,
  song_lyric_snippet TEXT,
  spotify_url TEXT,
  mood TEXT,
  likes_count INT NOT NULL DEFAULT 0,
  dislikes_count INT NOT NULL DEFAULT 0,
  comments_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_quote_of_day BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration for existing quotes table
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS mood TEXT;

-- --------------------------------------------------------
-- TABLE 4: COMMENTS
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comments (
  id SERIAL PRIMARY KEY,
  quote_id INT REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_id INT REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- TABLE 5: VOTES (Likes & Dislikes)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.votes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  quote_id INT REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('like', 'dislike')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, quote_id)
);

-- --------------------------------------------------------
-- TABLE 6: BOOKMARKS
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  quote_id INT REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, quote_id)
);

-- --------------------------------------------------------
-- TABLE 7: FOLLOWS
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.follows (
  id SERIAL PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (follower_id, following_id)
);

-- --------------------------------------------------------
-- TABLE 8: NOTIFICATIONS
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  quote_id INT REFERENCES public.quotes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'broadcast')),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- AUTOMATIC PROFILE CREATION TRIGGER ON REGISTER
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INT := 0;
BEGIN
  -- Extract username from metadata or email
  base_username := LOWER(COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1),
    'user'
  ));
  
  -- Clean up username (replace non-alphanumeric characters with underscore)
  base_username := REGEXP_REPLACE(base_username, '[^a-z0-9_]', '', 'g');
  IF base_username = '' THEN
    base_username := 'user';
  END IF;

  final_username := base_username;

  -- Ensure username is unique
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || '_' || counter;
  END LOOP;

  INSERT INTO public.profiles (id, username, name, avatar_url)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || NEW.id::text)
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------
-- AUTO UPDATE comments_count ON QUOTES
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS TRIGGER AS $$
DECLARE
  target_quote_id INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_quote_id := OLD.quote_id;
  ELSE
    target_quote_id := NEW.quote_id;
  END IF;

  UPDATE public.quotes
  SET comments_count = (
    SELECT COUNT(*) FROM public.comments WHERE quote_id = target_quote_id
  )
  WHERE id = target_quote_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_change ON public.comments;
CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comments_count();

-- --------------------------------------------------------
-- AUTO UPDATE likes_count AND dislikes_count ON QUOTES
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_votes_count()
RETURNS TRIGGER AS $$
DECLARE
  target_quote_id INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_quote_id := OLD.quote_id;
  ELSE
    target_quote_id := NEW.quote_id;
  END IF;

  UPDATE public.quotes
  SET
    likes_count = (
      SELECT COUNT(*) FROM public.votes WHERE quote_id = target_quote_id AND vote_type = 'like'
    ),
    dislikes_count = (
      SELECT COUNT(*) FROM public.votes WHERE quote_id = target_quote_id AND vote_type = 'dislike'
    )
  WHERE id = target_quote_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vote_change ON public.votes;
CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.update_votes_count();

-- --------------------------------------------------------
-- RLS POLICIES (Row Level Security)
-- --------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Public read access for main tables
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON public.categories;
CREATE POLICY "Public categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public approved quotes are viewable by everyone" ON public.quotes;
CREATE POLICY "Public approved quotes are viewable by everyone" ON public.quotes FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Public comments are viewable by everyone" ON public.comments;
CREATE POLICY "Public comments are viewable by everyone" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public votes are viewable by everyone" ON public.votes;
CREATE POLICY "Public votes are viewable by everyone" ON public.votes FOR SELECT USING (true);

-- Authenticated User policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated users can create quotes" ON public.quotes;
CREATE POLICY "Authenticated users can create quotes" ON public.quotes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own quotes" ON public.quotes;
CREATE POLICY "Users can update own quotes" ON public.quotes FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own quotes" ON public.quotes;
CREATE POLICY "Users can delete own quotes" ON public.quotes FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can comment" ON public.comments;
CREATE POLICY "Authenticated users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can vote" ON public.votes;
CREATE POLICY "Users can manage own votes" ON public.votes FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can bookmark" ON public.bookmarks;
CREATE POLICY "Authenticated users can bookmark" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can follow" ON public.follows;
CREATE POLICY "Authenticated users can follow" ON public.follows FOR ALL USING (auth.uid() = follower_id);

-- Notifications RLS Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
CREATE POLICY "Authenticated users can create notifications" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- TABLE 9: COLLECTIONS (Album / Playlist Kutipan)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.collections (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  cover_gradient TEXT NOT NULL DEFAULT 'from-indigo-600 to-blue-700',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- TABLE 10: COLLECTION_ITEMS
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.collection_items (
  id SERIAL PRIMARY KEY,
  collection_id INT REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  quote_id INT REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (collection_id, quote_id)
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public or own collections are viewable" ON public.collections;
CREATE POLICY "Public or own collections are viewable" ON public.collections
  FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own collections" ON public.collections;
CREATE POLICY "Users can insert own collections" ON public.collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own collections" ON public.collections;
CREATE POLICY "Users can update own collections" ON public.collections
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own collections" ON public.collections;
CREATE POLICY "Users can delete own collections" ON public.collections
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Collection items viewable if collection viewable" ON public.collection_items;
CREATE POLICY "Collection items viewable if collection viewable" ON public.collection_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage items in own collections" ON public.collection_items;

DROP POLICY IF EXISTS "Users can insert items to own collections" ON public.collection_items;
CREATE POLICY "Users can insert items to own collections" ON public.collection_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete items from own collections" ON public.collection_items;
CREATE POLICY "Users can delete items from own collections" ON public.collection_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );
