<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes -- APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md -- Lunarys V2 Engineering Guidelines

This repository is **Lunarys V2**, a modern web application built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **TypeScript**. These guidelines reflect senior fullstack engineering standards: clean code, maintainability, scalability, and production-readiness.

---

## Tech Stack & Dependencies

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | `16.2.11` |
| UI Library | React / React DOM | `19.2.4` |
| Styling | Tailwind CSS (PostCSS) | `^4` |
| Language | TypeScript | `^5` (strict) |
| Database | Supabase (PostgreSQL + Auth + RLS) | Latest |
| Linter | ESLint + eslint-config-next | `^9` |

---

## Common Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Compile production bundle (always validate before deploy)
npm run start    # Serve production build
npm run lint     # Run ESLint checks (must pass before any commit)
npx tsc --noEmit # TypeScript type-check (must pass with 0 errors)
```

---

## Project Structure

```text
lunarysv2/
├── app/                    # Next.js App Router -- routes, pages, layouts
│   ├── (auth)/             # Route group: auth pages (login, register)
│   ├── admin/              # Admin portal (protected by role check)
│   ├── quotes/             # Quote pages: [id], [id]/edit, create
│   ├── globals.css         # Tailwind v4 @import + global CSS custom properties
│   ├── layout.tsx          # Root layout: font, Supabase session, Navbar, Sidebar
│   └── page.tsx            # Home feed page
├── components/
│   ├── layout/             # Navbar, Sidebar, Footer
│   ├── quote/              # QuoteCard, ReportDialog
│   └── ui/                 # Reusable UI primitives (ToasterProvider, etc.)
├── services/               # All Supabase data-fetching logic (NOT in components)
├── types/                  # Shared TypeScript interfaces & types
├── utils/supabase/         # Supabase client helpers (server, client, middleware)
├── supabase/               # SQL schema, migrations, seed data
├── public/                 # Static assets
├── AGENTS.md               # Engineering guidelines (this file)
├── next.config.ts          # Next.js config
├── postcss.config.mjs      # PostCSS for Tailwind v4
└── tsconfig.json           # TypeScript strict config
```

---

## Core Coding Conventions

### 1. Next.js 16 -- Async Dynamic APIs

`params` and `searchParams` are **Promises** in App Router. Always await or use `React.use()`:

```tsx
// Server Component
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}

// Client Component
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
}
```

### 2. Server Components vs Client Components

- Default to **Server Components** for layouts, data fetching, and non-interactive content.
- Add `'use client'` **only** when the component needs: `useState`, `useEffect`, browser APIs, or event handlers.
- Keep Client Components as **leaf nodes** -- do not wrap large trees in `'use client'` unnecessarily.

### 3. Tailwind CSS v4

- Use utility classes from Tailwind v4 directly.
- Custom design tokens are declared via `@theme inline` in `app/globals.css`.
- **Never** create `tailwind.config.js` unless explicitly required.
- Avoid arbitrary values (e.g., `w-[347px]`) -- prefer semantic spacing scales.

### 4. Typography & Fonts

- Geist Sans and Geist Mono are loaded via `next/font/google` in `app/layout.tsx`.
- Apply via `font-sans` / `font-mono` Tailwind classes.

### 5. Metadata & SEO

- Every page **must** export `metadata` or `generateMetadata()`.
- Include: `title`, `description`, `openGraph`, `robots` at minimum.

### 6. No Emojis

- **Never use emojis** anywhere in the codebase: source files, comments, JSX text, SQL, or documentation.
- Use Lucide React icons in UI components instead.

---

## Architecture & Separation of Concerns

Rule: Keep components dumb. Keep logic in services.

| Layer | Responsibility |
|-------|---------------|
| `app/` pages | UI composition, routing, page-level state |
| `components/` | Reusable presentational UI, minimal logic |
| `services/` | All Supabase queries, business logic, data transforms |
| `types/` | Shared TypeScript interfaces -- single source of truth |
| `utils/supabase/` | Auth/session helpers only (no business logic) |

**Never** call Supabase directly from a component. Always go through `services/`.

---

## Clean Code Principles

### Naming

- **Components**: `PascalCase` (e.g., `QuoteCard`, `ReportDialog`)
- **Functions / variables**: `camelCase` (e.g., `fetchQuotes`, `isBookmarked`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_QUOTE_LENGTH`)
- **Files**: kebab-case for non-component files, PascalCase for component files
- **Booleans**: prefix with `is`, `has`, `can`, `should` (e.g., `isLoading`, `hasError`)
- Use **descriptive, intent-revealing names** -- no abbreviations, no single letters except loop indices

