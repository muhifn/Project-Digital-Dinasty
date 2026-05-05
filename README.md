# Planet Motor BMW

Planet Motor BMW adalah platform katalog spare part BMW berbasis web. Project ini dibuat sebagai company profile, katalog produk, dan admin inventory sederhana untuk membantu pembeli melihat kategori produk, membaca detail produk, lalu melanjutkan komunikasi atau transaksi melalui channel resmi toko.

Project ini bukan SaaS dan bukan ecommerce internal penuh. Website tidak menyimpan checkout internal, order internal, atau upload bukti pembayaran. Alur pembelian diarahkan ke Tokopedia, sementara konsultasi produk diarahkan ke WhatsApp.

## Source Code

Source code dipisahkan dalam folder khusus:

```text
source-code/
  frontend/   Next.js frontend website dan admin UI
  backend/    Go REST API untuk katalog, auth admin, kategori, produk, dan stok
```

Folder build, dependency lokal, file environment lokal, dan E2E tidak disertakan.

## C4 Container Diagram

![C4 Container Diagram](docs/assets/c4-container-diagram.png)

Diagram di atas menjelaskan hubungan utama antar bagian sistem:

- Buyer membuka frontend untuk melihat katalog dan mengarah ke Tokopedia atau WhatsApp.
- Admin menggunakan frontend admin untuk mengelola produk, kategori, dan stok.
- Frontend Next.js mengambil data melalui backend Go API.
- Backend Go API membaca dan menulis data ke Supabase PostgreSQL.
- Tokopedia dan WhatsApp berperan sebagai external sales/support channel.

## Arsitektur Platform

| Layer | Teknologi | Peran |
| --- | --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS | Public website, katalog produk, detail produk, admin UI |
| Backend | Go, chi, pgx/sqlx | REST API, auth admin, catalog logic, stock logic |
| Database | Supabase PostgreSQL | Penyimpanan data produk, kategori, stok, admin, dan setting toko |
| External Channel | Tokopedia, WhatsApp | Checkout marketplace dan komunikasi customer |

## Fitur Utama

- Homepage dan halaman informasi toko.
- Katalog produk dengan kategori, search, sort, dan product detail.
- Product image menggunakan `product.imageUrl` dari backend.
- Review Tokopedia ditampilkan dari curated JSON data.
- CTA Tokopedia dan WhatsApp.
- Admin login menggunakan cookie auth dari backend.
- Admin product CRUD, category CRUD, dashboard stok, dan low stock summary.
- Stock snapshot dan fallback stream.
- Theme switch dan language switch.

## Menjalankan Frontend

```bash
cd source-code/frontend
npm install
npm run dev
```

Environment lokal contoh:

```bash
GO_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME="Planet Motor BMW"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Menjalankan Backend

```bash
cd source-code/backend
go mod download
go run ./cmd/server
```

Environment lokal contoh:

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/planet_motor_bmw?sslmode=disable
JWT_SECRET=replace-with-local-development-secret
PORT=8080
CORS_ORIGINS=http://localhost:3000
```

## Testing Plan

Frontend:

```bash
cd source-code/frontend
npm run test
npm run build
```

Backend:

```bash
cd source-code/backend
go test ./...
go build -tags netgo -ldflags "-s -w" -o planet-motor-bmw-api ./cmd/server
```

Validasi manual:

- Public homepage menampilkan produk dan kategori.
- Product detail membuka data produk yang benar.
- CTA Tokopedia dan WhatsApp muncul pada halaman yang sesuai.
- Admin dapat login dan mengelola produk/kategori/stok.
- Produk yang dihapus tidak muncul lagi di katalog.
- Tidak ada flow cart, checkout internal, order internal, atau upload payment proof.

## Keamanan

- File `.env`, `.env.local`, token, cookie, database URL production, dan secret tidak disertakan.
- Browser tidak mengakses Supabase secara langsung.
- Backend menjadi satu-satunya layer yang mengakses database.
- File production deployment URL tidak dicantumkan dalam repo pengumpulan ini.

## Catatan

Repository ini disusun untuk kebutuhan implementasi perkuliahan: desain UI, arsitektur platform, konteks frontend-backend, source code, dan testing plan.
