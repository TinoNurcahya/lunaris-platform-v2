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
  likes_count INT NOT NULL DEFAULT 0,
  dislikes_count INT NOT NULL DEFAULT 0,
  comments_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_quote_of_day BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
BEGIN
  INSERT INTO public.profiles (id, username, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || NEW.id::text)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public approved quotes are viewable by everyone" ON public.quotes FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);
CREATE POLICY "Public comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public votes are viewable by everyone" ON public.votes FOR SELECT USING (true);

-- Authenticated User policies
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Authenticated users can create quotes" ON public.quotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quotes" ON public.quotes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quotes" ON public.quotes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can vote" ON public.votes;
CREATE POLICY "Users can manage own votes" ON public.votes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can bookmark" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);
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
