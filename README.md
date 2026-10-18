# DineDirect — Dual Micro-Frontend Next.js Architecture

A modern, high-performance **Next.js App Router (TypeScript)** platform hosting **TWO MICRO FRONTENDS** in a single unified codebase:
1. **Customer Micro App:** Public, guest-first digital dining, table ordering, takeaway, and delivery.
2. **Admin Micro App:** Auth-gated, restaurant-owner-only command center, live Kitchen Kanban board, and menu inventory studio.

---

## 1. Micro-Frontend Structure & Isolation Contract

The project strictly enforces architectural isolation between the Customer and Admin micro-frontends through tooling, not convention.

```
src/
├── app/
│   ├── layout.tsx                   # Global Root Layout (Inter font, QueryClientProvider, Toaster)
│   ├── globals.scss                 # Base resets + font setup ONLY (imports theme.scss)
│   ├── providers.tsx                # Single QueryClientProvider + Toaster
│   ├── (customer)/                  # Customer Micro-Frontend (resolves at / without prefix)
│   │   ├── layout.tsx               # Customer shell: Header + Cart Drawer Provider
│   │   ├── layout.module.scss
│   │   ├── page.tsx                 # Menu home (/)
│   │   ├── page.module.scss
│   │   ├── checkout/page.tsx        # Checkout (/checkout)
│   │   └── orders/page.tsx          # Live order tracking (/orders)
│   ├── (admin)/                     # Admin Micro-Frontend
│   │   ├── admin/
│   │   │   ├── layout.tsx           # Server-side auth gate + Admin Shell
│   │   │   ├── layout.module.scss
│   │   │   ├── dashboard/page.tsx   # Owner Dashboard (/admin/dashboard)
│   │   │   ├── orders/page.tsx      # Kitchen Kanban (/admin/orders)
│   │   │   └── menu/page.tsx        # Menu Studio (/admin/menu)
│   │   └── login/
│   │       ├── page.tsx             # Owner Login (/login)
│   │       └── page.module.scss
│   └── api/
│       ├── auth/[...nextauth]/route.ts # NextAuth v5 Route Handler
│       └── me/route.ts              # Normalized session endpoint for TanStack Query
├── components/
│   ├── ui/                          # Pure presentational primitives (folder-based + barrel index.ts)
│   │   ├── button/                  # button.tsx, button.module.scss, index.ts
│   │   ├── card/                    # card.tsx, card.module.scss, index.ts
│   │   ├── badge/                   # badge.tsx, badge.module.scss, index.ts
│   │   ├── input/                   # input.tsx, input.module.scss, index.ts
│   │   ├── sheet/                   # sheet.tsx, sheet.module.scss, index.ts
│   │   ├── tabs/                    # tabs.tsx, tabs.module.scss, index.ts
│   │   ├── radio-group/             # radio-group.tsx, radio-group.module.scss, index.ts
│   │   ├── select/                  # select.tsx, select.module.scss, index.ts
│   │   ├── switch/                  # switch.tsx, switch.module.scss, index.ts
│   │   ├── dialog/                  # dialog.tsx, dialog.module.scss, index.ts
│   │   ├── sonner/                  # sonner.tsx, sonner.module.scss, index.ts
│   │   ├── veg-tag/                 # veg-tag.tsx, veg-tag.module.scss, index.ts
│   │   ├── status-pill/             # status-pill.tsx, status-pill.module.scss, index.ts
│   │   └── stepper/                 # stepper.tsx, stepper.module.scss, index.ts
│   ├── customer/                    # Customer-only components
│   │   ├── customer-header/         # customer-header.tsx, customer-header.module.scss, index.ts
│   │   ├── customer-shell/          # customer-shell.tsx, customer-shell.module.scss, index.ts
│   │   └── cart-drawer-provider/    # cart-drawer-provider.tsx, cart-drawer-provider.module.scss, index.ts
│   └── admin/                       # Admin-only components
│       ├── admin-shell/             # admin-shell.tsx, admin-shell.module.scss, index.ts
│       └── admin-nav/               # admin-nav.tsx, admin-nav.module.scss, index.ts
├── lib/
│   ├── db.ts                        # Prisma singleton client
│   ├── utils.ts                     # cn() class utility
│   ├── shared/                      # Pure formatters and domain constants
│   ├── customer/                    # Customer API calls and query hooks
│   ├── admin/                       # Admin API calls and mutation hooks
│   └── auth/                        # TanStack Query auth hooks (Part 2)
│       ├── use-session-query.ts
│       ├── use-sign-in-mutation.ts
│       └── use-sign-out-mutation.ts
├── store/
│   └── cart.ts                      # Zustand + Persist (Customer Cart ONLY)
└── styles/
    └── theme.scss                   # Single parent theme configuration (tokens, scales, :root)
```

