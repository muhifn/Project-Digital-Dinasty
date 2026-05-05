# Planet Motor BMW

Planet Motor BMW adalah platform katalog spare part BMW berbasis web. Project ini dibuat sebagai company profile, katalog produk, dan admin inventory sederhana untuk membantu pembeli melihat kategori produk, membaca detail produk, lalu melanjutkan komunikasi atau transaksi melalui kanal resmi toko.

Project ini bukan SaaS dan bukan ecommerce internal penuh. Website tidak menyimpan checkout internal, order internal, atau upload bukti pembayaran. Alur pembelian diarahkan ke Tokopedia, sementara konsultasi produk diarahkan ke WhatsApp.

## Kode Sumber

Kode sumber dipisahkan dalam folder khusus:

```text
source-code/
  frontend/   Aplikasi frontend Next.js dan admin UI
  backend/    REST API Go untuk katalog, auth admin, kategori, produk, dan stok
```

Folder build, dependency lokal, file environment lokal, dan E2E tidak disertakan.

## Diagram Kontainer C4

![Diagram Kontainer C4](docs/assets/c4-container-diagram.png)

Diagram di atas menjelaskan hubungan utama antar bagian sistem:

- Pembeli membuka frontend untuk melihat katalog dan mengarah ke Tokopedia atau WhatsApp.
- Admin menggunakan frontend admin untuk mengelola produk, kategori, dan stok.
- Frontend Next.js mengambil data melalui backend Go API.
- Backend Go API membaca dan menulis data ke Supabase PostgreSQL.
- Tokopedia dan WhatsApp berperan sebagai kanal eksternal untuk transaksi dan konsultasi.

## Arsitektur Platform

| Lapisan | Teknologi | Peran |
| --- | --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS | Website publik, katalog produk, detail produk, dan admin UI |
| Backend | Go, chi, pgx/sqlx | API REST, autentikasi admin, logika katalog, dan logika stok |
| Basis Data | Supabase PostgreSQL | Penyimpanan data produk, kategori, stok, admin, dan pengaturan toko |
| Kanal Eksternal | Tokopedia, WhatsApp | Proses transaksi marketplace dan komunikasi pelanggan |

## Fitur Utama

- Homepage dan halaman informasi toko.
- Katalog produk dengan kategori, pencarian, sorting, dan detail produk.
- Gambar produk menggunakan `product.imageUrl` dari backend.
- Review Tokopedia ditampilkan dari data JSON yang sudah dikurasi.
- Tombol aksi Tokopedia dan WhatsApp.
- Login admin menggunakan cookie autentikasi dari backend.
- Pengelolaan produk, pengelolaan kategori, dashboard stok, dan ringkasan stok rendah.
- Snapshot stok dan stream stok cadangan.
- Pengubah tema dan pilihan bahasa.

## Menjalankan Frontend

```bash
cd source-code/frontend
npm install
npm run dev
```

Contoh environment lokal:

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

Contoh environment lokal:

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/planet_motor_bmw?sslmode=disable
JWT_SECRET=replace-with-local-development-secret
PORT=8080
CORS_ORIGINS=http://localhost:3000
```

## Rencana Pengujian

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

- Homepage publik menampilkan produk dan kategori.
- Detail produk membuka data produk yang benar.
- CTA Tokopedia dan WhatsApp muncul pada halaman yang sesuai.
- Admin dapat login dan mengelola produk, kategori, dan stok.
- Produk yang dihapus tidak muncul lagi di katalog.
- Tidak ada alur keranjang, transaksi internal, pesanan internal, atau upload bukti pembayaran.

## Keamanan

- File `.env`, `.env.local`, token, cookie, URL basis data produksi, dan rahasia aplikasi tidak disertakan.
- Browser tidak mengakses Supabase secara langsung.
- Backend menjadi satu-satunya lapisan yang mengakses basis data.
- URL deployment produksi tidak dicantumkan dalam repo pengumpulan ini.

## Catatan

Repository ini disusun untuk kebutuhan implementasi perkuliahan: desain UI, arsitektur platform, konteks frontend-backend, kode sumber, dan rencana pengujian.
