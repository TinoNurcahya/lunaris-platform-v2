-- ========================================================
-- SCRIPT INSERT KUTIPAN & REFLEKSI DIRI KE TABLE QUOTES
-- ========================================================
-- Petunjuk: Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- Script ini secara otomatis mengambil ID user admin/pertama di tabel profiles.

DO $$
DECLARE
  target_user_id UUID;
  target_category_id INT;
BEGIN
  -- 1. Ambil User ID pertama dari tabel profiles
  SELECT id INTO target_user_id FROM public.profiles LIMIT 1;

  -- 2. Ambil Category ID (Motivasi / Pengembangan Diri / General)
  SELECT id INTO target_category_id FROM public.categories LIMIT 1;

  -- Pastikan User ID ditemukan sebelum melakukan INSERT
  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.quotes (user_id, category_id, content, mood, status, is_pinned)
    VALUES
      (
        target_user_id,
        target_category_id,
        'Suatu hari nanti ketika pemandangan ini telah berubah menjadi kenangan, aku ingin mengingat bahwa aku pernah berada di sini—masih belajar, masih bertumbuh, dan masih percaya pada masa depan.',
        'Hopeful',
        'approved',
        TRUE
      ),
      (
        target_user_id,
        target_category_id,
        'Hidup adalah tentang pilihan, proses, dan keberanian untuk melangkah meski tidak mengetahui apa yang menunggu di depan. Aku belajar bahwa tidak ada mimpi yang terlalu besar dan tidak ada pemimpi yang terlalu kecil. Kadang dunia terasa bising, karena itu aku menemukan ketenangan dalam hujan, langit, dan kesunyian yang tidak menuntut apa pun. Aku tidak ingin hanya bertahan hidup, tetapi juga memberi arti pada hidup. Dan jika suatu hari semua pemandangan ini berubah menjadi kenangan, aku ingin mengingat bahwa aku telah mencoba, terus tumbuh, dan tidak berhenti melangkah menuju masa depan yang kupilih sendiri.',
        'Reflective',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Jangan mencari keputusan yang sempurna. Carilah keputusan yang kuat, lalu buat keputusan itu menjadi benar dengan usahamu.',
        'Motivated',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Hambatan utamamu bukan keinginan, melainkan ketidakpastian terhadap kemampuan diri sendiri.',
        'Thoughtful',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Dan menurutku, ini penting: jangan membuat keputusan hidup berdasarkan ketakutan yang belum terbukti.',
        'Wise',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Aku belum tahu apakah aku mampu. Jadi aku akan mencari tahu.',
        'Determined',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Sebenarnya aku dulu mampu nggak ya? Kenapa aku bahkan nggak mencoba?',
        'Reflective',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Aku ingin yakin bahwa keputusan yang kuambil sekarang tidak akan membuatku menyesal lima atau sepuluh tahun lagi.',
        'Visionary',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Kampus mana yang memberi peluang terbaik untuk mencapai tujuan yang kuinginkan?',
        'Ambitious',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Aku ingin menjadi software engineer yang hebat, memiliki karier internasional, khususnya Jepang, sambil tetap memiliki kehidupan yang stabil.',
        'Inspired',
        'approved',
        TRUE
      ),
      (
        target_user_id,
        target_category_id,
        'Kalau aku memilih tidak lanjut kuliah, apakah aku benar-benar punya rencana yang lebih baik daripada kuliah?',
        'Thoughtful',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Aku sedang mempertimbangkan masa depanku.',
        'Peaceful',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Bagaimana kalau aku salah memilih jalur? Tapi aku sadar keraguan itu bagian dari proses keberanian.',
        'Honest',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Tapi apakah aku cukup mampu untuk menyelesaikannya?',
        'Questioning',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Aku belum tahu apakah aku mampu != Aku tidak mampu.',
        'Growth',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Apakah kuliah lanjutan memberikan keuntungan yang cukup besar dibandingkan langsung membangun karier setelah D3?',
        'Analytical',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Apa bukti yang bisa membuatku tahu apakah aku siap menghadapi level berikutnya?',
        'Focus',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Kalau ternyata aku tidak cukup pintar untuk level berikutnya, apa yang membuat kegagalan itu begitu menakutkan bagiku?',
        'Brave',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Kami sudah memberikan kesempatan kepadamu. Manfaatkan kesempatan itu dan bangun kehidupan yang baik.',
        'Grateful',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Aku akan mengambil risiko yang sudah aku pahami dan sudah aku persiapkan.',
        'Strong',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Besok aku pikirkan. Malam ini aku istirahat dulu.',
        'Calm',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Apa sebenarnya yang sedang aku takutkan?',
        'Reflective',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Kalau aku memilih ini, apakah hidupku nanti akan aman dan terarah?',
        'Thoughtful',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Aku sebenarnya sedang menuju ke mana?',
        'Searching',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Apakah jalur yang kupilih meningkatkan probabilitasku untuk mendapatkan masa depan yang kuinginkan?',
        'Strategic',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Jangan menunggu kepastian sempurna sebelum bergerak.',
        'Action',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Aku mau membawa hidupku ke arah mana?',
        'Direction',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Langkah berikutnya yang paling masuk akal apa?',
        'Practical',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Aku sudah punya dasar. Sekarang aku ingin mencoba sesuatu yang lebih sesuai dengan diriku.',
        'Confident',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Apakah pendidikan lanjutan bisa punya peran penting dalam hidupku?',
        'Curious',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Sekarang aku sudah tahu arahku dan bisa bergerak dengan lebih kuat.',
        'Empowered',
        'approved',
        FALSE
      ),
      (
        target_user_id,
        target_category_id,
        'Apakah pilihan ini masuk akal untuk orang yang ingin menjadi diriku 5–10 tahun dari sekarang?',
        'Visionary',
        'approved',
        FALSE
      );

    RAISE NOTICE 'Berhasil memasukkan 32 kutipan refleksi diri ke Supabase!';
  ELSE
    RAISE WARNING 'Tidak ditemukan profil user di database public.profiles!';
  END IF;
END $$;