### Tooling-Enforced Boundary Rules (.eslintrc.json)
- **Customer micro-app** cannot import anything from `components/admin/**`.
- **Admin micro-app** cannot import anything from `components/customer/**`.
- Both apps may only consume shared UI primitives from `components/ui/**`, formatters from `lib/shared/**`, and domain utilities from `lib/`.

---

## 2. Strict Styling Rules & Design System

The application strictly forbids CSS-in-JS, inline styles, and Tailwind utility classes in JSX.

1. **SCSS Modules Only:** Every component must have a co-located `<name>.module.scss`.
2. **Kebab-Case Naming:** Every file is strictly `kebab-case` (`dish-card.tsx`, `dish-card.module.scss`).
3. **Single Theme Authority (`styles/theme.scss`):**
   - Every module imports theme tokens via `@use '@/styles/theme' as theme;`.
   - Never hardcode hex values, radii, or shadow strings directly in module files.
4. **No Inline Styles:** `style={{ ... }}` is strictly forbidden and rejected at build time by ESLint AST selectors (`JSXAttribute[name.name='style']`).
5. **No Tailwind in JSX:** All styling is encapsulated inside SCSS modules.

---

## 3. Authentication & TanStack Query Mediator Contract

Client-side session state is mediated solely by **TanStack Query** under query key `['session']`.

- **Single Client Source of Truth:** `['session']` cache populated via `GET /api/me`.
- **No Direct `useSession()`:** No component imports or calls `useSession()` from `next-auth/react`. All reads use `useSessionQuery()`.
- **No Storage for Auth:** Neither `localStorage` nor `sessionStorage` is touched for auth state or tokens.
- **Zustand is Cart-Only:** `store/cart.ts` handles customer cart persistence. No auth stores exist in Zustand.
- **Single QueryClientProvider:** Mounted exclusively at `app/layout.tsx` via `app/providers.tsx`.
- **Mutations:**
  - `useSignInMutation()`: Performs credentials sign-in, invalidates `['session']`, and triggers `router.refresh()`.
  - `useSignOutMutation()`: Signs out, clears query data, invalidates `['session']`, refreshes router, and redirects to `/login`.
- **Defense in Depth:**
  - `middleware.ts`: First gate intercepts `/admin/:path*` and redirects unauthenticated or non-owner users to `/login`.
  - `app/(admin)/admin/layout.tsx`: Second gate validates session server-side via `auth()`.

---

## 4. Getting Started & Verification

### Install Dependencies & Generate Prisma Client
```bash
npm install
npx prisma generate
```

### Seed Test Accounts
```bash
npx tsx prisma/seed.ts
```
Seeded credentials:
- **Restaurant Owner:** `owner@dinedirect.com` / `owner123`
- **Customer (Test):** `customer@dinedirect.com` / `customer123`

### Run Development Server
```bash
npm run dev
```

### Verification Checklist
1. Visit `http://localhost:3000/` → Serves customer micro app (guest-first menu shell).
2. Visit `http://localhost:3000/admin/dashboard` while signed out → Redirects to `http://localhost:3000/login`.
3. Sign in with `owner@dinedirect.com` / `owner123` → Redirects to `/admin/dashboard`; sidebar displays owner name.
4. Refresh browser → Remains signed in (cookie + TanStack Query refetch, zero local storage used).
5. Click "Sign Out" in admin sidebar → Session cache cleared and redirected to `/login`.
6. Run `npm run lint` → Verifies cross-import boundary restrictions and no inline styles.
