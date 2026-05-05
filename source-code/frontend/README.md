# Planet Motor BMW Frontend

Frontend website Planet Motor BMW untuk katalog spare part BMW, halaman informasi toko, CTA Tokopedia/WhatsApp, dan admin inventory interface.

Project ini bukan SaaS dan bukan ecommerce internal penuh. Scope utamanya adalah catalog storefront + admin inventory platform. Proses pembelian diarahkan ke Tokopedia, sementara pertanyaan produk diarahkan ke WhatsApp.

## Arsitektur Singkat

```text
Browser
  -> Vercel / Next.js frontend
  -> Railway / Go API backend
  -> Supabase PostgreSQL
```

- Frontend menangani UI public website, admin UI, routing, SSR, theme switch, language switch, dan proxy `/api/*`.
- Backend Go menangani auth, business logic, catalog/admin API, stock update, dan akses database.
- Supabase PostgreSQL menjadi database utama.
- Tokopedia dan WhatsApp menjadi channel checkout dan komunikasi.

## Fitur

- Homepage katalog Planet Motor BMW.
- Product listing, search, filter kategori, sorting, dan product detail.
- Product image tetap menggunakan `product.imageUrl` dari backend.
- Review Tokopedia ditampilkan dari curated JSON data.
- CTA Tokopedia dan WhatsApp.
- Admin login dengan cookie auth dari backend.
- Admin product CRUD, category CRUD, low stock/dashboard summary.
- Stock snapshot dan stream fallback.
- Theme switch dan language switch.

## Teknologi

| Area | Teknologi |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| State | Zustand |
| Validation | Zod, React Hook Form |
| Testing | Vitest |
| Deployment | Vercel |

## Struktur Folder

```text
src/
  app/
    (public)/          Public website routes
    (auth)/            Login/error auth pages
    admin/             Admin catalog and inventory pages
  components/
    home/              Homepage sections
    layout/            Public layout, header, footer
    providers/         Theme, locale, stock stream providers
    shared/            Reusable cards, icons, stock badges
    ui/                UI primitives
  data/                Curated static data such as Tokopedia reviews
  hooks/               Client hooks
  lib/                 API wrapper, auth, formatting, product helpers
  stores/              Zustand stores
  types/               Shared TypeScript types
```

## Environment

Buat `.env.local` untuk development lokal:

```bash
GO_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME="Planet Motor BMW"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Untuk production, set `GO_API_URL` ke URL backend Go yang aktif. Jangan commit file `.env*`.

## Menjalankan Lokal

```bash
npm install
npm run dev
```

Default frontend berjalan di:

```text
http://localhost:3000
```

Pastikan backend Go API berjalan dan bisa diakses dari nilai `GO_API_URL`.

## Script

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:watch
npm run test:coverage
```

## Testing

Unit test:

```bash
npm run test
```

Build production:

```bash
npm run build
```

Folder E2E tidak disertakan pada source repository Digital Dinasty.

## Deployment

Frontend dapat dideploy ke Vercel sebagai project Next.js. Environment production minimal:

```bash
GO_API_URL=<backend-go-api-url>
NEXT_PUBLIC_APP_NAME="Planet Motor BMW"
NEXT_PUBLIC_APP_URL=<frontend-url>
```

Backend dan database tidak berada di repo ini.

## Catatan Keamanan

- Jangan commit `.env`, credential, token, cookie, database URL, atau secret.
- Browser tidak mengakses Supabase langsung.
- Admin authentication dimiliki oleh backend Go API.
- Product image berasal dari data backend lewat `product.imageUrl`.

## Lisensi

Private college project.
