# DineDirect — Authentication & Session Mediator Architecture (AUTH.md)

This document outlines the authentication and session mediator contract for DineDirect.

---

## 1. The Core Principle: TanStack Query as the Single Client Mediator

In this application, client-side session state has exactly **ONE** source of truth:
**The TanStack Query cache under the query key `['session']`.**

```
┌────────────────────────────────────────────────────────┐
│                       Browser                          │
│                                                        │
│   Component UI                                         │
│       │                                                │
│       ├─► Read Session ────► useSessionQuery()         │
│       │                             │                  │
│       │                      TanStack Query            │
│       │                      Cache: ['session']        │
│       │                             │                  │
│       │                      fetch('/api/me')          │
│       │                                                │
│       ├─► Sign In ─────────► useSignInMutation()       │
│       │                             │                  │
│       │                      invalidateQueries         │
│       │                      ['session']               │
│       │                                                │
│       └─► Sign Out ────────► useSignOutMutation()      │
│                                     │                  │
│                              setQueryData(['session']) │
│                              invalidateQueries         │
└────────────────────────────────────────────────────────┘
```

---

## 2. Hard Conventions & Invariants

1. **No direct `useSession()` calls:**  
   Components must NEVER import or call `useSession()` from `next-auth/react`. All session reads MUST go through `useSessionQuery()`.

2. **No localStorage/sessionStorage for Auth:**  
   Auth tokens, session objects, or user credentials MUST NEVER be stored in `localStorage` or `sessionStorage`. Cookies managed by NextAuth v5 handle the server session transport.

3. **Zustand is Cart-Only:**  
   Zustand is strictly reserved for the customer cart (`store/cart.ts`). Creating any `authStore` or `userStore` in Zustand or Redux is strictly forbidden.

4. **Single Provider at Root:**  
   Exactly ONE `QueryClientProvider` exists in the application, mounted at `app/layout.tsx` via `app/providers.tsx`. Route-group layouts (`(customer)/layout.tsx`, `(admin)/layout.tsx`) must never instantiate or re-provide a query client.

5. **Server Reads vs. Mutations:**  
   Session retrieval is performed via the normalized `GET /api/me` route. Session changes (sign-in, sign-out) are executed via mutations that invalidate the `['session']` cache and trigger a Next.js `router.refresh()`.

---

## 3. The Hook Contracts

### 3.1 Session Query: `useSessionQuery()`
Located at: `src/lib/auth/use-session-query.ts`
- **Query Key:** `['session']`
- **Query Function:** Fetches `GET /api/me`
- **Stale Time:** 30,000ms (30 seconds)
- **Refetch Behavior:** Refetches automatically on window focus once stale
- **Return Signature:** `{ data, isPending, refetch }`
- **Output Type:**
  ```ts
  interface SessionData {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'CUSTOMER' | 'RESTAURANT_OWNER';
    } | null;
    isAuthenticated: boolean;
  }
  ```

### 3.2 Sign-In Mutation: `useSignInMutation()`
Located at: `src/lib/auth/use-sign-in-mutation.ts`
- Calls `signIn('credentials', { email, password, redirect: false })`
- On Success:
  1. `queryClient.invalidateQueries({ queryKey: ['session'] })`
  2. `router.refresh()`
- On Error: Throws readable error message ("Invalid email or password") to display inline.
- Does **not** write to storage.

### 3.3 Sign-Out Mutation: `useSignOutMutation()`
Located at: `src/lib/auth/use-sign-out-mutation.ts`
- Calls `signOut({ redirect: false })`
- On Success:
  1. `queryClient.setQueryData(['session'], { user: null, isAuthenticated: false })`
  2. `queryClient.invalidateQueries({ queryKey: ['session'] })`
  3. `router.refresh()`
  4. `router.push('/login')`
- Does **not** write to storage.

---

## 4. Route Protection Strategy

1. **First Gate (Edge/Middleware):**  
   `middleware.ts` intercepts all routes matching `/admin/:path*`. If the incoming request lacks an authenticated session or has a role other than `RESTAURANT_OWNER`, the user is immediately redirected to `/login?callbackUrl=...`.

2. **Second Gate (Server Component Layout):**  
   `app/(admin)/admin/layout.tsx` performs an async server-side verification using `auth()`. Unauthenticated or unauthorized visitors are redirected to `/login`.

3. **Customer Routes (Public & Guest-First):**  
   The customer micro-app (`/`, `/checkout`, `/orders`) is completely accessible without authentication. Diners can order, select tables, and browse without logging in.

---

## 5. Explicitly Forbidden Anti-Patterns

| Forbidden Anti-Pattern | Correct Pattern |
| :--- | :--- |
| `import { useSession } from 'next-auth/react'` inside components | `import { useSessionQuery } from '@/lib/auth/use-session-query'` |
| `localStorage.setItem('user', ...)` or storing tokens | Session cookies managed automatically by NextAuth v5 |
| Zustand `authStore` or `useAuth()` hook with internal state | TanStack Query cache `['session']` |
| Multiple `QueryClientProvider` instances in nested layouts | Single `QueryClientProvider` mounted in `app/layout.tsx` |
| Calling server actions directly inside `queryFn` | Use HTTP route handler `GET /api/me` |
| Retrying queries on `401` or `403` status codes | Explicitly disabled in QueryClient default retry policy |
