export const LOCALE_COOKIE_NAME = "preferred_locale";
export const LOCALE_STORAGE_KEY = "planet-motor-bmw-locale";

export const locales = ["id", "en"] as const;

export type Locale = (typeof locales)[number];

export const STORE_ADDRESS =
  "Jl. Tanah Merdeka No.9, RT.5/RW.4, Rambutan, Kec. Ciracas, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13830";
const STORE_MAP_QUERY =
  "Jl.%20Tanah%20Merdeka%20No.9%2C%20RT.5%2FRW.4%2C%20Rambutan%2C%20Kec.%20Ciracas%2C%20Kota%20Jakarta%20Timur%2C%20Daerah%20Khusus%20Ibukota%20Jakarta%2013830";
export const STORE_MAP_EMBED_URL = `https://www.google.com/maps?q=${STORE_MAP_QUERY}&output=embed`;
export const STORE_MAP_URL = `https://www.google.com/maps/search/?api=1&query=${STORE_MAP_QUERY}`;

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "id" || value === "en";
}

export const DEFAULT_LOCALE: Locale = "en";

export const dictionaries = {
  id: {
    common: {
      brand: "Planet Motor BMW",
      tokopedia: "Tokopedia",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
      language: "Bahasa",
      chooseLanguage: "Pilih bahasa",
      english: "English",
      indonesian: "Bahasa Indonesia",
      close: "Tutup",
      openInMaps: "Buka di Google Maps",
    },
    header: {
      nav: {
        home: "Beranda",
        products: "Produk",
        about: "Tentang Kami",
        contact: "Kontak",
      },
      topBadge: "Tokopedia store terpercaya untuk spare part BMW",
      theme: {
        switchToLight: "Gunakan mode terang",
        switchToDark: "Gunakan mode gelap",
      },
      mobileMenu: {
        open: "Buka menu navigasi",
        close: "Tutup menu navigasi",
        description: "Akses cepat ke katalog, info toko, dan kontak Planet Motor BMW.",
      },
      contact: {
        label: "Chat WhatsApp",
      },
    },
    languageModal: {
      badge: "PENGATURAN AWAL",
      title: "Pilih bahasa yang Anda inginkan",
      description:
        "Kami akan mengingat pilihan bahasa Anda untuk semua halaman publik Planet Motor BMW.",
      cards: {
        id: {
          title: "Bahasa Indonesia",
          description: "Cocok untuk pengunjung lokal dan pengalaman belanja harian.",
        },
        en: {
          title: "English",
          description: "Useful if you prefer English for browsing the public catalog and pages.",
        },
      },
    },
    home: {
      hero: {
        badge: "Trusted BMW Parts Supplier",
        title: "Spare Part BMW Premium",
        description:
          "Planet Motor BMW menghadirkan katalog part BMW yang lebih rapi, konsultasi kecocokan yang responsif, dan alur pembelian yang jelas melalui Tokopedia atau WhatsApp.",
        primaryCta: "Beli via Tokopedia",
        secondaryCta: "Konsultasi WhatsApp",
        floatingCards: {
          curation: {
            title: "Original & Copotan",
            description: "Tersusun rapi per kategori BMW.",
          },
          response: {
            title: "Respons Cepat",
            description: "Bantu cek part via WhatsApp.",
          },
          trust: {
            title: "Rating Tokopedia",
            description: "4.9 / 96 ulasan",
          },
        },
        stats: {
          ratings: "rating toko",
          reviews: "ulasan",
          sold: "produk terjual",
          satisfaction: "pembeli puas",
          categories: "etalase aktif",
        },
      },
      socialProof: {
        badge: "RINGKASAN TOKO",
        title: "Tokopedia-ready, konsultatif, dan fokus pada spare part BMW yang jelas stoknya.",
        description:
          "Kami memadukan katalog yang rapi dengan bantuan inquiry cepat supaya proses pencarian dan pembelian part BMW terasa lebih meyakinkan.",
        items: {
          products: "Produk tersedia",
          categories: "Etalase aktif",
          rating: "Rating toko",
          sold: "Produk terjual",
        },
      },
      features: {
        badge: "LAYANAN UTAMA",
        title: "Tampilan premium untuk katalog, proses beli, dan bantuan pencarian part BMW.",
        description:
          "Struktur landing page difokuskan untuk membantu pengunjung cepat memahami kualitas toko, menemukan etalase, lalu lanjut inquiry atau Tokopedia.",
        cards: [
          {
            title: "Live inventory",
            description: "Stok tampil lebih jelas untuk membantu menghindari pertanyaan berulang dan salah beli.",
          },
          {
            title: "Part terkurasi",
            description: "Original dan copotan berkualitas ditampilkan dengan informasi yang lebih terstruktur.",
          },
          {
            title: "Responsif via WhatsApp",
            description: "Tim membantu cek kecocokan part dan arahan pembelian sebelum membuka Tokopedia.",
          },
          {
            title: "Tokopedia-first flow",
            description: "Website fokus sebagai company profile dan katalog, transaksi tetap aman di Tokopedia.",
          },
        ],
        highlight: {
          badge: "WHY PLANET MOTOR BMW",
          title: "Alur yang lebih rapi untuk pengunjung yang serius mencari spare part BMW.",
          description:
            "Pendekatannya mirip showroom digital: tampil premium, informatif, dan langsung mengarahkan ke aksi yang paling relevan.",
          bullets: [
            "Katalog difokuskan pada part BMW original dan copotan berkualitas.",
            "Konsultasi cepat untuk verifikasi model, nomor part, dan alternatif stok.",
            "Pembelian diarahkan ke Tokopedia agar pembayaran dan pengiriman tetap terpusat.",
          ],
          floatingTitle: "Store highlight",
          floatingValue: "97% puas",
          floatingDescription: "ditopang respons cepat dan detail stok yang jelas.",
        },
      },
      services: {
        badge: "ALUR PEMBELIAN",
        title: "Dukungan pembelian dibuat seperti layanan premium, bukan katalog pasif.",
        description:
          "Inspirasi layout diambil dari landing page modern bergaya showcase, lalu disesuaikan ke kebutuhan toko spare part BMW.",
        consultation: {
          badge: "KONSULTASI PART",
          title: "Mulai dari kebutuhan kendaraan, bukan sekadar nama part.",
          description:
            "Kirim model BMW, tahun kendaraan, atau nomor part. Kami bantu arahkan ke part yang paling relevan sebelum Anda lanjut ke Tokopedia.",
          cards: [
            {
              title: "Cek nomor part",
              description: "Validasi kode, model, dan kebutuhan penggantian sebelum transaksi.",
            },
            {
              title: "Saran alternatif",
              description: "Jika stok utama habis, kami bantu arahkan ke opsi part yang paling masuk akal.",
            },
          ],
        },
        flow: {
          badge: "TOKOPEDIA FLOW",
          title: "Website sebagai showroom digital, Tokopedia sebagai titik transaksi utama.",
          description:
            "Landing page menampilkan katalog dan kredibilitas toko, lalu mengarahkan pembeli ke alur checkout yang sudah familiar dan aman.",
          steps: [
            {
              title: "Pilih part di katalog",
              description: "Jelajahi etalase, detail produk, dan status stok langsung dari website.",
            },
            {
              title: "Checkout via Tokopedia",
              description: "Klik aksi Tokopedia untuk melanjutkan transaksi resmi di marketplace.",
            },
            {
              title: "Konfirmasi via WhatsApp",
              description: "Jika perlu bantuan tambahan, tim kami siap bantu sesudah atau sebelum checkout.",
            },
          ],
        },
      },
      categories: {
        badge: "ETALASE UTAMA",
        title: "Temukan kategori part BMW lebih cepat.",
        description:
          "Disusun sebagai grid premium yang mudah dipindai untuk pengunjung baru maupun pelanggan yang sudah tahu kebutuhan part-nya.",
        productCountSuffix: "produk",
      },
      products: {
        badge: "TOP PICKS",
        title: "Pilihan produk unggulan dari katalog Planet Motor BMW.",
        description:
          "Bagian ini menjadi showcase produk yang paling relevan untuk menarik klik ke detail atau langsung ke Tokopedia.",
      },
      topPicks: {
        badge: "TOP PICKS LOOP",
        title: "Rekomendasi bergerak untuk part BMW yang paling sering dicari.",
        description:
          "Disusun sebagai rail horizontal yang terus bergerak agar pengunjung bisa memindai lebih banyak part tanpa memanjang ke bawah.",
      },
      reviews: {
        badge: "TOKOPEDIA REVIEWS",
        title: "Ulasan pelanggan yang memperkuat kredibilitas toko.",
        description:
          "Disajikan seperti section testimoni premium untuk menambah kepercayaan sebelum pengunjung masuk ke katalog atau checkout.",
        trustLabel: "Kepercayaan pembeli",
        summary: "pembeli puas",
        sold: "terjual",
      },
      faq: {
        badge: "SUPPORT",
        title: "Pertanyaan umum dan jalur bantuan yang cepat.",
        description:
          "Kami gabungkan FAQ dengan contact cards agar pengunjung tidak berhenti hanya di informasi, tapi langsung punya jalur tindakan.",
        items: [
          {
            question: "Apakah semua part di Planet Motor BMW original?",
            answer:
              "Kami menyediakan part original dan copotan terkurasi. Detail kondisi dan tipe part ditampilkan di katalog, dan Anda bisa konfirmasi ulang via WhatsApp sebelum membuka Tokopedia.",
          },
          {
            question: "Bagaimana cara membeli produk?",
            answer:
              "Transaksi dilakukan melalui Tokopedia store Planet Motor BMW. Dari website ini Anda bisa klik produk lalu lanjutkan ke listing resmi Tokopedia.",
          },
          {
            question: "Apakah bisa konsultasi kecocokan part?",
            answer:
              "Bisa. Kirim model BMW, tahun, dan kebutuhan part Anda via WhatsApp agar tim kami bantu cek kecocokan sebelum pembelian.",
          },
          {
            question: "Bagaimana info pengiriman dan estimasi sampai?",
            answer:
              "Kami proses pesanan secepat mungkin setelah pembayaran terkonfirmasi di Tokopedia. Estimasi tiba mengikuti kurir dan alamat tujuan Anda.",
          },
          {
            question: "Apakah ada garansi untuk part yang dibeli?",
            answer:
              "Garansi mengikuti jenis part dan ketentuan toko. Silakan hubungi WhatsApp untuk konfirmasi garansi produk yang ingin Anda beli.",
          },
          {
            question: "Metode pembayaran apa yang tersedia?",
            answer:
              "Semua metode pembayaran resmi mengikuti opsi yang tersedia di Tokopedia, termasuk transfer bank, e-wallet, kartu, dan metode lain yang didukung platform.",
          },
        ],
        contact: {
          badge: "GET IN TOUCH",
          title: "Butuh bantuan cepat sebelum checkout?",
          description:
            "Tim Planet Motor BMW siap membantu melalui WhatsApp untuk pertanyaan stok, kecocokan part, atau arahan pembelian.",
          cards: {
            whatsapp: {
              title: "WhatsApp",
              description: "Saluran tercepat untuk konsultasi part dan konfirmasi stok.",
              value: "0812-3456-7890",
            },
            tokopedia: {
              title: "Tokopedia Store",
              description: "Lanjut ke etalase resmi kami untuk transaksi yang aman.",
              value: "Planet Motor BMW",
            },
            location: {
              title: "Lokasi",
              description: "Jakarta Timur, siap melayani inquiry dan kebutuhan part BMW.",
              value: "Jakarta Timur",
            },
          },
          primaryCta: "Chat via WhatsApp",
          secondaryCta: "Kunjungi Tokopedia",
        },
      },
      cta: {
        badge: "CALL TO ACTION",
        title: "Butuh part BMW tertentu? Kirim daftar kebutuhan Anda sekarang.",
        description:
          "Tim Planet Motor BMW siap bantu rekomendasi part dan kecocokan model. Checkout langsung di Tokopedia, konsultasi cepat via WhatsApp.",
        primaryCta: "Beli di Tokopedia",
        secondaryCta: "Chat WhatsApp",
      },
    },
    about: {
      badge: "TENTANG PLANET MOTOR BMW",
      title: "Toko spare part BMW dengan etalase Tokopedia yang jelas, rapi, dan mudah ditindaklanjuti.",
      description:
        "Planet Motor BMW melayani kebutuhan spare part BMW original dan copotan melalui etalase resmi Tokopedia, dukungan admin via WhatsApp, dan katalog web yang membantu pembeli membaca kategori, stok, dan arah checkout dengan lebih jelas.",
      primaryCta: "Chat WhatsApp",
      secondaryCta: "Lihat Katalog",
      stats: [
        { value: "1500+", label: "Part aktif" },
        { value: "6", label: "Etalase aktif" },
        { value: "4.9/5", label: "Rating toko" },
      ],
      story: {
        badge: "ABOUT US",
        title: "About Us",
        paragraphs: [
          "Planet Motor BMW dikenal sebagai toko spare part BMW di Tokopedia yang berfokus pada part original dan copotan untuk kebutuhan harian maupun pencarian part yang lebih spesifik.",
          "Etalase seperti Rak Lampu, Rak Spare Part, Rak Kaca, Variasi, Bumper Cover, dan Ban Velg menjadi jalur utama pembeli untuk menemukan produk, lalu melanjutkan konfirmasi stok atau checkout melalui kanal resmi kami.",
        ],
      },
      values: {
        badge: "NILAI UTAMA",
        title: "Our Values",
        cards: [
          {
            title: "#Precision",
            description:
              "Setiap produk dan etalase disusun agar pembeli Tokopedia lebih cepat mengenali kategori part, konteks kebutuhan, dan langkah lanjutan yang perlu diambil.",
          },
          {
            title: "#Transparency",
            description:
              "Informasi katalog, arah inquiry, dan jalur checkout dibuat sejelas mungkin agar pembeli tahu kapan perlu chat admin dan kapan bisa langsung lanjut ke Tokopedia.",
          },
          {
            title: "#Responsiveness",
            description:
              "Admin WhatsApp digunakan untuk membantu cek stok, memberi arahan etalase, dan menjawab pertanyaan sebelum pembeli menyelesaikan transaksi di marketplace.",
          },
        ],
      },
      trust: {
        badge: "WHY CUSTOMERS TRUST US",
        title: "Pengalaman belanja mengikuti kebiasaan pembeli Tokopedia dari tahap lihat etalase hingga checkout.",
        description:
          "Struktur halaman ini mengikuti alur belanja nyata toko: lihat kategori, cek ketersediaan, hubungi admin bila perlu, lalu lanjut ke etalase resmi Tokopedia.",
        items: [
          {
            title: "Etalase mengikuti toko resmi",
            description: "Kategori utama di website diselaraskan dengan pola etalase toko agar pembeli tidak merasa berpindah ke flow yang berbeda saat masuk ke Tokopedia.",
          },
          {
            title: "Admin siap bantu sebelum checkout",
            description: "Pertanyaan seputar stok, produk yang dicari, dan arah etalase bisa diklarifikasi terlebih dahulu lewat WhatsApp.",
          },
          {
            title: "Transaksi tetap di Tokopedia",
            description: "Pembayaran, pengiriman, dan riwayat transaksi tetap berjalan di marketplace resmi yang sudah familier untuk pelanggan toko.",
          },
          {
            title: "Fokus pada kebutuhan part BMW",
            description: "Konten, kategori, dan jalur support diarahkan untuk pembeli yang memang sedang mencari spare part BMW, bukan katalog otomotif umum.",
          },
        ],
      },
      onlineShop: {
        badge: "ONLINE SHOP",
        title: "Kanal online kami mengikuti cara pembeli berinteraksi dengan toko Tokopedia yang asli.",
        description:
          "Dari katalog website sampai etalase resmi Tokopedia, semua jalur di bawah ini dibuat untuk mendukung pola belanja toko yang memang berjalan saat ini.",
        cards: [
          {
            eyebrow: "TOKOPEDIA",
            title: "Official Store",
            description: "Etalase resmi untuk checkout, ulasan toko, dan alur pembayaran atau pengiriman yang sudah familier bagi pembeli Planet Motor BMW.",
            href: "https://tk.tokopedia.com/ZSHhyGtpk/",
            external: true,
          },
          {
            eyebrow: "WEBSITE",
            title: "Product Catalog",
            description: "Website membantu pembeli membaca kategori seperti Rak Lampu, Rak Spare Part, Rak Kaca, Variasi, Bumper Cover, dan Ban Velg sebelum masuk ke Tokopedia.",
            href: "/products",
            external: false,
          },
          {
            eyebrow: "WHATSAPP",
            title: "Quick Consultation",
            description: "Chat admin untuk tanya stok, part yang dicari, atau kecocokan awal sebelum membuka etalase Tokopedia.",
            href: "https://wa.me/6281234567890",
            external: true,
          },
          {
            eyebrow: "SUPPORT",
            title: "Fitment Guidance",
            description: "Jika pembeli belum yakin nama part atau kategori yang tepat, kami bantu arahkan ke etalase atau produk yang paling mendekati kebutuhan.",
            href: "/contact",
            external: false,
          },
          {
            eyebrow: "STORE FLOW",
            title: "Clear Stock Visibility",
            description: "Katalog dirancang untuk membantu pembeli membaca status stok dan konteks produk dengan lebih cepat sebelum memutuskan.",
            href: "/products",
            external: false,
          },
          {
            eyebrow: "TOKOPEDIA",
            title: "Marketplace-first Purchase",
            description: "Setelah kebutuhan jelas, transaksi tetap dilanjutkan melalui Tokopedia agar pembayaran, pengiriman, dan riwayat pembelian tetap rapi.",
            href: "https://tk.tokopedia.com/ZSHhyGtpk/",
            external: true,
          },
        ],
      },
      location: {
        badge: "LOKASI TOKO",
        title: "Melayani BMW enthusiast dari Jakarta",
        description:
          "Tim kami beroperasi dari area Jakarta Timur untuk menangani inquiry harian dari Tokopedia, konfirmasi stok, dan arahan pembelian untuk pelanggan BMW.",
        address: STORE_ADDRESS,
        hours: "Senin - Sabtu, 09.00 - 17.00 WIB",
        supportTitle: "Dukungan yang tersedia dari lokasi kami:",
        supportItems: [
          "Konsultasi part BMW via WhatsApp",
          "Arahan pembelian ke etalase resmi Tokopedia",
          "Bantuan cek stok dari produk yang sedang dicari",
          "Pendampingan awal sebelum pembeli lanjut checkout",
        ],
        serviceTitle: "Yang bisa Anda lakukan selanjutnya:",
        serviceItems: [
          "Jelajahi kategori part dari website",
          "Buka etalase resmi Tokopedia",
          "Hubungi admin untuk pertanyaan part yang spesifik",
          "Dapatkan dukungan pembelian yang lebih terarah",
        ],
        mapTitle: "Lokasi Planet Motor BMW",
        mapsEmbedUrl: STORE_MAP_EMBED_URL,
        mapsCta: "Buka navigasi",
        mapsCtaHref: STORE_MAP_URL,
      },
      cta: {
        badge: "READY TO SHOP",
        title: "Lihat etalase, tanyakan part yang dibutuhkan, lalu checkout lewat Tokopedia resmi.",
        description:
          "Mulai dari katalog website untuk membaca kategori, lanjutkan dengan chat admin bila perlu, lalu selesaikan transaksi melalui toko Tokopedia resmi Planet Motor BMW.",
        primaryCta: "Chat WhatsApp",
        secondaryCta: "Kunjungi Tokopedia",
      },
    },
    contactPage: {
      badge: "CONTACT",
      title: "Hubungi Planet Motor BMW",
      description:
        "Gunakan kanal resmi yang memang dipakai toko untuk inquiry, pengecekan stok, dan melanjutkan pembelian spare part BMW.",
      whatsapp: {
        title: "WhatsApp",
        description: "Chat langsung untuk inquiry produk, pengecekan part, dan arahan pembelian.",
      },
      tokopedia: {
        title: "Tokopedia Official Store",
        description: "Buka etalase resmi untuk melihat listing aktif dan melanjutkan checkout di marketplace.",
      },
      catalog: {
        title: "Live Catalog Snapshot",
        description: "Jumlah etalase dan produk di bawah ini mengikuti katalog aktif Planet Motor BMW.",
      },
      phone: {
        title: "Telepon",
      },
      email: {
        title: "Email",
      },
      address: {
        title: "Alamat",
        value: STORE_ADDRESS,
      },
    },
    productsPage: {
      breadcrumbHome: "Beranda",
      breadcrumbProducts: "Produk",
      vehicleFinderBadge: "BMW FITMENT FINDER",
      vehicleFinderTitle: "Cari part berdasarkan kendaraan BMW Anda",
      vehicleFinderDescription: "Pilih tahun, seri, dan chassis untuk menampilkan part yang paling relevan.",
      yearLabel: "Tahun",
      yearAll: "Semua tahun",
      seriesLabel: "Seri BMW",
      seriesAll: "Semua seri",
      chassisLabel: "Kode chassis",
      chassisAll: "Semua chassis",
      keywordLabel: "Part / Kata kunci",
      keywordPlaceholder: "Contoh: F30 brake pad",
      findParts: "Temukan Part",
      clearFitment: "Reset Fitment",
      all: "Semua",
      items: "Item",
      popular: "Populer",
      newest: "Terbaru",
      priceLowHigh: "Harga: Rendah ke Tinggi",
      priceHighLow: "Harga: Tinggi ke Rendah",
      filters: "Filter",
      search: "Cari",
      searchPlaceholder: "Cari produk...",
      categories: "Kategori",
      priceRange: "Rentang Harga",
      applyPrice: "Terapkan Harga",
      stockStatus: "Status Stok",
      available: "Tersedia",
      lowStock: "Stok menipis",
      outOfStock: "Stok habis",
      applyFilters: "Terapkan Filter",
      resetFilters: "Reset filter",
      noProductsTitle: "Produk tidak ditemukan",
      noProductsDescription: "Coba ubah filter atau kata kunci pencarian Anda.",
      showingProducts: "Menampilkan",
      productsSuffix: "produk",
      min: "Min",
      max: "Maks",
    },
    productCard: {
      defaultCategory: "BMW Parts",
      descriptionFallback: "Part BMW original atau copotan terkurasi dengan update stok real-time.",
      detail: "Detail",
      buyTokopedia: "Beli di Tokopedia",
    },
    productDetail: {
      metadataNotFound: "Produk tidak ditemukan | Planet Motor BMW",
      metadataDescriptionFallback: "Lihat {name} dengan stok realtime dan inquiry cepat di Planet Motor BMW.",
      imagePlaceholder: "Placeholder gambar produk",
      descriptionFallback: "Spare part BMW original/copotan berkualitas dengan kondisi terverifikasi.",
      lastUpdate: "Update terakhir",
      price: "Harga",
      bullets: [
        "Verifikasi stok realtime",
        "Update ketersediaan langsung",
        "Inquiry cepat via WhatsApp",
      ],
      buyTokopedia: "Beli di Tokopedia",
      askWhatsapp: "Tanya via WhatsApp",
      backToProducts: "Kembali ke produk",
      whyChoose: "Mengapa pelanggan memilih produk ini",
      reasons: [
        "Pilihan part BMW original/copotan dengan quality control yang konsisten.",
        "Info stok ditampilkan lebih jelas untuk membantu mengurangi salah order.",
        "Tim siap membantu pengecekan kompatibilitas sebelum transaksi.",
      ],
      relatedBadge: "TERKAIT",
      relatedTitle: "Anda mungkin juga suka",
    },
    footer: {
      description:
        "Planet Motor BMW membantu pembeli menelusuri spare part BMW melalui kategori yang jelas, admin WhatsApp yang responsif, dan jalur checkout resmi ke Tokopedia.",
      primaryShowcase: "ETALASE UTAMA",
      quickLinks: "LINK CEPAT",
      contact: "CONTACT",
      location: "LOCATION",
      quick: {
        home: "Beranda",
        products: "Produk",
        about: "Tentang Kami",
        contact: "Kontak",
      },
      address: STORE_ADDRESS,
      hours: "Sen-Sab, 09:00-17:00 WIB",
      rights: "Semua hak dilindungi.",
      tagline: "Spare part BMW original & copotan dari Planet Motor BMW.",
    },
  },
  en: {
    common: {
      brand: "Planet Motor BMW",
      tokopedia: "Tokopedia",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
      language: "Language",
      chooseLanguage: "Choose language",
      english: "English",
      indonesian: "Bahasa Indonesia",
      close: "Close",
      openInMaps: "Open in Google Maps",
    },
    header: {
      nav: {
        home: "Home",
        products: "Products",
        about: "About",
        contact: "Contact",
      },
      topBadge: "Trusted Tokopedia store for BMW spare parts",
      theme: {
        switchToLight: "Use light mode",
        switchToDark: "Use dark mode",
      },
      mobileMenu: {
        open: "Open navigation menu",
        close: "Close navigation menu",
        description: "Quick access to the catalog, store information, and Planet Motor BMW contact channels.",
      },
      contact: {
        label: "WhatsApp chat",
      },
    },
    languageModal: {
      badge: "FIRST VISIT SETUP",
      title: "Choose your preferred language",
      description: "We will remember your language choice across all public Planet Motor BMW pages.",
      cards: {
        id: {
          title: "Bahasa Indonesia",
          description: "Best for local visitors and day-to-day browsing.",
        },
        en: {
          title: "English",
          description: "Useful if you prefer English while browsing the public catalog and pages.",
        },
      },
    },
    home: {
      hero: {
        badge: "Trusted BMW Parts Supplier",
        title: "Premium BMW Spare Parts",
        description:
          "Planet Motor BMW presents a cleaner parts catalog, responsive fitment consultation, and a clearer purchase flow through Tokopedia or WhatsApp.",
        primaryCta: "Buy via Tokopedia",
        secondaryCta: "WhatsApp consultation",
        floatingCards: {
          curation: {
            title: "Original & Used Parts",
            description: "Organized clearly by BMW category.",
          },
          response: {
            title: "Fast Response",
            description: "Part-fitment help via WhatsApp.",
          },
          trust: {
            title: "Tokopedia Rating",
            description: "4.9 / 96 reviews",
          },
        },
        stats: {
          ratings: "store ratings",
          reviews: "reviews",
          sold: "items sold",
          satisfaction: "buyer satisfaction",
          categories: "active showcases",
        },
      },
      socialProof: {
        badge: "STORE SNAPSHOT",
        title: "Tokopedia-ready, consultative, and focused on BMW parts with clear stock visibility.",
        description:
          "The experience combines a cleaner catalog with faster inquiry support so visitors can move from browsing to buying with more confidence.",
        items: {
          products: "Products available",
          categories: "Active showcases",
          rating: "Store rating",
          sold: "Products sold",
        },
      },
      features: {
        badge: "CORE VALUE",
        title: "A more premium presentation for the catalog, buying flow, and BMW parts assistance.",
        description:
          "The landing page is structured to help visitors quickly understand store quality, browse showcases, then continue to inquiry or Tokopedia.",
        cards: [
          {
            title: "Live inventory",
            description: "Stock is surfaced more clearly to reduce repeated questions and mistaken purchases.",
          },
          {
            title: "Curated parts",
            description: "Original and quality used BMW parts are presented with more structured information.",
          },
          {
            title: "Responsive WhatsApp support",
            description: "The team helps confirm fitment and buying direction before opening Tokopedia.",
          },
          {
            title: "Tokopedia-first flow",
            description: "The website acts as a company profile and catalog, while transactions stay safely on Tokopedia.",
          },
        ],
        highlight: {
          badge: "WHY PLANET MOTOR BMW",
          title: "A cleaner flow for serious buyers looking for BMW spare parts.",
          description:
            "The approach feels closer to a digital showroom: premium, informative, and immediately directed toward the most relevant action.",
          bullets: [
            "The catalog focuses on original and curated used BMW parts.",
            "Fast consultation helps validate model, part number, and stock alternatives.",
            "Purchases are directed to Tokopedia so payment and shipping stay centralized.",
          ],
          floatingTitle: "Store highlight",
          floatingValue: "97% satisfied",
          floatingDescription: "supported by fast responses and clearer stock details.",
        },
      },
      services: {
        badge: "PURCHASE FLOW",
        title: "Buying support feels more like a premium service, not just a passive catalog.",
        description:
          "The layout is inspired by modern showcase landing pages, then adapted to the needs of a BMW spare parts store.",
        consultation: {
          badge: "PART CONSULTATION",
          title: "Start from the vehicle need, not just the part name.",
          description:
            "Send your BMW model, production year, or part number. We help guide you to the most relevant part before you continue to Tokopedia.",
          cards: [
            {
              title: "Part number check",
              description: "Validate code, model, and replacement needs before purchase.",
            },
            {
              title: "Alternative suggestion",
              description: "If the main stock is unavailable, we help point you to the most reasonable option.",
            },
          ],
        },
        flow: {
          badge: "TOKOPEDIA FLOW",
          title: "The website acts as a digital showroom, Tokopedia remains the main transaction point.",
          description:
            "The landing page showcases the catalog and store credibility, then routes buyers into a familiar and trusted checkout flow.",
          steps: [
            {
              title: "Browse the catalog",
              description: "Explore showcases, product detail, and stock status directly from the website.",
            },
            {
              title: "Checkout via Tokopedia",
              description: "Use the Tokopedia action to continue the official marketplace transaction.",
            },
            {
              title: "Confirm via WhatsApp",
              description: "If needed, the team can still help before or after checkout.",
            },
          ],
        },
      },
      categories: {
        badge: "MAIN SHOWCASES",
        title: "Find BMW part categories faster.",
        description:
          "Presented as a premium grid that is easy to scan for first-time visitors and repeat buyers alike.",
        productCountSuffix: "products",
      },
      products: {
        badge: "TOP PICKS",
        title: "The Precision Catalog",
        description:
          "Top-tier original and curated used BMW parts prepared for quick decision-making.",
      },
      topPicks: {
        badge: "TOP PICKS LOOP",
        title: "Fast-moving picks for high-demand BMW parts.",
        description:
          "Built as a continuous horizontal rail so buyers can scan more relevant products without adding vertical clutter.",
      },
      reviews: {
        badge: "TOKOPEDIA REVIEWS",
        title: "Customer reviews that strengthen store credibility.",
        description:
          "Presented like a premium testimonial section to build confidence before visitors enter the catalog or checkout flow.",
        trustLabel: "Buyer trust",
        summary: "buyer satisfaction",
        sold: "sold",
      },
      faq: {
        badge: "SUPPORT",
        title: "Common questions and a faster support path.",
        description:
          "The FAQ is paired with contact cards so visitors do not stop at information, but can immediately take action.",
        items: [
          {
            question: "Are all parts at Planet Motor BMW original?",
            answer:
              "We provide original and curated used parts. Condition details and part type are shown in the catalog, and you can confirm again through WhatsApp before opening Tokopedia.",
          },
          {
            question: "How do I order a product?",
            answer:
              "Transactions are completed through the Planet Motor BMW Tokopedia store. From this website, you can open a product and continue directly to the official Tokopedia listing.",
          },
          {
            question: "Can I ask for fitment consultation?",
            answer:
              "Yes. Send your BMW model, year, and part requirement through WhatsApp so the team can help verify fitment before purchase.",
          },
          {
            question: "What about shipping information and estimated arrival?",
            answer:
              "Tokopedia handles payment confirmation and delivery tracking. Delivery timing depends on the courier and destination address.",
          },
          {
            question: "Is there any warranty for purchased parts?",
            answer:
              "Warranty depends on the part type and store policy. Please contact WhatsApp first for confirmation on the item you want to buy.",
          },
          {
            question: "What payment methods are available?",
            answer:
              "All official payment methods follow the options available on Tokopedia, including bank transfer, e-wallets, cards, and other platform-supported methods.",
          },
        ],
        contact: {
          badge: "GET IN TOUCH",
          title: "Need quick help before checkout?",
          description:
            "The Planet Motor BMW team is ready to help through WhatsApp for stock questions, fitment checks, or buying guidance.",
          cards: {
            whatsapp: {
              title: "WhatsApp",
              description: "The fastest channel for part consultation and stock confirmation.",
              value: "0812-3456-7890",
            },
            tokopedia: {
              title: "Tokopedia Store",
              description: "Continue to our official showcase for safe transactions.",
              value: "Planet Motor BMW",
            },
            location: {
              title: "Location",
              description: "Based in East Jakarta and ready to serve BMW parts inquiries.",
              value: "East Jakarta",
            },
          },
          primaryCta: "Chat on WhatsApp",
          secondaryCta: "Visit Tokopedia",
        },
      },
      cta: {
        badge: "CALL TO ACTION",
        title: "Looking for a specific BMW part? Send your requirement list now.",
        description:
          "Planet Motor BMW is ready to help with product recommendations and model fitment. Checkout on Tokopedia, consult quickly on WhatsApp.",
        primaryCta: "Buy on Tokopedia",
        secondaryCta: "Chat on WhatsApp",
      },
    },
    about: {
      badge: "ABOUT PLANET MOTOR BMW",
      title: "A BMW parts store with a Tokopedia showcase that feels clearer, cleaner, and easier to act on.",
      description:
        "Planet Motor BMW serves buyers looking for original and curated used BMW parts through its official Tokopedia showcase, WhatsApp admin support, and a web catalog that makes categories, stock context, and checkout direction easier to understand.",
      primaryCta: "Chat on WhatsApp",
      secondaryCta: "Browse Catalog",
      stats: [
        { value: "1500+", label: "Active parts" },
        { value: "6", label: "Active showcases" },
        { value: "4.9/5", label: "Store rating" },
      ],
      story: {
        badge: "ABOUT US",
        title: "About Us",
        paragraphs: [
          "Planet Motor BMW is known as a Tokopedia-based BMW parts store that focuses on original and curated used parts for daily needs as well as harder-to-find requests.",
          "Showcases such as Rak Lampu, Rak Spare Part, Rak Kaca, Variasi, Bumper Cover, and Ban Velg help buyers discover products, then continue with stock confirmation or checkout through our official channels.",
        ],
      },
      values: {
        badge: "CORE VALUES",
        title: "Our Values",
        cards: [
          {
            title: "#Precision",
            description:
              "Every product and showcase is arranged so Tokopedia buyers can quickly identify the part category, buying context, and the next step they should take.",
          },
          {
            title: "#Transparency",
            description:
              "Catalog information, inquiry direction, and checkout paths are made as clear as possible so buyers know when to chat the admin and when they can proceed straight to Tokopedia.",
          },
          {
            title: "#Responsiveness",
            description:
              "WhatsApp is used to help with stock checks, showcase direction, and pre-checkout questions before a buyer completes the marketplace transaction.",
          },
        ],
      },
      trust: {
        badge: "WHY CUSTOMERS TRUST US",
        title: "The buying experience follows how Tokopedia customers naturally browse from showcase to checkout.",
        description:
          "This page mirrors the real store flow: browse category context, check availability, contact the admin when needed, then continue to the official Tokopedia showcase.",
        items: [
          {
            title: "Showcases follow the official store",
            description: "The main website categories are aligned with the store's real showcase structure so buyers do not feel pushed into a different browsing flow.",
          },
          {
            title: "Admin support before checkout",
            description: "Questions about stock, product intent, and which showcase to open can be clarified first through WhatsApp.",
          },
          {
            title: "Transactions remain on Tokopedia",
            description: "Payment, shipping, and purchase records stay inside the official marketplace channel buyers already trust.",
          },
          {
            title: "Focused on real BMW part needs",
            description: "The content, categories, and support flow are built for buyers actually searching for BMW spare parts, not a generic automotive catalog.",
          },
        ],
      },
      onlineShop: {
        badge: "ONLINE SHOP",
        title: "Our online channels follow how customers already interact with the real Tokopedia store.",
        description:
          "From the website catalog to the official Tokopedia showcase, every path below is built around the shopping behavior the store already handles today.",
        cards: [
          {
            eyebrow: "TOKOPEDIA",
            title: "Official Store",
            description: "The official showcase for checkout, store reviews, and a payment or shipping flow that already feels familiar to Planet Motor BMW buyers.",
            href: "https://tk.tokopedia.com/ZSHhyGtpk/",
            external: true,
          },
          {
            eyebrow: "WEBSITE",
            title: "Product Catalog",
            description: "The website helps buyers read categories such as Rak Lampu, Rak Spare Part, Rak Kaca, Variasi, Bumper Cover, and Ban Velg before entering Tokopedia.",
            href: "/products",
            external: false,
          },
          {
            eyebrow: "WHATSAPP",
            title: "Quick Consultation",
            description: "Chat the admin for stock confirmation, part questions, or an early check before opening the Tokopedia showcase.",
            href: "https://wa.me/6281234567890",
            external: true,
          },
          {
            eyebrow: "SUPPORT",
            title: "Fitment Guidance",
            description: "If a buyer is unsure about the part name or the right category, we help point them toward the closest showcase or product path.",
            href: "/contact",
            external: false,
          },
          {
            eyebrow: "STORE FLOW",
            title: "Clear Stock Visibility",
            description: "The catalog is designed to surface stock context and product intent faster so buyers can decide with better confidence.",
            href: "/products",
            external: false,
          },
          {
            eyebrow: "TOKOPEDIA",
            title: "Marketplace-first Purchase",
            description: "Once the need is clear, the purchase stays on Tokopedia so payment, shipping, and purchase records remain properly organized.",
            href: "https://tk.tokopedia.com/ZSHhyGtpk/",
            external: true,
          },
        ],
      },
      location: {
        badge: "STORE LOCATION",
        title: "Serving BMW enthusiasts from Jakarta",
        description:
          "Our team operates from East Jakarta to handle daily Tokopedia inquiries, stock confirmation, and buying guidance for BMW customers.",
        address: STORE_ADDRESS,
        hours: "Monday - Saturday, 09:00 - 17:00 WIB",
        supportTitle: "Support available from our base:",
        supportItems: [
          "BMW part consultation via WhatsApp",
          "Guidance toward the official Tokopedia showcase",
          "Help checking stock for the product being searched",
          "Early assistance before customers continue to checkout",
        ],
        serviceTitle: "What you can do next:",
        serviceItems: [
          "Browse part categories from the website",
          "Open the official Tokopedia showcase",
          "Contact the admin for specific part questions",
          "Get a more guided purchase experience",
        ],
        mapTitle: "Planet Motor BMW location",
        mapsEmbedUrl: STORE_MAP_EMBED_URL,
        mapsCta: "Open navigation",
        mapsCtaHref: STORE_MAP_URL,
      },
      cta: {
        badge: "READY TO SHOP",
        title: "Browse the showcases, ask for the part you need, then complete checkout through the official Tokopedia store.",
        description:
          "Start from the website catalog to read the categories, continue with admin support when needed, then finish the transaction through Planet Motor BMW's official Tokopedia store.",
        primaryCta: "Chat on WhatsApp",
        secondaryCta: "Visit Tokopedia",
      },
    },
    contactPage: {
      badge: "CONTACT",
      title: "Contact Planet Motor BMW",
      description:
        "Use the official channels the store already relies on for inquiries, stock checks, and continuing BMW spare-part purchases.",
      whatsapp: {
        title: "WhatsApp",
        description: "Chat directly for product inquiries, part checks, and buying guidance.",
      },
      tokopedia: {
        title: "Tokopedia Official Store",
        description: "Open the official showcase to view active listings and continue checkout in the marketplace.",
      },
      catalog: {
        title: "Live Catalog Snapshot",
        description: "The showcase and product totals below follow the active Planet Motor BMW catalog.",
      },
      phone: {
        title: "Phone",
      },
      email: {
        title: "Email",
      },
      address: {
        title: "Address",
        value: STORE_ADDRESS,
      },
    },
    productsPage: {
      breadcrumbHome: "Home",
      breadcrumbProducts: "Products",
      vehicleFinderBadge: "BMW FITMENT FINDER",
      vehicleFinderTitle: "Find parts based on your BMW vehicle",
      vehicleFinderDescription: "Choose model year, series, and chassis to surface the most relevant parts.",
      yearLabel: "Year",
      yearAll: "All years",
      seriesLabel: "BMW Series",
      seriesAll: "All series",
      chassisLabel: "Chassis code",
      chassisAll: "All chassis",
      keywordLabel: "Part / Keyword",
      keywordPlaceholder: "Example: F30 brake pad",
      findParts: "Find Parts",
      clearFitment: "Reset Fitment",
      all: "All",
      items: "Items",
      popular: "Popular",
      newest: "Newest",
      priceLowHigh: "Price: Low to High",
      priceHighLow: "Price: High to Low",
      filters: "Filters",
      search: "Search",
      searchPlaceholder: "Search products...",
      categories: "Categories",
      priceRange: "Price Range",
      applyPrice: "Apply Price",
      stockStatus: "Stock Status",
      available: "Available",
      lowStock: "Low Stock",
      outOfStock: "Out of Stock",
      applyFilters: "Apply Filters",
      resetFilters: "Reset filters",
      noProductsTitle: "No products found",
      noProductsDescription: "Try changing your filters or search keyword.",
      showingProducts: "Showing",
      productsSuffix: "products",
      min: "Min",
      max: "Max",
    },
    productCard: {
      defaultCategory: "BMW Parts",
      descriptionFallback: "Curated original or used BMW part with real-time stock updates.",
      detail: "Detail",
      buyTokopedia: "Buy on Tokopedia",
    },
    productDetail: {
      metadataNotFound: "Product not found | Planet Motor BMW",
      metadataDescriptionFallback: "View {name} with real-time stock and quick inquiry at Planet Motor BMW.",
      imagePlaceholder: "Product image placeholder",
      descriptionFallback: "Quality original/used BMW spare part with verified condition.",
      lastUpdate: "Last update",
      price: "Price",
      bullets: [
        "Real-time stock verification",
        "Direct availability updates",
        "Fast inquiry via WhatsApp",
      ],
      buyTokopedia: "Buy on Tokopedia",
      askWhatsapp: "Ask via WhatsApp",
      backToProducts: "Back to products",
      whyChoose: "Why customers choose this product",
      reasons: [
        "Original/used BMW part options with consistent quality control.",
        "Clearer stock information to help reduce ordering mistakes.",
        "The team is ready to help confirm compatibility before the transaction.",
      ],
      relatedBadge: "RELATED",
      relatedTitle: "You may also like",
    },
    footer: {
      description:
        "Planet Motor BMW helps buyers browse BMW spare parts through clearer categories, responsive WhatsApp support, and an official Tokopedia checkout path.",
      primaryShowcase: "MAIN SHOWCASES",
      quickLinks: "QUICK LINKS",
      contact: "CONTACT",
      location: "LOCATION",
      quick: {
        home: "Home",
        products: "Products",
        about: "About",
        contact: "Contact",
      },
      address: STORE_ADDRESS,
      hours: "Mon-Sat, 09:00-17:00 WIB",
      rights: "All rights reserved.",
      tagline: "Original & used BMW spare parts from Planet Motor BMW.",
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
