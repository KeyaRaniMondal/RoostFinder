# RoostFinder — Architecture & Frontend↔Backend Connection Guide

This document explains the complete architecture of RoostFinder, how the Next.js frontend is wired to the Express + Prisma backend, and how each screen in the UI maps to a specific backend route, controller, and service.

---

## 1. High-Level System Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           BROWSER (localhost:3000)                          │
│                                                                            │
│   /            /properties  /properties/[id]       Public pages (SSR)      │
│   /auth/*      /payments/*   /payment/*                                    │
│   /dashboard/tenant/...     /dashboard/landlord/...   /dashboard/admin/... │
│                                    │                                       │
│                        +-----------|-----------+                           │
│                        │  Next.js 15 (App Router)  │                       │
│                        │  middleware.ts  (route guard, decodes rf_token)   │
│                        │  Client: api.ts  (same-origin /api + Bearer)      │
│                        │  Server: serverFetch.ts (direct, no CORS)         │
│                        │  React Query hooks → API calls                    │
│                        │  Zod + React Hook Form (client validation)        │
│                        └-----------|-----------+                           │
│                                    │ rewrite /api/:path*                    │
│                                    │ server-to-server (SSR)                │
└────────────────────────────────────┼───────────────────────────────────────┘
                                     │  http://localhost:5000
┌────────────────────────────────────┼───────────────────────────────────────┐
│                        EXPRESS 5 API (localhost:5000)                       │
│                                                                            │
│   src/app.ts  mounts all modules under /api/*                               │
│   src/middlewares/auth.ts   (JWT cookie/Bearer → req.user)                  │
│   src/modules/  user · auth · properties · landlord · categories ·          │
│                 rental · payments · admin · review                          │
│   src/lib/prisma.ts (Prisma) ──► PostgreSQL   ·   src/lib/stripe.ts (Stripe)│
│   src/config/index.ts  (PORT, DATABASE_URL, JWT secrets, APP_URL/CLIENT_URL)│
└────────────────────────────────────────────────────────────────────────────┘
```

Two separate processes:
- **Backend** — Express 5 REST API at `http://localhost:5000` (repo root). Started with `npm run dev` (`tsx watch src/server.ts`).
- **Frontend** — Next.js 15 app at `http://localhost:3000` (`frontend/`). Started with `npm run dev` inside `frontend/`.

They are connected **without CORS friction** because the frontend proxies every `/api/*` request to the backend through a Next.js `rewrite` (see §4), and server components fetch the backend directly server-to-server.

---

## 2. Tech Stack

### Backend (repo root — already built)
| Layer | Technology |
|---|---|
| Runtime / framework | Node.js, Express 5, TypeScript |
| ORM | Prisma (PostgreSQL) |
| Auth | JWT (`accessToken`/`refreshToken` in httpOnly cookies **and** returned in the JSON body), custom `auth()` middleware |
| Payments | Stripe Checkout + webhook (`stripe-webhook` construct) |
| Patterns | MVC: `*.route.ts` → `*.controller.ts` → `*.service.ts` → Prisma |

### Frontend (`frontend/`)
| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 3, custom brand colors |
| Data fetching | TanStack React Query (client), `fetch` (server components) |
| Forms | React Hook Form + `@hookform/resolvers/zod` + Zod |
| Notifications | `sonner` toasts |
| Icons | `lucide-react` |

---

## 3. Repository Layout

```
E:\RoostFinder\
├── src\                    ← BACKEND
│   ├── server.ts           ← entry (tsx watch src/server.ts)
│   ├── app.ts              ← mounts every module route under /api/*
│   ├── middlewares\auth.ts ← JWT guard (cookie → Authorization header)
│   ├── config\index.ts     ← env config (APP_URL, CLIENT_URL, JWT, Stripe)
│   ├── lib\prisma.ts, lib\stripe.ts
│   └── modules\
│       ├── user\        auth\        (auth + account)
│       ├── properties\  categories\  (public listings)
│       ├── landlord\    rental\      (requests lifecycle)
│       ├── payments\                 (Stripe)
│       ├── admin\                   (moderation)
│       └── review\                  (ratings)
│
└── frontend\               ← FRONTEND (Next.js 15)
    ├── middleware.ts       ← JWT route guard for /dashboard/:path*
    ├── next.config.ts      ← rewrite /api/:path* → http://localhost:5000/api/:path*
    ├── src\
    │   ├── app\            ← routes (pages + layouts)
    │   ├── components\     ← ui\ primitives, layout\, forms\, properties\, dashboard\
    │   ├── hooks\          ← React Query hooks + AuthProvider
    │   ├── schemas\        ← Zod validation schemas
    │   ├── lib\            ← api.ts, token.ts, constants.ts, utils.ts, providers.tsx
    │   └── types\index.ts  ← mirrored API types (User, Property, RentalRequest, …)
    └── .env.local
```

---

## 4. The Frontend↔Backend Connection Contract

There are **three channels** the frontend uses to reach the backend:

### 4.1 Browser → Next.js proxy (all client-side API calls)
`frontend/next.config.ts` rewrites every path under `/api/*` to the backend:

```
source:      /api/:path*
destination: ${NEXT_PUBLIC_BACKEND_URL}/api/:path*   (default http://localhost:5000)
```

Because the rewrite happens server-side, the browser only ever talks to `localhost:3000` — **no CORS, no exposed backend origin**. The client helper `frontend/src/lib/api.ts` (`api.get/post/put/patch/delete`) calls these same-origin paths and attaches the access token as `Authorization: Bearer <token>`.

Backend auth middleware (`src/middlewares/auth.ts`) reads the token from **either** the `accessToken` cookie **or** the `Authorization` header — so both work, but the frontend standardizes on the Bearer header (cookies are rejected by browsers over plain HTTP when `SameSite=None`).

### 4.2 Server components → backend directly (SSR, public data)
Public pages that need data before paint (home page, property detail) use `serverFetch` in `frontend/src/lib/api.ts`, which fetches `${NEXT_PUBLIC_BACKEND_URL}/api/...` directly from the Node process (server-to-server, no CORS) with `cache: "no-store"`.

### 4.3 Route protection (middleware)
`frontend/middleware.ts` runs on the Edge runtime for `/dashboard/:path*`. It cannot read `localStorage`, so the auth context writes the JWT into a plain, `SameSite=Lax` cookie named `rf_token` (`frontend/src/lib/token.ts`). The middleware decodes the cookie payload (`decodeJwt`) and:
- unauthenticated → redirect to `/auth/login?next=<original path>`
- wrong role → redirect to that user's own dashboard base URL
- valid → `NextResponse.next()`

This is the **first** line of defense. The backend `auth(Role...)` guards every protected endpoint — **the second, authoritative** line of defense.

---

## 5. Authentication Flow (who owns what)

```
register page  ──POST /api/auth/register──► userController.registerUser
login page     ──POST /api/auth/login────► authController.loginUser
                  returns { accessToken, refreshToken } (+ httpOnly cookies)

frontend:
  persistAuth()  → localStorage: rf_access_token, rf_refresh_token, rf_user
                 → document.cookie: rf_token=<accessToken>   (for middleware)
  api.ts         → Authorization: Bearer <accessToken>        (for backend)
```

- `useAuth` (in `frontend/src/hooks/use-auth.tsx`) is the single source of truth for session state (`loading | authenticated | unauthenticated`). On mount it restores the token, writes the cookie, and refreshes the profile via `GET /api/auth/me`.
- `login`/`register` return the decoded `JwtPayload` (`{ id, name, email, role, exp }`); the login/register pages then `router.push(DASHBOARD_ROLE_BASE_URL[payload.role])`.
- Registration is **two backend calls** (register, then auto-login) because the backend register endpoint does not return tokens.
- `logout()` clears localStorage + the `rf_token` cookie and redirects to `/`.
- Backend refresh-token endpoint exists (`POST /api/auth/refresh-token`) but the frontend currently treats the access token as the session; on a 401 the auth context clears the session and returns the user to login.

---

## 6. Backend API Reference (route → controller → service)

Everything is mounted in `src/app.ts`. `auth()` without args = any logged-in user; `auth(Role.X)` or `auth("X")` = role-restricted.

| Method & path | Handler (controller.service) | Auth | Purpose |
|---|---|---|---|
| `POST /api/auth/register` | `userController.registerUser` | — | Create account |
| `GET /api/auth/me` | `userController.getMyProfile` | any | Current user + profile |
| `POST /api/auth/login` | `authController.loginUser` | — | Login → tokens |
| `POST /api/auth/refresh-token` | `authController.refreshToken` | — | Refresh tokens |
| `GET /api/categories` | `categoryController.getAllCategories` | — | PropertyType list for filters |
| `GET /api/properties` | `propertyController.getAllProperties` | — | Paginated, filterable listings |
| `GET /api/properties/:id` | `propertyController.getPropertyById` | — | Single listing (+ landlord.user) |
| `POST /api/properties` | `propertyController.createProperty` | Landlord, Admin | Create listing |
| `PUT /api/properties/:id` | `propertyController.updateProperty` | Landlord, Admin | Update listing |
| `DELETE /api/properties/:id` | `propertyController.deleteProperty` | Landlord, Admin | Delete listing |
| `GET /api/landlord/me` | `landlordController.getMyLandlordProfile` | any | Landlord profile |
| `POST /api/landlord` | `landlordController.createLandlordProfile` | any | Create landlord profile |
| `PATCH /api/landlord/me` | `landlordController.updateLandlordProfile` | any | Update landlord profile |
| `GET /api/landlord/requests` | `landlordController.getLandlordRequests` | Landlord, Admin | Incoming rental requests |
| `PATCH /api/landlord/requests/:id` | `landlordController.updateRentalRequestStatus` | Landlord, Admin | Approve/reject a request |
| `POST /api/landlord/properties`… | `propertyRoutes` mounted under landlord | Landlord, Admin | (same as `/api/properties`) |
| `POST /api/rentals` | `rentalController.createRentalRequest` | any (tenant) | Tenant requests to rent |
| `GET /api/rentals` | `rentalController.getMyRentalRequests` | any | Tenant's own requests |
| `GET /api/rentals/:id` | `rentalController.getSingleRentalRequestDetails` | any | Request + property + payment |
| `POST /api/payments/create` | `paymentController.createPaymentSession` | any | Create Stripe Checkout session |
| `POST /api/payments/confirm` | `paymentController.confirmPayment` | any | Verify session → mark SUCCEEDED |
| `POST /api/payments/webhook` | `paymentController.stripeWebhook` | Stripe sig | Server-side payment events |
| `GET /api/payments` | `paymentController.getMyPayments` | any | Tenant's own payments |
| `GET /api/payments/:id` | `paymentController.getSinglePayment` | any | Single payment |
| `GET /api/admin/users` | `adminController.getAllUsers` | Admin | Search/paginate users |
| `PATCH /api/admin/users/:id` | `adminController.updateUserStatus` | Admin | Ban / unban |
| `GET /api/admin/properties` | `adminController.getAllPropertiesAdmin` | Admin | Moderate all listings |
| `GET /api/admin/rentals` | `adminController.getAllRentalsAdmin` | Admin | Moderate all requests |
| `POST /api/reviews` | `reviewController.createReview` | Tenant | Review a rental |
| `GET /api/reviews/my-reviews` | `reviewController.getMyReviews` | Tenant | My reviews |
| `GET /api/reviews/property/:propertyId` | `reviewController.getReviewsForProperty` | — | Reviews on a listing |
| `DELETE /api/reviews/:id` | `reviewController.deleteReview` | Tenant | Delete my review |

All responses follow the shape `{ data: … }` (via the `sendResponse` util); the frontend `api.ts`/`serverFetch` unwrap `.data`, and errors surface as `{ error | message }` which are turned into `ApiError`.

---

## 7. Frontend → Backend Connection Matrix

Each UI surface and the exact backend code it drives:

### Public / browsing
| Frontend file/route | Backend call | Backend code hit |
|---|---|---|
| `app/page.tsx` (home, SSR) | `GET /api/properties?purpose=RENT&limit=…` | `propertyService.getAllProperties` |
| `app/properties/page.tsx` (client) | `GET /api/properties` (search, filters, pagination) + `GET /api/categories` | `propertyService.getAllProperties`, `categoryService.getAllCategories` |
| `app/properties/[id]/page.tsx` (SSR) | `GET /api/properties/:id` | `propertyService.getPropertyById` |
| `components/properties/*` (cards, gallery, facts) | — (render data from above) | — |
| `components/dashboard/tenant-requests.tsx` etc. | renders `RentalRequest` payloads | — |

### Auth
| Frontend file/route | Backend call | Backend code hit |
|---|---|---|
| `app/auth/register/page.tsx` | `POST /api/auth/register` → `POST /api/auth/login` | `userController.registerUser`, `authController.loginUser` |
| `app/auth/login/page.tsx` | `POST /api/auth/login` | `authController.loginUser` |
| `hooks/use-auth.tsx` (`refreshMe`) | `GET /api/auth/me` | `userController.getMyProfile` |
| `middleware.ts` | decodes `rf_token` locally (no HTTP) | (guard) |

### Tenant dashboard (`/dashboard/tenant`)
| Frontend file/route | Backend call | Backend code hit |
|---|---|---|
| `app/dashboard/tenant/page.tsx` (stats) | `GET /api/rentals`, `GET /api/payments` | `rentalService.getMyRentalRequests`, `paymentService.getMyPayments` |
| `app/dashboard/tenant/requests/page.tsx` | `GET /api/rentals` | `rentalService.getMyRentalRequests` |
| `app/dashboard/tenant/payments/page.tsx` | `GET /api/payments` | `paymentService.getMyPayments` |
| `app/dashboard/tenant/requests/[id]/pay/page.tsx` | `GET /api/rentals/:id` → `POST /api/payments/create` | `rentalService.getSingleRentalRequestDetails`, `paymentService.createPaymentSession` |
| `app/payments/success/page.tsx` | `POST /api/payments/confirm { stripeSessionId }` | `paymentService.confirmPayment` |
| `components/dashboard/review-dialog.tsx` | `POST /api/reviews` | `reviewService.createReview` |

### Request-to-rent (on any property)
| Frontend file/route | Backend call | Backend code hit |
|---|---|---|
| `components/properties/request-rent-modal.tsx` | `POST /api/rentals { propertyId, moveInDate, message }` | `rentalService.createRentalRequest` |
| `components/properties/review-section.tsx` | `GET /api/reviews/property/:propertyId` | `reviewService.getReviewsForProperty` |

### Landlord dashboard (`/dashboard/landlord`)
| Frontend file/route | Backend call | Backend code hit |
|---|---|---|
| `app/dashboard/landlord/page.tsx` | `GET /api/landlord/me`, `GET /api/landlord/requests`, `GET /api/properties` | `landlordService.getMyLandlordProfile`, `getLandlordRequests`, `propertyService.getAllProperties` |
| `app/dashboard/landlord/properties/page.tsx` | `GET /api/properties` | `propertyService.getAllProperties` |
| `app/dashboard/landlord/properties/new/page.tsx` | `POST /api/properties` | `propertyController.createProperty` |
| `app/dashboard/landlord/properties/[id]/edit/page.tsx` | `GET /api/properties/:id` → `PUT /api/properties/:id` | `propertyController.getPropertyById/updateProperty` |
| `app/dashboard/landlord/requests/page.tsx` | `GET /api/landlord/requests`, `PATCH /api/landlord/requests/:id` | `landlordController.getLandlordRequests/updateRentalRequestStatus` |
| `app/dashboard/landlord/profile/page.tsx` | `GET /api/landlord/me` → `POST /api/landlord` (first) or `PATCH /api/landlord/me` | `landlordService.*` |

### Admin dashboard (`/dashboard/admin`)
| Frontend file/route | Backend call | Backend code hit |
|---|---|---|
| `app/dashboard/admin/page.tsx` (stats) | `GET /api/admin/users`, `GET /api/admin/properties`, `GET /api/admin/rentals` | `adminService.getAllUsers/getAllPropertiesAdmin/getAllRentalsAdmin` |
| `app/dashboard/admin/users/page.tsx` | `GET /api/admin/users?search=&role=&activeStatus=&page=&limit=`, `PATCH /api/admin/users/:id` | `adminService.getAllUsers/updateUserStatus` |
| `app/dashboard/admin/properties/page.tsx` | `GET /api/admin/properties` | `adminService.getAllPropertiesAdmin` |
| `app/dashboard/admin/rentals/page.tsx` | `GET /api/admin/rentals` | `adminService.getAllRentalsAdmin` |

---

## 8. Key Flows, End-to-End

### 8.1 Browse & search
`/properties` page → `useProperties` hook → `api.get("/api/properties", { params })` → Next rewrites to `http://localhost:5000/api/properties` → `propertyController.getAllProperties` (Prisma `findMany` with filters + `findAndCount` for pagination) → `{ data: { data: [...], meta: { total, page, limit } } }` → React Query caches under the filter key; the sidebar updates the key and refetches.

### 8.2 Request to rent
Tenant clicks “Request to Rent” → modal (`request-rent-modal.tsx`, Zod `rentalSchema`) → `POST /api/rentals` → `createRentalRequest` (creates `RentalRequest` with `status: PENDING`) → success toast. Landlord sees it in `/dashboard/landlord/requests`.

### 8.3 Approve → pay → ACTIVE
1. Landlord clicks **Approve** → `PATCH /api/landlord/requests/:id { status: "APPROVED" }` (optimistic update in `hooks/use-landlord.ts`). Status `APPROVED`, payment `PENDING`.
2. Tenant opens the request → `POST /api/payments/create { rentalRequestId }` → backend creates a Stripe Checkout session (`success_url: CLIENT_URL/payments/success?session_id=…`) and returns `checkoutUrl`.
3. Frontend `window.location.href = checkoutUrl` → customer pays on Stripe → redirected back to `/payments/success?session_id=…`.
4. `payments/success/page.tsx` calls `POST /api/payments/confirm { stripeSessionId }` → `paymentService.confirmPayment` verifies the session and marks the payment `SUCCEEDED`.
5. The webhook `POST /api/payments/webhook` is the reliable fallback for Stripe events (raw-body route, signature-verified).
6. Display: `deriveDisplayStatus` (in `utils.ts`) maps `APPROVED` + `SUCCEEDED` payment → **ACTIVE** for the tenant. Note: the backend `RentalStatus` enum only has `PENDING | APPROVED | REJECTED | COMPLETED` — “ACTIVE” is a frontend display state.

### 8.4 Moderation & banning
Admin toggles a user → `PATCH /api/admin/users/:id { activeStatus: "BANNED" | "ACTIVE" }`. The backend `auth()` middleware re-checks `user.activeStatus === "BANNED"` on **every** authenticated request, so a banned user is locked out immediately server-side, regardless of what the UI shows.

---

## 9. Data Model & Status Mapping

Core entities (Prisma): `User` (role: `Tenant|Landlord|Admin`, `activeStatus: ACTIVE|BANNED`), `Profile`, `Landlord`, `property` (enum fields: `propertyType`, `purpose: SALE|RENT`, `status: ACTIVE|PENDING|SOLD|RENTED|REJECTED`, `amenities[]`), `RentalRequest` (`status: PENDING|APPROVED|REJECTED|COMPLETED`), `Payment` (`status: PENDING|SUCCEEDED|FAILED|REFUNDED`), `Review`.

The frontend mirrors these in `frontend/src/types/index.ts` and keeps a **derived ACTIVE rental state**:

| Backend `RentalStatus` | Frontend badge (`RentalStatusBadge`) |
|---|---|
| `PENDING` | amber “Pending” |
| `APPROVED` + payment `SUCCEEDED` | green “Active” (derived) |
| `APPROVED` + payment not succeeded | blue “Approved” |
| `REJECTED` | red “Rejected” |
| `COMPLETED` | slate “Completed” |

All frontend forms validate client-side with Zod (`src/schemas/*`) mirroring the backend’s rules; the backend remains the final validator.

---

## 10. Environment Variables

`frontend/.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000   # used by rewrites + serverFetch
```
Root `.env` (backend) — key values relevant to the connection:
```
PORT=5000
APP_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000   # ← used for Stripe success/cancel_url (was 5173)
DATABASE_URL=…                      # PostgreSQL
JWT_ACCESS_SECRET / JWT_REFRESH_SECRET / JWT_ACCESS_EXPIRES_IN / …
STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET
```

---

## 11. How to Run

```bash
# 1) Backend  (repo root) — must be running first
npm install
npm run dev          # tsx watch src/server.ts  → http://localhost:5000

# 2) Frontend  (frontend/)
npm install
npm run dev          # next dev → http://localhost:3000
npm run build        # production build (passes: 22 routes, types checked)
```

Smoke-test path: register as **Landlord** → create a property → register as **Tenant** → browse → request to rent → Landlord approves → Tenant pays (Stripe test mode) → success page confirms → review → Admin can ban/unban and moderate.

---

## 12. Current State (as of the last build)

- `npm run build` in `frontend/` succeeds: **22 routes compiled**, type-check clean.
- Build-time notes resolved along the way:
  - ESLint legacy-config conflict with the root `E:\eslint.config.js` → `eslint: { ignoreDuringBuilds: true }` in `next.config.ts` (type-checking still runs).
  - `useFieldArray` type limitation with `string[]` → the property form manages image URLs with local state + `setValue` instead (`frontend/src/components/forms/property-form.tsx`).
  - Login/register pages now use `payload.role` (login/register return `JwtPayload` directly).
- npm install reported 12 high-severity `npm audit` vulnerabilities (no `--force` used; review before production).
