# Use Case Diagram Planet Motor BMW

Diagram berikut menggambarkan aktor utama dan fungsi sistem Planet Motor BMW sebagai platform katalog spare part BMW dan admin inventory.

```mermaid
flowchart LR
  Buyer["Pembeli"]
  Admin["Admin"]
  Tokopedia["Tokopedia"]
  WhatsApp["WhatsApp"]

  subgraph System["Sistem Planet Motor BMW"]
    UC1(("Melihat homepage"))
    UC2(("Melihat katalog produk"))
    UC3(("Mencari dan filter produk"))
    UC4(("Melihat detail produk"))
    UC5(("Menghubungi via WhatsApp"))
    UC6(("Membuka checkout Tokopedia"))
    UC7(("Mengubah bahasa"))
    UC8(("Mengubah tema"))

    UC9(("Login admin"))
    UC10(("Logout admin"))
    UC11(("Mengelola produk"))
    UC12(("Mengelola kategori"))
    UC13(("Mengelola stok"))
    UC14(("Menghapus produk permanen"))
    UC15(("Melihat dashboard admin"))
  end

  Buyer --> UC1
  Buyer --> UC2
  Buyer --> UC3
  Buyer --> UC4
  Buyer --> UC5
  Buyer --> UC6
  Buyer --> UC7
  Buyer --> UC8

  Admin --> UC9
  Admin --> UC10
  Admin --> UC11
  Admin --> UC12
  Admin --> UC13
  Admin --> UC14
  Admin --> UC15

  UC5 --> WhatsApp
  UC6 --> Tokopedia

  UC3 -. "<<include>>" .-> UC2
  UC4 -. "<<extend>>" .-> UC2
  UC11 -. "<<include>>" .-> UC13
  UC14 -. "<<extend>>" .-> UC11
```

## Ringkasan Aktor

| Aktor | Peran |
|---|---|
| Pembeli | Melihat katalog spare part BMW, mencari produk, melihat detail, lalu diarahkan ke WhatsApp atau Tokopedia. |
| Admin | Mengelola katalog, kategori, stok, dan dashboard admin. |
| Tokopedia | Kanal eksternal untuk transaksi/checkout produk. |
| WhatsApp | Kanal eksternal untuk konsultasi, tanya stok, dan komunikasi langsung. |

## Catatan Scope

- Sistem tidak memiliki cart, checkout internal, payment gateway, atau upload bukti pembayaran.
- Pembelian diarahkan ke Tokopedia.
- Konsultasi dan bantuan pencarian part diarahkan ke WhatsApp.
