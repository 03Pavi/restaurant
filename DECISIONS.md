# DineDirect — Architectural Decisions Record (DECISIONS.md)

This log documents all structural, architectural, and design decisions made while establishing the foundation for the DineDirect dual micro-frontend Next.js App Router project.

---

## Decision 1: Next.js Route-Group Isolation for Dual Micro-Frontends
- **Context:** The application hosts two distinct micro-frontends: a public, guest-first customer micro-app and an auth-gated restaurant owner admin micro-app.
- **Decision:** Route groups `(customer)` and `(admin)` are used within the Next.js App Router (`src/app/`).
  - The customer micro-app resolves at `/` without any URL prefix.
  - The admin micro-app is scoped under `/admin` (`src/app/(admin)/admin/`).
  - The login interface is mounted at `/login` (`src/app/(admin)/login/`).
- **Rationale:** Route groups provide clean physical separation without adding unwanted path segments to customer URLs, while allowing completely independent layout hierarchies and error/loading boundaries.

---

## Decision 2: Tooling-Enforced Boundaries via ESLint
- **Context:** Micro-frontends often suffer from accidental cross-boundary component leakage when enforced solely by team convention.
- **Decision:** Implemented ESLint `no-restricted-imports` with pattern matching forbidding any cross-import between `components/customer/**` and `components/admin/**`.
- **Enforcement:**
  - Customer app cannot import admin components.
  - Admin app cannot import customer components.
  - Both micro-frontends may only import shared primitives from `components/ui/**`, formatters/constants from `lib/shared/**`, and domain utilities from `lib/`.

---

## Decision 3: Styling Contract — SCSS Modules with Single Parent Theme
- **Context:** Needed a strict, maintainable styling system with zero runtime CSS-in-JS overhead, no ad-hoc Tailwind classes in JSX, and consistent theme tokens.
- **Decision:**
  - `styles/theme.scss` is the single parent theme config.
  - Every component has a co-located kebab-case `<name>.module.scss` that imports theme via `@use '@/styles/theme' as theme;`.
  - All hex colors, border-radii, elevation shadows, and spacing scales are referenced as theme tokens or CSS variables.
  - `:root` custom properties and shadcn root aliases are defined within `styles/theme.scss` via `@mixin root-tokens` and emitted globally inside `app/globals.scss`. This prevents Webpack CSS module purity errors ("Selector :root is not pure") while ensuring no token definitions ever live outside `theme.scss`.
  - Inline `style={{ ... }}` attributes are strictly forbidden and flagged at build time via ESLint `no-restricted-syntax` (`JSXAttribute[name.name='style']`) and `react/forbid-dom-props`.

---

## Decision 4: Single Client-Side Session Authority (TanStack Query Mediator)
- **Context:** Managing authentication across micro-frontends without race conditions, token desync, or redundant storage listeners.
- **Decision:**
  - TanStack Query acts as the sole client-side mediator for session state under query key `['session']`.
  - No component reads `localStorage` or `sessionStorage` for auth.
  - Zustand is forbidden for auth and dedicated strictly to customer cart state (`store/cart.ts`).
  - No component calls `useSession()` directly from `next-auth/react`.
  - All session reads use `useSessionQuery()`.
  - All session mutations use `useSignInMutation()` and `useSignOutMutation()`, which mutate session server-side and invalidate `['session']` cache with automatic router refresh.
  - Exactly one `QueryClientProvider` is mounted at the root (`app/layout.tsx`).

---

## Decision 5: Defense-in-Depth Admin Route Protection
- **Context:** Protecting restaurant operations and kitchen telemetry from unauthorized or non-owner access.
- **Decision:**
  - **First Gate (Edge/Middleware):** `middleware.ts` intercepts `/admin/:path*` requests and redirects unauthenticated or non-owner (`role !== 'RESTAURANT_OWNER'`) visitors to `/login`.
  - **Second Gate (Layout):** `app/(admin)/admin/layout.tsx` validates session server-side via `auth()` before rendering the admin shell.
  - **Customer Routes:** Public and guest-first; no auth gating applied.

---

## Decision 6: NextAuth v5 + Prisma PostgreSQL + Credentials Provider
- **Context:** Secure credentials authentication for restaurant owners without user enumeration.
- **Decision:**
  - Configured NextAuth v5 (Auth.js) with `PrismaAdapter` and JWT session strategy (`strategy: 'jwt'`).
  - NextAuth configuration is partitioned into `auth.config.ts` (Edge-compatible callbacks, pages, session strategy) for `middleware.ts`, and `auth.ts` (adding PrismaAdapter, bcrypt Credentials provider) for Node.js runtime. This prevents Node.js-only modules (`crypto`, `bcryptjs`, `@prisma/client`) from breaking Edge middleware execution.
  - Credentials provider verifies bcrypt-hashed passwords.
  - Authorize returns `null` identically for missing user and invalid password to prevent user enumeration.
  - User role (`RESTAURANT_OWNER` vs `CUSTOMER`) is baked into JWT token and augmented on `session.user`.

---

## Decision 7: Environment Configuration Cleanup
- **Context:** Unused legacy Supabase and Firebase keys were present in `.env.local`.
- **Decision:** Purged all legacy Supabase and Firebase keys. Kept only `AUTH_SECRET`, `AUTH_TRUST_HOST`, `DATABASE_URL`, and core app metadata variables.
- **Rationale:** Ensures clean environment surface area aligned strictly with the NextAuth v5 + Prisma PostgreSQL specification.

---

## Decision 8: Folder-Based Component Architecture with Barrel Exports
- **Context:** Flat component files inside `components/ui/`, `components/customer/`, and `components/admin/` crowded directories as components grew with styles and assets.
- **Decision:** Restructured every component into its own dedicated kebab-case folder containing:
  - `<component-name>.tsx`
  - `<component-name>.module.scss`
  - `index.ts` (re-exporting everything from the component)
- **Rationale:** Encapsulates component styles and logic while preserving clean external alias imports (e.g., `import { Button } from '@/components/ui/button'`) without requiring path updates across consumers.

---

## Decision 9: Phase 3A — Admin Menu Studio & Dual Cloud Integration
- **Context:** Admin Menu Studio requires live category/dish inventory control, instant stock availability toggling, Supabase PostgreSQL connection pooling, and Firebase client initialization.
- **Decision:**
  - Configured Supabase with pooled `DATABASE_URL` and `DIRECT_URL` in `prisma/schema.prisma`.
  - Initialized Firebase Auth client in `src/lib/firebase/client.ts` using `NEXT_PUBLIC_FIREBASE_*` variables.
  - Enforced strict client bundle-size rules (zero default `React` imports, named imports only).
  - Implemented 5 dedicated API routes under `app/api/admin/menu/` guarded with `RESTAURANT_OWNER` verification.
  - Implemented TanStack Query hooks in `lib/admin/use-menu-management.ts` with instant query invalidation on mutation success.
  - Built modular Admin UI components: `DishCard`, `DishFormModal`, `CategoryFormModal`, and `MenuManager`.
