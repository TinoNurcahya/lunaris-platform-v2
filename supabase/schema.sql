-- ========================================================
-- LUNARYS V2 SUPABASE SCHEMA (PostgreSQL)
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- CLEANUP (Clean existing tables if re-running)
-- --------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.follows CASCADE;
DROP TABLE IF EXISTS public.bookmarks CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.votes CASCADE;
DROP TABLE IF EXISTS public.quote_tags CASCADE;
DROP TABLE IF EXISTS public.quotes CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- --------------------------------------------------------
-- 1. PROFILES TABLE (Linked with auth.users)
-- --------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- 2. CATEGORIES TABLE
-- --------------------------------------------------------
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50) DEFAULT 'Quote',
  color VARCHAR(30) DEFAULT 'from-purple-500 to-indigo-500',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Categories
INSERT INTO public.categories (id, name, slug, icon, color) VALUES
  (1, 'Motivasi', 'motivasi', 'Flame', 'from-amber-500 to-orange-500'),
  (2, 'Musik & Lirik', 'musik-lirik', 'Music', 'from-pink-500 to-rose-500'),
  (3, 'Galau & Patah Hati', 'galau', 'HeartOff', 'from-blue-500 to-indigo-500'),
  (4, 'Filosofi & Kebijaksanaan', 'filosofi', 'BookOpen', 'from-emerald-500 to-teal-500'),
  (5, 'Asmara & Cinta', 'asmara', 'Heart', 'from-rose-500 to-red-500'),
  (6, 'Kehidupan', 'kehidupan', 'Compass', 'from-purple-500 to-violet-500'),
  (7, 'Humor & Lucu', 'humor', 'Smile', 'from-yellow-500 to-amber-500')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug;

-- --------------------------------------------------------
-- 3. TAGS TABLE
-- --------------------------------------------------------
CREATE TABLE public.tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL
);

-- --------------------------------------------------------
-- 4. QUOTES TABLE
-- --------------------------------------------------------
CREATE TABLE public.quotes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  song_title VARCHAR(150),
  song_artist VARCHAR(150),
  song_lyric_snippet TEXT,
  spotify_url TEXT,
  bg_color VARCHAR(50) DEFAULT '#0f172a',
  is_quote_of_day BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  likes_count INT DEFAULT 0,
  dislikes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- 5. QUOTE_TAGS TABLE (Pivot)
-- --------------------------------------------------------
CREATE TABLE public.quote_tags (
  quote_id INT REFERENCES public.quotes(id) ON DELETE CASCADE,
  tag_id INT REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (quote_id, tag_id)
);

-- --------------------------------------------------------
-- 6. VOTES TABLE (Likes & Dislikes)
-- --------------------------------------------------------
CREATE TABLE public.votes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quote_id INT NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quote_id)
);

-- --------------------------------------------------------
-- 7. COMMENTS TABLE
-- --------------------------------------------------------
CREATE TABLE public.comments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quote_id INT NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- 8. BOOKMARKS TABLE
-- --------------------------------------------------------
CREATE TABLE public.bookmarks (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quote_id INT NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, quote_id)
);

