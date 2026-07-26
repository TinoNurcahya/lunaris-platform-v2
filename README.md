<div align="center">
  <a href="#">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=40&pause=1000&color=6366F1&center=true&vCenter=true&width=800&height=100&lines=Lunarys;Platform+Kutipan+%26+Lirik+Lagu;Bagikan+Inspirasimu" alt="Typing SVG" />
  </a>

  <p align="center">
    <strong>Platform sosial untuk menulis, membagikan, dan menemukan kutipan inspiratif serta lirik lagu favorit bersama komunitas.</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/version-v0.1.0--beta-blue.svg?style=for-the-badge" alt="Version">
    <br>
    <img src="https://img.shields.io/badge/next.js%2016-%23000000.svg?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
    <img src="https://img.shields.io/badge/react%2019-%2361DAFB.svg?style=for-the-badge&logo=react&logoColor=black" alt="React">
    <img src="https://img.shields.io/badge/typescript-%233178C6.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/tailwindcss%20v4-%2306B6D4.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
    <br>
    <img src="https://img.shields.io/badge/supabase-%233FCF8E.svg?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
    <img src="https://img.shields.io/badge/resend-%23000000.svg?style=for-the-badge&logo=resend&logoColor=white" alt="Resend API">
    <img src="https://img.shields.io/badge/framer%20motion-%23E040FB.svg?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion">
    <img src="https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
    <br>
    <img src="https://img.shields.io/badge/license-Private-red?style=for-the-badge" alt="License">
    <img src="https://komarev.com/ghpvc/?username=lunarys-platform&label=Kunjungan%20Proyek&color=6366f1&style=flat-square" alt="Views">
  </p>
</div>