### Functions

- One function = one responsibility (Single Responsibility Principle)
- Max ~30 lines per function. If longer, extract sub-functions.
- Avoid side effects in data-fetching functions -- return data, throw errors
- Prefer `async/await` over `.then()` chains
- Always handle errors explicitly -- never swallow with empty `catch {}`

### Components

- Max ~150 lines per component file. If longer, split into sub-components.
- Props must be typed via explicit interfaces -- no inline `{}` typing
- Destructure props at the function signature level
- Use `React.memo()` for heavy list-item components that receive stable props
- Prefer **composition over configuration** -- small focused components over monolithic ones

### TypeScript

- Strict mode is **always on** -- no `any` unless absolutely unavoidable (add a comment explaining why)
- Define shared types in `types/` -- never duplicate type definitions
- Use `type` for unions/primitives, `interface` for object shapes
- Use `Awaited<ReturnType<typeof fn>>` for inferred async return types

---

## Security & Supabase Best Practices

- **Row Level Security (RLS) is mandatory** on all tables -- never disable it
- Never expose sensitive logic in client components -- use Server Components or API routes for privileged operations
- Never commit `.env.local` -- use `.env.example` to document required keys
- Supabase queries must always handle the `error` return value explicitly
- Use `maybeSingle()` instead of `single()` when a row may not exist (avoids throwing)
- All user-generated content must be sanitized before display

---

## Accessibility (a11y)

- All interactive elements (`button`, `a`) must have accessible labels (`aria-label` or visible text)
- Images must have meaningful `alt` text -- never empty or generic
- Maintain logical heading hierarchy (`h1` -> `h2` -> `h3`) on every page
- Ensure sufficient color contrast (WCAG AA minimum)
- Keyboard navigation must work on all interactive UI elements

---

## Performance

- Never block the main thread with heavy computation -- use `useCallback`, `useMemo` appropriately
- Use `loading="lazy"` on images and iframes below the fold
- Prefer `next/image` for all project images (auto-optimized, responsive)
- Avoid unnecessary re-renders -- profile with React DevTools before optimizing
- Paginate or virtualize long lists (quotes feed) -- never render 100+ DOM nodes at once
- Code-split large components with `React.lazy()` + `Suspense` if needed

---

## Error Handling

- Every async operation must have a `try/catch` block
- User-facing errors must use `toast.error()` with a **human-readable Indonesian message**
- Log technical errors to `console.error()` in development -- never expose stack traces to users
- Use loading skeleton states (never blank screens) while data is fetching
- Handle empty states explicitly with helpful UI messages

---

## Code Style & Formatting

- Use **2-space indentation** (enforced by ESLint)
- Trailing commas in multi-line objects and arrays
- Single quotes for strings in TypeScript/TSX
- Explicit semicolons
- No commented-out dead code in production branches
- Remove all `console.log` debug statements before committing
- **No emojis** in any file -- source code, comments, SQL, or documentation

---

## Git & Commit Standards

- Commits follow **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- Each commit should represent a single logical change
- Never commit directly to `main` -- use feature branches + pull requests
- `npm run lint` and `npx tsc --noEmit` must pass before every commit

---

## Anti-Patterns to Avoid

| Avoid | Preferred |
|-------|-----------|
| Call Supabase in components | Use `services/` functions |
| Use `any` type | Define proper types in `types/` |
| Giant monolithic components | Split into focused sub-components |
| Swallow errors silently | Handle + display errors to users |
| Hardcode strings | Use constants or i18n keys |
| Nest ternaries > 2 levels | Extract to helper functions or variables |
| `useEffect` for data fetching | Fetch in Server Components or service layer |
| Mix UI logic with data logic | Separate concerns per layer |
| Use emojis in code or comments | Use Lucide React icons in UI |

---

## Pre-Commit Checklist

Before every commit, verify:

- [ ] `npm run lint` -- 0 errors
- [ ] `npx tsc --noEmit` -- 0 type errors
- [ ] No `console.log` or debug artifacts left
- [ ] Error states and loading states are handled
- [ ] New components have proper TypeScript interfaces
- [ ] New pages export `metadata` for SEO
- [ ] RLS policies exist for any new Supabase tables
- [ ] No emojis introduced in any file