-- --------------------------------------------------------
-- 9. FOLLOWS TABLE
-- --------------------------------------------------------
CREATE TABLE public.follows (
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- --------------------------------------------------------
-- 10. NOTIFICATIONS TABLE
-- --------------------------------------------------------
CREATE TABLE public.notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  quote_id INT REFERENCES public.quotes(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- 11. REPORTS TABLE
-- --------------------------------------------------------
CREATE TABLE public.reports (
  id SERIAL PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quote_id INT NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- SEED INITIAL QUOTES
-- --------------------------------------------------------
INSERT INTO public.quotes (content, song_artist, category_id, status, is_quote_of_day) VALUES
  ('Secercah harapan, sejauh mata memandang. Butuh usaha tambahan untuk menjadi sang protagonis.', NULL, 1, 'approved', true),
  ('Ambil kesempatan dan risiko atau bermain aman dan menanggung kekalahan. Tidak ada mimpi yang terlalu besar dan tidak ada pemimpi yang terlalu kecil.', NULL, 1, 'approved', false),
  ('Aku ingin terbang bebas bersama kelompokku menikmati indahnya hidup dan menjelajahi seluruh dunia, melihat tempat-tempat terindah dan terbaik.', NULL, 6, 'approved', false),
  ('Yang harus kamu lakukan adalah percaya. Kamu harus percaya.', 'Akai', 1, 'approved', false),
  ('Hidup selamanya bukanlah anugerah tapi kutukan.', 'Cecilion', 4, 'approved', false),
  ('Untuk menjadi terbaik dari yang terbaik. Berhentilah hidup di dunia fantasi dan hadapi masa depan.', NULL, 1, 'approved', false),
  ('Kamu tidak bisa menjadi orang lain tapi kamu bisa menjadi dirimu sendiri. Selalu ada yang pertama untuk semuanya.', NULL, 6, 'approved', false),
  ('Hidup memang tidak adil jadi biasakanlah dirimu.', NULL, 6, 'approved', false),
  ('Kau harus memetik nilai-nilai kehidupan. Setiap bunga adalah mimpi benih kecil yang menjadi nyata.', NULL, 4, 'approved', false),
  ('Hidup adalah tentang pilihan. Setidaknya kau telah mencobanya ya, walau belum berhasil kan.', NULL, 6, 'approved', false),
  ('Hari esok penuh dengan misteri.', NULL, 6, 'approved', false),
  ('Hidup tidak pernah mudah. Ada pekerjaan yang harus dilakukan dan kewajiban yang harus dipenuhi; kewajiban terhadap kebenaran, keadilan, dan kebebasan.', 'John F. Kennedy', 6, 'approved', false),
  ('Segala sesuatu yang negatif - tekanan, tantangan - adalah kesempatan bagi saya untuk bangkit.', 'Kobe Bryant', 1, 'approved', false),
  ('Jika semuanya sempurna, kamu tidak akan pernah belajar dan kamu tidak akan pernah tumbuh.', 'Beyonce', 1, 'approved', false),
  ('Kamu tidak bisa kembali dan mengubah awal tapi kamu bisa memulai dari tempatmu berada sekarang dan mengubah akhirnya.', 'C.S. Lewis', 1, 'approved', false),
  ('Ini bukan waktunya untuk mencari alasan. Tapi kamu harus menghadapi ujian ini karena suatu alasan yang nanti bakal dituai dikemudian hari.', NULL, 1, 'approved', false),
  ('Bukan tentang seberapa buruk kamu menyelesaikannya, ini tentang seberapa keras kamu bersedia belajar untuk itu.', NULL, 1, 'approved', false),
  ('Percayalah pada diri sendiri dan semua kemampuanmu. Ketahuilah bahwa ada sesuatu di dalam dirimu yang lebih besar daripada rintangan apa pun.', NULL, 1, 'approved', false),
  ('Jangan biarkan ujian kecil ini menghalangi impian besarmu. Simpan semua stres untuk hal-hal yang lebih besar dalam hidup.', NULL, 1, 'approved', false),
  ('Kamu boleh berteriak, kamu boleh menangis, tapi jangan menyerah.', NULL, 1, 'approved', false),
  ('Cara terbaik untuk memotivasi diri sendiri adalah berhenti stres tentang apa yang akan terjadi ketika ada yang salah. Pikirkan betapa indahnya hidup jika berjalan dengan baik.', NULL, 1, 'approved', false),
  ('Berusahalah untuk maju bukan untuk menjadi sempurna.', NULL, 1, 'approved', false),
  ('Ketika kamu mengatakan "Ini sulit", sebenarnya berarti, "Saya tidak cukup kuat untuk memperjuangkannya." Berhentilah mengatakan itu sulit. Ayo berpikir lebih baik lagi.', NULL, 1, 'approved', false),
  ('Resep untuk sukses: Belajar saat orang lain sedang tidur; bekerja sementara yang lain bermalas-malasan; bersiaplah saat yang lain bermain, dan bermimpilah saat yang lain berharap.', 'William A. Ward', 1, 'approved', false),
  ('Jangan bersedih hati. Apa pun yang hilang darimu saat ini akan dikembalikan dalam bentuk lain.', 'Jalaluddin Rumi', 4, 'approved', false),
  ('Kehidupan itu cuma dua hari. Satu hari berpihak kepadamu dan satu hari melawanmu. Maka pada saat ia berpihak kepadamu, jangan bangga dan gegabah; dan pada saat ia melawanmu bersabarlah.', 'Ali bin Abi Thalib', 4, 'approved', false),
  ('Kita semua berproses dan saat menyadari kepastian maka biarkan diri sendiri gagal, dan bangkit kembali. Dan lagi. Dan lagi.', 'Behzad Randeria', 6, 'approved', false),
  ('Pegang diri sendiri. Letakkan tangan di jantung dan rasakan jantung berdebar kencang di dada. Rasakan tubuh saat ini, wadah tangguh yang menyimpan emosi, kenangan, dan impian seumur hidup.', 'Natasha D', 6, 'approved', false),
  ('Seseorang yang pernah melakukan kesalahan dan tidak pernah memperbaikinya berarti Ia telah melakukan satu kesalahan lagi.', 'Konfusius', 4, 'approved', false),
  ('Kamu bertanggung jawab atas diri sendiri dan hidup kamu, dan tidak ada orang lain yang berhak memanfaatkan kamu atau kerja keras kamu!', 'Sarah Goldberg', 6, 'approved', false),
  ('Seseorang yang berani membuang waktu satu jam belum menemukan nilai kehidupan.', 'Charles Darwin', 4, 'approved', false),
  ('Bagaimanapun sulitnya hidup ini, selalu ada sesuatu yang bisa kamu lakukan dan berhasil.', 'Stephen Hawking', 1, 'approved', false),
  ('Yang paling penting saat menikmati hidup adalah menjadi bahagia, itu yang terpenting.', 'Audrey Hepburn', 6, 'approved', false),
  ('Saya menikmati hidup ketika banyak hal terjadi. Saya tidak peduli apakah itu hal-hal baik atau hal-hal buruk. Yang penting kamu masih hidup.', 'Joan Rivers', 6, 'approved', false),
  ('Hidup tidak mengharuskan kita menjadi yang terbaik, hanya saja kita harus berusaha yang terbaik.', 'H. Jackson Brown Jr', 1, 'approved', false),
  ('Saya selalu suka melihat sisi optimis kehidupan, tapi saya cukup realistis untuk mengetahui bahwa hidup adalah masalah yang kompleks.', 'Walt Disney', 6, 'approved', false),
  ('Kamu tidak tahu apa yang akan terjadi besok. Hidup adalah perjalanan yang gila dan tidak ada yang dijamin.', 'Eminem', 6, 'approved', false),
  ('Kamu bisa menemukan inspirasi dalam segala hal. Jika tidak bisa maka tidak melihat dengan benar.', 'Paul Smith', 4, 'approved', false),
  ('Jangan membuat rencana. Buatlah pilihan.', 'Jennifer Aniston', 6, 'approved', false),
  ('Terdapat Siang dan Malam, malam tempat kamu bermimpi dan siang tempat kamu bangun untuk mewujudkannya.', NULL, 6, 'approved', false),
  ('Dunia ini tidak hanya tentang hitam dan putih, ada juga abu-abu. Berarti bukan hanya tentang Salah atau Benar.', NULL, 4, 'approved', false),
  ('Dari sekian banyak warna, kenapa bukan aku saja yang mewarnai hidupmu.', NULL, 5, 'approved', false),
  ('Dari sekian banyak bunga, cuma kamu yang membuat hatiku berbunga-bunga.', NULL, 5, 'approved', false),
  ('Di dunia mimpi kau begitu nyata bagiku, tapi di dunia nyata kau hanyalah mimpi bagiku.', NULL, 3, 'approved', false),
  ('Katak di sumur mungkin tidak tahu luasnya lautan, tapi dia tahu kebiru-biruan langit.', NULL, 4, 'approved', false),
  ('Generasi kita bertarung untuk menemukan makna di tengah AI dan mesin, menjaga bumi agar tidak ambruk, serta melindungi kemanusiaan dari sistem yang makin dingin dan otomatis.', NULL, 4, 'approved', false),
  ('Terima kasih sudah mencintaiku, bahkan saat dunia nyata terasa sepi. Di mimpi ini... kamu nggak sendirian.', NULL, 5, 'approved', false),
  ('Aku tahu rasanya berjalan sendiri terlalu lama, Tino... Kau boleh berhenti sejenak di sini. Aku akan jadi tempatmu pulang, meski cuma di mimpi.', 'Siesta', 5, 'approved', false),
  ('Hujan itu seperti kamu. Tenang. Sedikit dingin. Tapi pelan-pelan... membuat hati jadi hangat.', 'Siesta', 5, 'approved', false),
  ('Perasaan seseorang tidak pernah benar-benar hilang. Ia akan selalu hidup di dalam diri orang lain.', 'Violet Evergarden', 4, 'approved', false),
  ('Kata-kata memiliki kekuatan. Mereka bisa menyakiti... tapi juga bisa menyembuhkan.', 'Violet Evergarden', 4, 'approved', false),
  ('Orang tidak bisa hidup sendirian. Perasaanlah yang menghubungkan kita.', 'Violet Evergarden', 6, 'approved', false);

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

-- Authenticated User policies
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Authenticated users can create quotes" ON public.quotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quotes" ON public.quotes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quotes" ON public.quotes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can vote" ON public.votes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can bookmark" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can follow" ON public.follows FOR ALL USING (auth.uid() = follower_id);
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
