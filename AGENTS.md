<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — lunarysv2 Guidelines

This repository is **Lunarys V2**, a modern web application built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **TypeScript**.

---

## 🛠 Tech Stack & Dependencies

- **Framework**: Next.js `16.2.11` (App Router)
- **UI Library**: React `19.2.4` / React DOM `19.2.4`
- **Styling**: Tailwind CSS `^4` (using PostCSS `@tailwindcss/postcss` and `@import "tailwindcss";`)
- **Language**: TypeScript `^5` with strict checking enabled (`tsconfig.json`)
- **Linter**: ESLint `^9` with `eslint-config-next`

---

## 🚀 Common Commands

Run all commands from the repository root:

- **Development Server**: `npm run dev` (starts dev server at `http://localhost:3000`)
- **Build**: `npm run build` (compiles production bundle)
- **Start Production**: `npm run start` (serves production build)
- **Lint**: `npm run lint` (runs ESLint checks)

---

## 📐 Project Structure

```text
lunarysv2/
├── app/                  # Next.js App Router routes, pages, and layouts
│   ├── globals.css       # Tailwind v4 import & global CSS custom properties
│   ├── layout.tsx        # Root layout with Geist font configuration
│   └── page.tsx          # Main entry page
├── public/               # Static assets (images, SVGs, icons)
├── AGENTS.md             # Instructions & guidelines for AI agent interactions
├── next.config.ts        # Next.js configuration
├── package.json          # Package dependencies & scripts
├── postcss.config.mjs    # PostCSS configuration for Tailwind v4
└── tsconfig.json         # TypeScript configuration
```

---

## 💡 Important Coding Conventions & Rules

### 1. Next.js 16 Async Dynamic APIs
In Next.js 16 App Router, route properties such as `params` and `searchParams` are **Promises**. Always `await` them in Server Components, or use `React.use()` in Client Components:
```tsx
// Server Component Example
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  return <div>Item ID: {id}</div>;
}
```

### 2. Server Components vs Client Components
- Default to **Server Components** for page layouts, data fetching, and static content.
- Use `'use client';` directive strictly at the top of files that require state (`useState`, `useReducer`), effects (`useEffect`), browser APIs, or interactive event handlers.

### 3. Tailwind CSS v4 Usage
- Styling is powered by Tailwind v4.
- Custom colors and font variables are configured via `@theme inline` in [app/globals.css](file:///d:/PORTFOLIO/lunarysv2/app/globals.css).
- Avoid creating a legacy `tailwind.config.js` unless explicitly required.

### 4. Typography & Fonts
- Geist Sans and Geist Mono are set up using `next/font/google` in [app/layout.tsx](file:///d:/PORTFOLIO/lunarysv2/app/layout.tsx).
- Use Tailwind font utility classes (`font-sans`, `font-mono`) to apply them.

### 5. Metadata & SEO
- Every page/layout should provide clear SEO metadata via `export const metadata: Metadata = ...` or `generateMetadata()`.
