type FallbackGoProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: string;
  stock: number;
  unit: string;
  imageUrl?: string | null;
  isActive: boolean;
  status: string;
  lowStockThreshold: number;
  stockUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
};

type FallbackGoCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  productCount?: number;
};

const FALLBACK_CATEGORY_META = {
  "rak-lampu": {
    id: "cat-rak-lampu",
    name: "Rak Lampu",
    slug: "rak-lampu",
    description: "Headlamp, foglamp, stoplamp, and other BMW lighting parts.",
  },
  "rak-spare-part": {
    id: "cat-rak-spare-part",
    name: "Rak Spare Part",
    slug: "rak-spare-part",
    description: "Core replacement BMW components for daily service and repair.",
  },
  "rak-kaca": {
    id: "cat-rak-kaca",
    name: "Rak Kaca",
    slug: "rak-kaca",
    description: "BMW mirror, trim, and glass-related parts.",
  },
  variasi: {
    id: "cat-variasi",
    name: "Variasi",
    slug: "variasi",
    description: "Selected BMW accessories and finishing parts.",
  },
  "bumper-cover": {
    id: "cat-bumper-cover",
    name: "Bumper & Cover",
    slug: "bumper-cover",
    description: "Front and rear BMW bumper assemblies plus cover parts.",
  },
  "ban-velg": {
    id: "cat-ban-velg",
    name: "Ban Velg",
    slug: "ban-velg",
    description: "BMW wheel and rim catalog with premium fitment options.",
  },
} as const;

const DEFAULT_TIMESTAMP = "2026-04-16T08:00:00.000Z";

function createFallbackProduct(
  categorySlug: keyof typeof FALLBACK_CATEGORY_META,
  product: Omit<FallbackGoProduct, "categoryId" | "categoryName" | "categorySlug" | "createdAt" | "updatedAt" | "stockUpdatedAt" | "isActive">,
): FallbackGoProduct {
  const category = FALLBACK_CATEGORY_META[categorySlug];

  return {
    ...product,
    categoryId: category.id,
    categoryName: category.name,
    categorySlug: category.slug,
    createdAt: DEFAULT_TIMESTAMP,
    updatedAt: DEFAULT_TIMESTAMP,
    stockUpdatedAt: DEFAULT_TIMESTAMP,
    isActive: true,
  };
}