<hr>

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Skema Database](#skema-database)
- [Prasyarat](#prasyarat)
- [Instalasi & Setup](#instalasi--setup)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Perintah Umum](#perintah-umum)
- [Variabel Environment](#variabel-environment)
- [Arsitektur Aplikasi](#arsitektur-aplikasi)
- [Halaman & Rute](#halaman--rute)
- [Komponen](#komponen)
- [Konvensi Kode](#konvensi-kode)
- [Lisensi](#lisensi)

---

## Fitur Utama

### Pengguna & Autentikasi
- **Registrasi & Login Email** -- Autentikasi email/password melalui Supabase Auth
- **Google OAuth Login** -- Fitur *Sign in with Google* instan 1-klik dengan pembuatan username unik otomatis
- **Profil Pengguna** -- Avatar (DiceBear), bio, statistik pengikut, level & XP
- **Edit Profil** -- Ubah nama tampilan, username, bio, dan avatar URL
- **Follow / Unfollow** -- Sistem ikuti antar pengguna dengan daftar pengikut & mengikuti
- **Pengaturan Akun** -- Ubah kata sandi, preferensi notifikasi, dan privasi profil

### Koleksi & Playlist Kutipan
- **Koleksi Publik & Privat (`/collections`)** -- Buat album/playlist kutipan bertema (seperti Playlist Spotify)
- **Modal Simpan ke Koleksi** -- Tambah/hapus kutipan dari koleksi atau buat koleksi baru secara instan dari kartu kutipan
- **Koleksi Bergradien** -- Sampul album dinamis dengan gradien warna pilihan

### Kutipan & Konten
- **Buat Kutipan** -- Editor kutipan dengan pemilih kategori dan warna latar
- **Lampiran Lagu** -- Sertakan judul lagu, artis, cuplikan lirik, dan tautan Spotify (dengan player embed otomatis)
- **Edit & Hapus** -- Pemilik kutipan dapat mengedit atau menghapus kutipan mereka
- **Pin Kutipan** -- Sematkan kutipan favorit di bagian atas profil
- **Kutipan Hari Ini** -- Sorotan kutipan terpilih sebagai Quote of the Day
- **Reader View & Ambient Audio** -- Mode baca fokus tanpa gangguan dilengkapi **Pemutar Audio Suasana** (Hujan Tenang, Ombak Laut, Angin Malam, Lo-Fi Melodi) dengan pengatur volume & animasi wave
- **Ekspor Gambar & Wallpaper Estetik** -- Unduh kutipan sebagai gambar dengan pilihan rasio (1:1 / 9:16), font, tema gradien, atau **wallpaper foto estetik** + **fitur unggah foto kustom dari galeri sendiri** + pengatur transparansi overlay (opacity)

### Interaksi Sosial
- **Like / Dislike** -- Sistem voting dengan penghitungan otomatis via database trigger
- **Komentar Berjenjang** -- Komentar dengan dukungan balasan bertingkat (nested replies)
- **Bookmark** -- Simpan kutipan favorit untuk dibaca nanti
- **Notifikasi** -- Pemberitahuan real-time untuk like, komentar, follow, dan broadcast admin

### Bantuan & Hubungi Kami
- **Pusat Bantuan FAQ (`/faq`)** -- Halaman FAQ interaktif dengan pencarian kata kunci dan filter kategori
- **Formulir Hubungi Kami (`/contact`)** -- Formulir pengiriman pesan langsung yang terintegrasi dengan **Resend API** untuk penerimaan email ke inbox pengembang
- **Salin Email 1-Klik** -- Salin alamat email dukungan (`tinonurcahya.ti@gmail.com`) dengan mudah

### Pencarian & Navigasi
- **Pencarian Dedicated** -- Halaman pencarian lengkap dengan tab filter (Semua, Kutipan, Pengguna, Lagu)
- **Command Palette** -- Pencarian cepat global dengan shortcut keyboard (Ctrl+K) dan tombol pencarian mobile
- **Mobile Bottom Navigation Bar** -- Bar navigasi bawah melayang khusus smartphone untuk akses cepat ke Beranda, Kategori, + Buat, Koleksi, dan Leaderboard
- **Kategori** -- Jelajahi kutipan berdasarkan kategori dengan ikon dan deskripsi
- **Filter & Sorting** -- Sortir kutipan berdasarkan terbaru, terpopuler, pilihan hari ini, atau yang menyertakan musik

### Gamifikasi
- **Sistem XP & Level** -- Pengguna mendapatkan poin pengalaman dari interaksi
- **Leaderboard** -- Papan peringkat pengguna berdasarkan skor XP dengan visualisasi grafik
- **Lencana Pencapaian** -- Badge otomatis berdasarkan milestone aktivitas pengguna
- **Analitik Profil** -- Statistik performa kutipan, tren interaksi, dan distribusi kategori

### Portal Admin
- **Ringkasan Dashboard** -- Statistik keseluruhan platform dengan sparkline grafik tren
- **Moderasi Kutipan** -- Tinjau, setujui, tolak, edit, dan hapus kutipan pengguna
- **Laporan Pengaduan** -- Kelola laporan konten dengan tautan langsung ke kutipan terlaporkan
- **Kelola Kategori** -- CRUD kategori dengan pemilih ikon, badge warna, dan jumlah kutipan
- **Kelola Pengguna** -- Daftar semua pengguna, lihat profil, dan ubah peran (user/admin)
- **Broadcast Pengumuman** -- Kirim notifikasi massal ke seluruh pengguna platform

### Tampilan & UX
- **Dark / Light Theme** -- Tema gelap dan terang dengan transisi halus, diingat per sesi
- **Full Mobile Responsive** -- Desain teroptimasi 100% untuk smartphone, tablet, dan desktop ultra-wide
- **Animasi Halus** -- Micro-interactions menggunakan Framer Motion
- **Desain Premium** -- Glassmorphism, gradien, dan tipografi modern (Geist Sans/Mono)

---

## Tech Stack

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Framework | Next.js (App Router) | `16.2.11` |
| UI Library | React / React DOM | `19.2.4` |
| Styling | Tailwind CSS (PostCSS) | `^4` |
| Language | TypeScript | `^5` (strict mode) |
| Database & Auth | Supabase (PostgreSQL + Auth + RLS) | Latest |
| Email Service | Resend API | `^4.1.2` |
| Animation | Framer Motion | `^12.42.2` |
| Icons | Lucide React | `^1.25.0` |
| Toast | Sonner | `^2.0.7` |
| Image Export | html-to-image | `^1.11.13` |
| Class Utils | clsx + tailwind-merge | Latest |
| Linter | ESLint + eslint-config-next | `^9` |

---

## Struktur Proyek

```text
lunarysv2/
|-- app/                          # Next.js App Router -- rute & halaman
|   |-- (auth)/                   # Route group: halaman autentikasi
|   |   |-- login/page.tsx        # Halaman login (Email + Google OAuth)
|   |   |-- register/page.tsx     # Halaman registrasi (Email + Google OAuth)
|   |-- admin/                    # Portal admin (dilindungi peran admin)
|   |   |-- layout.tsx            # Layout admin dengan sidebar navigasi
|   |   |-- page.tsx              # Dashboard ringkasan admin
|   |   |-- broadcast/page.tsx    # Broadcast pengumuman
|   |   |-- categories/page.tsx   # Kelola kategori
|   |   |-- quotes/page.tsx       # Moderasi kutipan
|   |   |-- reports/page.tsx      # Laporan pengaduan
|   |   |-- users/page.tsx        # Kelola pengguna
|   |-- api/                      # Route Handlers API Server
|   |   |-- contact/route.ts      # API Endpoint pengiriman email via Resend
|   |-- auth/                     # Callback OAuth Supabase
|   |   |-- callback/route.ts     # Route handler penukaran OAuth code ke session
|   |-- bookmarks/page.tsx        # Daftar kutipan tersimpan
|   |-- categories/page.tsx       # Jelajahi semua kategori
|   |-- collections/              # Rute koleksi & playlist kutipan
|   |   |-- page.tsx              # Jelajahi koleksi publik & koleksi saya
|   |   |-- [id]/page.tsx         # Detail koleksi & daftar kutipan
|   |-- contact/page.tsx          # Halaman Hubungi Kami
|   |-- faq/page.tsx              # Halaman Pusat Bantuan & FAQ
|   |-- leaderboard/page.tsx      # Papan peringkat XP
|   |-- notifications/page.tsx    # Pusat notifikasi
|   |-- profile/[username]/       # Halaman profil pengguna
|   |-- quotes/                   # Rute kutipan
|   |   |-- create/page.tsx       # Buat kutipan baru
|   |   |-- [id]/page.tsx         # Detail & komentar kutipan
|   |   |-- [id]/edit/page.tsx    # Edit kutipan
|   |-- search/page.tsx           # Pencarian dedicated
|   |-- settings/page.tsx         # Pengaturan akun
|   |-- globals.css               # Tailwind v4 @import + CSS custom properties
|   |-- layout.tsx                # Root layout: font, session, Navbar, Sidebar, MobileNav
|   |-- page.tsx                  # Beranda -- feed kutipan utama
|
|-- components/
|   |-- collection/               # Komponen koleksi
|   |   |-- AddToCollectionModal.tsx # Modal simpan ke koleksi & buat koleksi baru
|   |-- layout/                   # Komponen tata letak
|   |   |-- Navbar.tsx            # Navigasi atas: logo, pencarian, avatar, theme toggle
|   |   |-- Sidebar.tsx           # Sidebar kiri: menu utama + badge live count
|   |   |-- MobileNav.tsx         # Bar navigasi bawah khusus smartphone
|   |   |-- Footer.tsx            # Footer halaman dengan link navigasi lengkap
|   |   |-- CommandPalette.tsx    # Modal pencarian cepat (Ctrl+K)
|   |-- profile/                  # Komponen profil pengguna
|   |   |-- AchievementBadges.tsx # Grid lencana pencapaian
|   |   |-- EditProfileModal.tsx  # Modal edit profil
|   |   |-- FollowsModal.tsx      # Modal daftar pengikut/mengikuti
|   |   |-- ProfileAnalytics.tsx  # Statistik & grafik performa profil
|   |-- quote/                    # Komponen kutipan
|   |   |-- QuoteCard.tsx         # Kartu kutipan dengan voting, bookmark, komentar, pin, koleksi, share
|   |   |-- QuoteImageModal.tsx   # Generator gambar kutipan dengan wallpaper estetik & unggah foto kustom
|   |   |-- ReaderViewModal.tsx   # Mode baca fokus dengan pemutar Ambient Audio
|   |   |-- ReportDialog.tsx      # Dialog pelaporan kutipan
|   |-- theme/
|   |   |-- ThemeProvider.tsx     # Context provider dark/light theme
|   |-- ui/
|       |-- ToasterProvider.tsx   # Provider toast notification (Sonner)
|
|-- services/                     # Layer data-fetching & business logic
|   |-- auth.ts                   # Service autentikasi (Google OAuth, SignOut)
|   |-- categories.ts             # Query kategori
|   |-- collections.ts            # Query & mutasi koleksi kutipan
|   |-- notifications.ts          # Query & mutasi notifikasi
|   |-- profile.ts                # Query & mutasi profil pengguna
|   |-- quotes.ts                 # Query & mutasi kutipan
|
|-- types/                        # TypeScript type definitions
|   |-- database.ts               # Auto-generated Supabase database types
|   |-- index.ts                  # Shared interfaces (UserProfile, QuoteItem, QuoteCollection, dll.)
|
|-- utils/supabase/               # Supabase client helpers
|   |-- client.ts                 # Browser client (Client Component)
|   |-- server.ts                 # Server client (Server Component / API)
|   |-- middleware.ts             # Supabase auth middleware
|
|-- supabase/
|   |-- schema.sql                # Full database schema, triggers, & RLS policies (termasuk collections)
|
|-- public/                       # Asset statis
|-- AGENTS.md                     # Pedoman engineering project
|-- next.config.ts                # Konfigurasi Next.js
|-- postcss.config.mjs            # PostCSS untuk Tailwind v4
|-- tsconfig.json                 # Konfigurasi TypeScript (strict)
|-- eslint.config.mjs             # Konfigurasi ESLint
|-- package.json                  # Dependencies & scripts
```

---

## Skema Database

Lunarys menggunakan **Supabase (PostgreSQL)** dengan 10 tabel utama dan Row Level Security (RLS) aktif di semua tabel.

```
profiles ──────────< quotes >────────── categories
    |                   |
    |                   |──────< comments (self-referencing untuk replies)
    |                   |
    |                   |──────< votes (like/dislike, unique per user)
    |                   |
    |                   |──────< bookmarks (unique per user)
    |                   |
    |                   |──────< collection_items >────── collections (user_id -> profiles)
    |
    |──────< follows (follower_id -> following_id)
    |
    |──────< notifications (sender_id, quote_id opsional)
```

### Tabel

| Tabel | Deskripsi |
|-------|-----------|
| `profiles` | Data pengguna: username, nama, avatar, bio, XP, level, role |
| `categories` | Kategori kutipan: nama, slug, ikon, warna |
| `quotes` | Kutipan: konten, lampiran lagu, status moderasi, penghitung interaksi |
| `comments` | Komentar bertingkat pada kutipan (self-referencing `parent_id`) |
| `votes` | Like/dislike per pengguna per kutipan (unique constraint) |
| `bookmarks` | Kutipan yang disimpan pengguna (unique constraint) |
| `collections` | Album / Playlist kutipan pengguna (nama, deskripsi, publik/privat, gradien sampul) |
| `collection_items` | Relasi kutipan dalam koleksi (unique constraint per collection & quote) |
| `follows` | Relasi follow antar pengguna (unique constraint) |
| `notifications` | Pemberitahuan: like, komentar, follow, broadcast |

### Database Triggers

- **`on_auth_user_created`** -- Otomatis membuat profil unik saat pengguna mendaftar (termasuk via Google OAuth)
- **`on_comment_change`** -- Otomatis memperbarui `comments_count` pada tabel quotes
- **`on_vote_change`** -- Otomatis memperbarui `likes_count` dan `dislikes_count` pada tabel quotes

---

## Prasyarat

Pastikan perangkat telah terinstal:

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Akun Supabase** -- [supabase.com](https://supabase.com)
- **Akun Resend (Opsional)** -- [resend.com](https://resend.com) untuk fitur pengiriman email kontak

---

## Instalasi & Setup

### 1. Clone repository

```bash
git clone https://github.com/TinoNurcahya/lunaris-platform-v2.git
cd lunaris-platform-v2
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Buat project baru di [Supabase Dashboard](https://app.supabase.com)
2. Buka **SQL Editor** dan jalankan seluruh isi file `supabase/schema.sql` untuk membuat tabel, trigger, dan RLS policies
3. Salin **Project URL** dan **anon public key** dari halaman Settings > API

### 4. Konfigurasi environment

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
```

> Jangan pernah commit file `.env.local` ke repository. File ini sudah tercantum di `.gitignore`.

---

## Menjalankan Aplikasi

### Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Production Build

```bash
npm run build
npm run start
```

---

## Perintah Umum

| Perintah | Deskripsi |
|----------|-----------|
| `npm run dev` | Jalankan development server di `localhost:3000` |
| `npm run build` | Kompilasi production bundle |
| `npm run start` | Serve production build |
| `npm run lint` | Jalankan ESLint (harus 0 error sebelum commit) |
| `npx tsc --noEmit` | Type-check TypeScript (harus 0 error) |

---

## Variabel Environment

| Variabel | Deskripsi | Wajib |
|----------|-----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase | Ya |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key Supabase | Ya |
| `RESEND_API_KEY` | API Key pengiriman email kontak dari Resend.com | Opsional |

---

## Arsitektur Aplikasi

Lunarys mengikuti pola arsitektur berlapis (*layered architecture*) untuk memisahkan tanggung jawab secara jelas:

```text
+--------------------------------------------------+
|                   app/ (Pages)                    |
|       Komposisi UI, routing, state halaman        |
+--------------------------------------------------+
                        |
+--------------------------------------------------+
|              components/ (UI Layer)               |
|      Komponen presentasi yang reusable            |
+--------------------------------------------------+
                        |
+--------------------------------------------------+
|              services/ (Data Layer)               |
|   Semua query Supabase & logika bisnis            |
+--------------------------------------------------+
                        |
+--------------------------------------------------+
|             utils/supabase/ (Infra)               |
|       Helper autentikasi & sesi Supabase          |
+--------------------------------------------------+
                        |
+--------------------------------------------------+
|                types/ (Contracts)                  |
|      Interface & type definitions bersama         |
+--------------------------------------------------+
```

---

## Halaman & Rute

| Rute | Tipe | Deskripsi |
|------|------|-----------|
| `/` | Public | Beranda -- feed kutipan utama dengan filter & sorting |
| `/login` | Public | Halaman login (Email + Google OAuth) |
| `/register` | Public | Halaman registrasi (Email + Google OAuth) |
| `/collections` | Public | Jelajahi koleksi publik & koleksi saya |
| `/collections/[id]` | Public | Detail koleksi & daftar kutipan |
| `/faq` | Public | Halaman Pusat Bantuan & FAQ dengan accordion & pencarian |
| `/contact` | Public | Halaman Hubungi Kami (Form kontak + Resend Email) |
| `/quotes/create` | Protected | Buat kutipan baru |
| `/quotes/[id]` | Public | Detail kutipan dengan thread komentar |
| `/quotes/[id]/edit` | Protected | Edit kutipan (pemilik saja) |
| `/categories` | Public | Jelajahi semua kategori |
| `/search` | Public | Pencarian kutipan, pengguna, dan lagu |
| `/leaderboard` | Public | Papan peringkat XP pengguna |
| `/profile/[username]` | Public | Halaman profil pengguna |
| `/bookmarks` | Protected | Kutipan yang disimpan |
| `/notifications` | Protected | Pusat notifikasi |
| `/settings` | Protected | Pengaturan akun & keamanan |
| `/admin` | Admin | Dashboard ringkasan admin |
| `/admin/quotes` | Admin | Moderasi kutipan |
| `/admin/reports` | Admin | Laporan pengaduan |
| `/admin/categories` | Admin | Kelola kategori |
| `/admin/users` | Admin | Kelola pengguna |
| `/admin/broadcast` | Admin | Broadcast pengumuman |

---

## Komponen

### Layout
| Komponen | Deskripsi |
|----------|-----------|
| `Navbar` | Navigasi atas dengan logo, search bar, tombol tema, dan menu avatar |
| `Sidebar` | Sidebar kiri dengan menu navigasi utama dan badge live count |
| `MobileNav` | Bar navigasi bawah melayang khusus layar smartphone |
| `Footer` | Footer halaman dengan tautan navigasi lengkap & status Vercel |
| `CommandPalette` | Modal pencarian cepat global (Ctrl+K) |

### Collection
| Komponen | Deskripsi |
|----------|-----------|
| `AddToCollectionModal` | Modal simpan ke koleksi & buat album koleksi baru |

### Quote
| Komponen | Deskripsi |
|----------|-----------|
| `QuoteCard` | Kartu kutipan dengan voting, bookmark, komentar, pin, koleksi, share |
| `QuoteImageModal` | Generator gambar kutipan dengan wallpaper foto estetik & slider opacity |
| `ReaderViewModal` | Mode baca fokus dengan pemutar Ambient Audio Synthesizer |
| `ReportDialog` | Dialog pelaporan kutipan dengan alasan |

---

## Konvensi Kode

- **TypeScript Strict** -- Tidak ada `any` kecuali benar-benar tidak bisa dihindari
- **Tailwind CSS v4** -- Utility classes langsung, custom tokens via `@theme inline`
- **Naming**: PascalCase (komponen), camelCase (fungsi/variabel), UPPER_SNAKE_CASE (konstanta)
- **Boolean naming**: Prefix `is`, `has`, `can`, `should` (contoh: `isLoading`, `hasError`)
- **Tanpa emoji** -- Gunakan Lucide React icons, bukan emoji di manapun dalam kode
- **Commit**: Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`)
- **Error handling**: Setiap operasi async memiliki `try/catch`, pesan error dalam Bahasa Indonesia

Selengkapnya dapat dibaca di [`AGENTS.md`](./AGENTS.md).

---

## Lisensi

Project ini bersifat privat dan tidak dipublikasikan di bawah lisensi open-source.

---

<p align="center">
  Dibangun dengan Next.js, Supabase, Resend, dan Tailwind CSS.
</p>
