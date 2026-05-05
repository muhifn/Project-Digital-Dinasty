# Planet Motor BMW - Go API Backend

Backend REST API berbasis Go untuk proyek Planet Motor BMW. Service ini menangani business logic katalog, autentikasi admin, akses database PostgreSQL, dan SSE stok real-time.

Frontend Next.js tersedia pada folder `source-code/frontend` di repo pengumpulan ini.

## Arsitektur

```
Browser -> Vercel (Next.js, SSR + UI) -> Railway (Go API)
                                              |
                                      PostgreSQL (Supabase)
```

- Go API bersifat stateless dan menggunakan JWT dalam HttpOnly cookies.
- Frontend mengakses API dari server-side maupun client-side lewat `/api/*`.
- Product image URL tetap disimpan sebagai string `imageUrl` di database/API.

## Catatan Scope Saat Ini

- Proyek frontend saat ini berfokus pada company profile + katalog produk.
- Pembelian diarahkan ke Tokopedia; API tidak membuat atau mengelola order internal.
- Dashboard API berfokus pada produk, kategori, dan stok.

## Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Router | chi/v5 |
| Database | pgx/v5 + sqlx |
| Auth | golang-jwt/v5 + bcrypt |
| Migration | golang-migrate/v4 |
| CORS | rs/cors |
| Env loader | godotenv |

## Menjalankan Lokal

### Prasyarat

- Go 1.25+
- PostgreSQL (lokal atau Supabase)

### Instalasi

```bash
git clone https://github.com/muhifn/planet-motor-bmw-api.git
cd planet-motor-bmw-api
```

### Konfigurasi

```bash
cp .env.example .env
```

Isi `.env` sesuai kebutuhan.

| Variabel | Wajib | Default | Keterangan |
|----------|------|---------|-----------|
| `DATABASE_URL` | Ya | - | Connection string PostgreSQL |
| `JWT_SECRET` | Ya | - | Secret untuk sign JWT |
| `PORT` | Tidak | `8080` | Port HTTP server |
| `CORS_ORIGINS` | Tidak | `http://localhost:3000` | Daftar origin CORS, pisahkan koma sesuai frontend yang digunakan |

### Setup Database

```bash
make migrate-up
make seed
```

Kredensial admin untuk development dibuat lewat seed lokal. Gunakan password development sendiri dan jangan gunakan credential contoh untuk production.

### Run

```bash
make dev
```

Verifikasi:

```bash
curl http://localhost:8080/health
# {"status":"ok"}
```

## Ringkasan Endpoint

### Public

| Method | Path | Fungsi |
|--------|------|--------|
| `GET` | `/health` | Health check |
| `GET` | `/api/categories` | List kategori |
| `GET` | `/api/categories/{id}` | Detail kategori |
| `GET` | `/api/products` | List produk (`category`, `search`, `page`, `limit`) |
| `GET` | `/api/products/by-slug/{slug}` | Detail produk by slug |
| `GET` | `/api/stock/stream` | SSE update stok real-time |
| `GET` | `/api/stock/snapshot` | Snapshot stok semua produk |

### Auth

| Method | Path | Fungsi |
|--------|------|--------|
| `POST` | `/api/auth/login` | Login admin, set JWT cookies |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `POST` | `/api/auth/logout` | Hapus cookies auth |

### Admin (butuh JWT)

| Method | Path | Fungsi |
|--------|------|--------|
| `GET` | `/api/admin/dashboard` | Statistik dashboard + low stock |
| `GET` | `/api/admin/products` | List produk admin |
| `POST` | `/api/admin/products` | Tambah produk |
| `GET` | `/api/admin/products/{id}` | Detail produk |
| `PUT` | `/api/admin/products/{id}` | Update produk |
| `DELETE` | `/api/admin/products/{id}` | Hapus produk permanen |
| `GET` | `/api/admin/categories` | List kategori + count |
| `POST` | `/api/admin/categories` | Tambah kategori |
| `GET` | `/api/admin/categories/{id}` | Detail kategori |
| `PUT` | `/api/admin/categories/{id}` | Update kategori |
| `DELETE` | `/api/admin/categories/{id}` | Hapus kategori |

Total endpoint aktif: 21.

## Autentikasi

Go API menggunakan 2 cookie JWT:

- `rdp_access_token` (15 menit)
- `rdp_refresh_token` (7 hari)

Keduanya diset sebagai `HttpOnly` dan `SameSite=Lax`.

## Format Response

Sukses:

```json
{
  "success": true,
  "data": {},
  "message": "optional"
}
```

Error:

```json
{
  "success": false,
  "error": "error description",
  "errors": {
    "field": "validation message"
  }
}
```

## Struktur Proyek Ringkas

```
planet-motor-bmw-api/
  cmd/
    server/main.go
    migrate/main.go
    seed/main.go
  internal/
    config/
    database/
    handler/
    middleware/
    model/
    repository/
    service/
    pkg/
    testutil/
  migrations/
  scripts/
  uploads/
  Makefile
```

## Skema Database (Ringkas)

Tabel utama:
- `admins`
- `categories`
- `products`
- `stock_logs`
- `store_settings`

Enum:
- `product_status`
- `stock_change_type`

## Etalase Produk Seed

1. Rak Lampu
2. Rak Spare Part
3. Rak Kaca
4. Variasi
5. Bemper + Caver
6. Ban Velg

## Testing

### Integration Test

```bash
make test
```

### Smoke Test

```bash
make test-smoke
```

## Perintah Makefile

```bash
make dev            # Jalankan server dev (air/go run)
make build          # Build binary production
make run            # Build lalu jalankan
make clean          # Hapus binary
make migrate-up     # Jalankan migration
make migrate-down   # Rollback migration terakhir
make seed           # Seed data awal
make test           # Jalankan test Go
make test-smoke     # Jalankan smoke test API
make help           # Tampilkan daftar target
```

## Deployment

Target production ringan saat ini:

```
Vercel frontend -> Railway Go API -> Supabase PostgreSQL
```

Railway service settings:

| Setting | Value |
|---------|-------|
| Runtime | Go |
| Build Command | `go build -tags netgo -ldflags "-s -w" -o app ./cmd/server` |
| Start Command | `./app` |
| Health Check Path | `/health` |

Set `DATABASE_URL`, `JWT_SECRET`, dan `CORS_ORIGINS` di dashboard hosting backend. Setelah backend aktif, set `GO_API_URL` frontend ke base URL backend yang digunakan.

## Lisensi

Private - College Project