export const FALLBACK_GO_PRODUCTS: FallbackGoProduct[] = [
  createFallbackProduct("ban-velg", {
    id: "fallback-velg-r18-bmw-f45",
    name: "Velg R18 BMW F45",
    slug: "velg-r18-bmw-f45",
    description: "Original-style BMW F45 wheel set with clean finish and showroom-ready presentation.",
    price: "4500000.00",
    stock: 2,
    unit: "pcs",
    imageUrl: "https://images.tokopedia.net/img/cache/900/VqbcmM/2020/12/10/8496c6d9-8d05-480e-a5df-93d69119f91b.jpg",
    status: "AVAILABLE",
    lowStockThreshold: 2,
  }),
  createFallbackProduct("ban-velg", {
    id: "fallback-velg-r18-bmw-x1-e84",
    name: "Velg R18 BMW X1 E84",
    slug: "velg-r18-bmw-x1-e84",
    description: "BMW X1 E84 wheel option with precise stance and premium visual finish.",
    price: "4200000.00",
    stock: 2,
    unit: "pcs",
    imageUrl: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/6/19/1b174dc6-0f42-4165-8b9d-038ed6117638.jpg",
    status: "AVAILABLE",
    lowStockThreshold: 2,
  }),
  createFallbackProduct("bumper-cover", {
    id: "fallback-bumper-belakang-bmw-f10-lci",
    name: "Bumper Belakang BMW F10 LCI",
    slug: "bumper-belakang-bmw-f10-lci",
    description: "Rear bumper section for BMW F10 LCI with clean body-line fitment and ready stock.",
    price: "5000000.00",
    stock: 2,
    unit: "pcs",
    imageUrl: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/7/31/334e6b42-d2ec-4a9e-83b1-c992046284c5.jpg",
    status: "AVAILABLE",
    lowStockThreshold: 1,
  }),
  createFallbackProduct("bumper-cover", {
    id: "fallback-bumper-belakang-bmw-e90-new-ori",
    name: "Bumper Belakang BMW E90 New Ori",
    slug: "bumper-belakang-bmw-e90-new-ori",
    description: "OEM-grade rear bumper for BMW E90 with refined condition and clean finishing.",
    price: "7000000.00",
    stock: 1,
    unit: "pcs",
    imageUrl: "https://images.tokopedia.net/img/cache/900/product-1/2019/8/30/546388481/546388481_c16c6a31-0051-4cd3-89a3-c601723ce2db_1024_1024.jpg",
    status: "AVAILABLE",
    lowStockThreshold: 1,
  }),
  createFallbackProduct("rak-kaca", {
    id: "fallback-cover-spion-bmw-f30-lh",
    name: "Cover Spion BMW F30 LH Copotan",
    slug: "cover-spion-bmw-f30-lh-copotan",
    description: "Curated used BMW F30 mirror cover with tidy condition and fitment-ready form.",
    price: "1000000.00",
    stock: 2,
    unit: "pcs",
    imageUrl: "https://images.tokopedia.net/img/cache/900/VqbcmM/2023/12/4/f707926b-f93f-43eb-822f-7b4c7f8527da.jpg",
    status: "AVAILABLE",
    lowStockThreshold: 2,
  }),
  createFallbackProduct("rak-kaca", {
    id: "fallback-cover-spion-bmw-g20-g21-kiri-2021",
    name: "Cover Spion BMW G20 G21 Kiri 2021",
    slug: "cover-spion-bmw-g20-g21-kiri-2021",
    description: "BMW G20 and G21 left mirror cover with clean finish and premium display quality.",
    price: "1300000.00",
    stock: 2,
    unit: "pcs",
    imageUrl: "https://images.tokopedia.net/img/cache/900/VqbcmM/2024/1/9/7e1298f9-8a54-46e2-aaa6-99c7ba69dfd0.jpg",
    status: "AVAILABLE",
    lowStockThreshold: 2,
  }),
  createFallbackProduct("rak-kaca", {
    id: "fallback-spion-bmw-x3-g01",
    name: "Spion BMW X3 G01",
    slug: "spion-bmw-x3-g01",
    description: "BMW X3 G01 mirror assembly with original look and daily-driver compatibility.",
    price: "7000000.00",
    stock: 1,
    unit: "pcs",
    imageUrl: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/11/6/5c7b781d-9f27-4c35-be1d-06037c04f4c9.jpg",
    status: "AVAILABLE",
    lowStockThreshold: 1,
  }),
  createFallbackProduct("rak-lampu", {
    id: "fallback-foglamp-bmw-f10-lci-lh",
    name: "Foglamp BMW F10 LCI LH",
    slug: "foglamp-bmw-f10-lci-lh",
    description: "BMW F10 LCI foglamp with clean lens condition and immediate dispatch readiness.",
    price: "1500000.00",
    stock: 2,
    unit: "pcs",
    imageUrl: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/12/14/999060d6-1147-4d4a-b098-1ddf32883e86.jpg",
    status: "AVAILABLE",
    lowStockThreshold: 2,
  }),
  createFallbackProduct("rak-lampu", {
    id: "fallback-headlamp-bmw-g20-lh",
    name: "Headlamp BMW G20 LH",
    slug: "headlamp-bmw-g20-lh",
    description: "BMW G20 left headlamp assembly with premium output and flagship presentation.",
    price: "30000000.00",
    stock: 1,
    unit: "pcs",
    imageUrl: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/8/21/732fbc13-ff2d-43a4-8d6b-7e73644540a8.jpg",
    status: "AVAILABLE",
    lowStockThreshold: 1,
  }),
  createFallbackProduct("rak-lampu", {
    id: "fallback-headlamp-led-assy-bmw-x1-e84-lci",
    name: "Headlamp LED Assy BMW X1 E84 LCI",
    slug: "headlamp-led-assy-bmw-x1-e84-lci",
    description: "LED headlamp set for BMW X1 E84 LCI, selected for premium catalog presentation.",
    price: "18000000.00",
    stock: 1,
    unit: "pcs",
    imageUrl: "https://images.tokopedia.net/img/cache/900/VqbcmM/2020/12/10/58ebd13d-bc20-47ec-a344-3804f73116b5.jpg",
    status: "AVAILABLE",
    lowStockThreshold: 1,
  }),
  createFallbackProduct("rak-spare-part", {
    id: "fallback-as-roda-belakang-kanan-bmw-x1-e84",
    name: "As Roda Belakang Kanan BMW X1 E84",
    slug: "as-roda-belakang-kanan-bmw-x1-e84",
    description: "Rear right axle for BMW X1 E84 with verified stock and clean condition notes.",
    price: "7000000.00",
    stock: 1,
    unit: "pcs",
    imageUrl: "https://images.tokopedia.net/img/cache/900/product-1/2018/8/18/3226595/3226595_12467609-529b-4c28-94cf-42d999b9a9c7_540_318.jpg",
    status: "AVAILABLE",
    lowStockThreshold: 1,
  }),
  createFallbackProduct("rak-spare-part", {
    id: "fallback-kampas-rem-depan-bmw-e36-e46",
    name: "Kampas Rem Depan BMW E36 E46",
    slug: "kampas-rem-depan-bmw-e36-e46",
    description: "Front brake pad set for BMW E36 and E46 with practical daily-use fitment coverage.",
    price: "375000.00",
    stock: 3,
    unit: "pcs",
    imageUrl: "https://images.tokopedia.net/img/cache/900/product-1/2020/7/18/3226595/3226595_92141fb4-78ea-4eab-9421-807f2d902aba_1014_1014.jpg",
    status: "AVAILABLE",
    lowStockThreshold: 2,
  }),
  createFallbackProduct("rak-spare-part", {
    id: "fallback-repair-kit-pressure-regulating-valve-bmw-e66-e70",
    name: "Repair Kit Pressure Regulating Valve BMW E66 E70",
    slug: "repair-kit-pressure-regulating-valve-bmw-e66-e70",
    description: "Precision valve repair kit for BMW E66 and E70 maintenance work.",
    price: "550000.00",
    stock: 2,
    unit: "pcs",
    imageUrl: "https://images.tokopedia.net/img/cache/900/VqbcmM/2020/10/24/3ef68409-b229-4f38-9f69-7f34e5a55f33.jpg",
    status: "AVAILABLE",
    lowStockThreshold: 2,
  }),
  createFallbackProduct("variasi", {
    id: "fallback-floor-mats-bmw-f30-f30-lci",
    name: "Floor Mats BMW F30 F30 LCI",
    slug: "floor-mats-bmw-f30-f30-lci",
    description: "BMW F30 and F30 LCI front floor mats with clean finishing and premium cabin fit.",
    price: "2000000.00",
    stock: 2,
    unit: "pcs",
    imageUrl: "https://images.tokopedia.net/img/cache/900/VqbcmM/2020/11/26/d7560811-12cb-46e0-b2af-beaeed138616.jpg",
    status: "AVAILABLE",
    lowStockThreshold: 2,
  }),
  createFallbackProduct("variasi", {
    id: "fallback-knalpot-belakang-new-ori-bmw-e39",
    name: "Knalpot Belakang New Ori BMW E39",
    slug: "knalpot-belakang-new-ori-bmw-e39",
    description: "New original rear exhaust for BMW E39 with curated warehouse stock.",
    price: "3500000.00",
    stock: 2,
    unit: "pcs",
    imageUrl: "https://images.tokopedia.net/img/cache/900/VqbcmM/2020/10/18/d677893a-bfae-4540-8673-f92a1969b832.jpg",
    status: "AVAILABLE",
    lowStockThreshold: 2,
  }),
  createFallbackProduct("variasi", {
    id: "fallback-towing-hinge-new-ori-bmw-f30-f48",
    name: "Towing Hinge New Ori BMW F30 F48",
    slug: "towing-hinge-new-ori-bmw-f30-f48",
    description: "Original towing hinge for BMW F30 and F48 with compact utility-focused fitment.",
    price: "425000.00",
    stock: 4,
    unit: "pcs",
    imageUrl: "https://images.tokopedia.net/img/cache/900/VqbcmM/2020/12/19/de84bbf0-4ef7-4b01-9c92-25ef4d644fbf.jpg",
    status: "AVAILABLE",
    lowStockThreshold: 2,
  }),
];

export function getFallbackGoCategories(): FallbackGoCategory[] {
  return Object.values(FALLBACK_CATEGORY_META).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: null,
    createdAt: DEFAULT_TIMESTAMP,
    productCount: FALLBACK_GO_PRODUCTS.filter((product) => product.categorySlug === category.slug).length,
  }));
}
