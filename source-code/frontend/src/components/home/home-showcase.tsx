/* eslint-disable @next/next/no-img-element */

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Headphones,
  Star,
} from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { GridCardIcon, type GridCardIconName } from "@/components/shared/grid-card-icon";
import { formatCurrency } from "@/lib/format";

type CategorySummary = {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
};

type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: string | number;
  stock: number;
  unit: string;
  imageUrl?: string | null;
  status: string;
  lowStockThreshold: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

type ReviewItem = {
  name: string;
  product: string;
  comment: string;
  stars: number;
  avatar: string;
};

type HomeShowcaseProps = {
  categories: CategorySummary[];
  featuredProducts: ProductSummary[];
  topPickProducts: ProductSummary[];
  reviews: ReviewItem[];
  tokopediaStats: {
    rating: number;
    totalRatings: number;
    satisfaction: number;
    sold: number;
  };
  tokopediaStoreUrl: string;
  whatsappUrl: string;
};

const CATEGORY_IMAGES: Record<string, string> = {
  "ban-velg": "/images/categories/ban-velg.png",
  "bemper-caver": "/images/categories/bemper-caver.png",
  "bumper-cover": "/images/categories/bemper-caver.png",
  "rak-kaca": "/images/categories/rak-kaca.png",
  "rak-lampu": "/images/categories/rak-lampu.png",
  "rak-spare-part": "/images/categories/rak-spare-part.png",
  variasi: "/images/categories/variasi.png",
};

const HERO_BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBs47keUaboboueEhk2_oA8CXAD1mJ-cCwbBoWxPvE89vXYtoJoH2JF424JqmvwsFt79qE5xCFt1ZlIbsfc5H_5JTiYQ5v_48hKvT0v8629V79hyLExyCsREzluiUeofu86wBZEIMKcCzzbf3upJwKO01C7uRjcjB5ALg6GTEfEFVtW7SVDHk2sL55TUjFE0ujaKCJv9OjtvaKbzg8iE2thvGuekxjNklsa-1eFoWQCaZjTSxWHkRgmpq839xSnFN6Run7VLdYtqalw";
const HERO_CAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDVH8ZFYRmIYoiInNC__LLk1cRd_ev9UI4obDAfgmBjs-zCt0UXhuXKDJ8PLrU42sqUK-Pfjb43S9iuvqafE2Jnw6FXVrMFtePqw0G2q7Z5T5PwpyoaNSguJpdlliKochP3PSC7M9d4RXIANWgryzgcUQ5fIHWdD6jsun0OZ0lYM1fCTz4lCBHt2SErdWOZr9Z47AKMbrgLWwibS6K8yFd4PQPw98Z0J3G89kyPnjMgt5-QGIi3JkezXYEYmOqWgy-01nPhUHbcuT1I";
const PRECISION_HERO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB8UtSFwSuuUU2680vIJym63ozTVpD6vQTE6h0XRFMn4iid2weRgl1ZFFSH6AYdFJ0UU9IS5jaBU3t1tbpFjR_37j5dzrKOe4zzq2fWvBPtyMgmyqjStKQXel3EViHTCt9gpayFLkmOAA-ztqFDPtZzOONk1W0ImRC0ygzGzsXwnAZ7X6XqaSl0CWWnC3PyMVOrbrXWb2q59R0kt6lEMXYzdGd_8Z4mlciBfh4g_yGVZxz90FX9R5IegCgRqsfYsEPHw7Af0XMu3bz7";
const PRECISION_SECONDARY =
  "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop";
const HERITAGE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBk9XRjULD-WpczhynuDaK7DjP-vmswXCsuirHueHSgXh1989d-9lZXts0BjvIMLESuGFbTL7W5cEhTCma2N-_q1sIGQRFdQc9x0_OXCvSWV1-Badh7Y8YZyBNudRooKtQzgfTnr9oerhs4SW6F4Nop31huEL6fjnyrl0MuL88fvRaUReO_aW3Oj-jW3mvQo6mrXzR3NCJl_pr8c43cERp6tPzjVENvbEEcyWLi2BY4kQzCQ-ImMnPUozMly8sMVIcZFT679WJaqGvV";
const CTA_BG =
  "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=2000&auto=format&fit=crop";

const revealViewport = { once: true, amount: 0.22, margin: "-6% 0px -10% 0px" };
const revealEase = [0.16, 1, 0.3, 1] as const;

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.92, ease: revealEase },
  },
};

const staggerReveal: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

const itemReveal: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.68, ease: revealEase },
  },
};

export function HomeShowcase({
  categories,
  featuredProducts,
  topPickProducts,
  reviews,
  tokopediaStats,
  tokopediaStoreUrl,
  whatsappUrl,
}: HomeShowcaseProps) {
  const { messages } = useLocale();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  const totalProducts = categories.reduce((sum, category) => sum + category._count.products, 0);
  const categoryCards = categories.slice(0, 6);
  const essentialProducts = featuredProducts.slice(0, 4);
  const loopingTopPicks = [...topPickProducts, ...topPickProducts];
  const loopingReviews = [...reviews, ...reviews];
  const showcasePreview = categoryCards.slice(0, 4).map((category) => category.name).join(", ");

  const fitmentOptions = useMemo(
    () => ["E30 3-Series", "E46 3-Series", "E92 3-Series", "F80 M3", "G80 M3"],
    [],
  );

  const engineOptions = useMemo(() => ["N52", "N55", "B48", "S55", "S58"], []);
  const smoothScrollSpring = { stiffness: 68, damping: 30, mass: 0.85 };
  const heroBackgroundY = useSpring(useTransform(scrollY, [0, 700], [0, 78]), smoothScrollSpring);
  const heroContentY = useSpring(useTransform(scrollY, [0, 500], [0, 28]), smoothScrollSpring);
  const heroCarY = useSpring(useTransform(scrollY, [0, 700], [0, -46]), smoothScrollSpring);
  const summaryY = useSpring(useTransform(scrollY, [220, 1200], [0, -18]), smoothScrollSpring);
  const heritageY = useSpring(useTransform(scrollY, [900, 1900], [0, -22]), smoothScrollSpring);
  const revealInitial = shouldReduceMotion ? false : "hidden";
  const revealWhileInView = shouldReduceMotion ? undefined : "show";
  const revealViewportOptions = shouldReduceMotion ? undefined : revealViewport;

  return (
    <div className="home-showcase min-h-screen overflow-x-clip bg-white text-slate-900 selection:bg-primary selection:text-white dark:bg-[#090f1d] dark:text-slate-100">
      <main>
        <section className="relative min-h-[85vh] overflow-hidden bg-white px-0 py-16 dark:bg-[#090f1d] md:py-20">
          <motion.div className="absolute inset-0 z-0" style={{ y: heroBackgroundY }}>
            <img
              alt="BMW engine detail background"
              className="h-full w-full object-cover opacity-10 mix-blend-multiply dark:opacity-[0.16] dark:mix-blend-screen"
              src={HERO_BG}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-[#090f1d] dark:via-[#090f1d]/92 dark:to-transparent" />
          </motion.div>

          <div className="container-wrap relative z-10 grid items-center gap-12 lg:grid-cols-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-7"
              style={{ y: heroContentY }}
            >
              <div className="mb-6 inline-block bg-[#0052CC] px-4 py-1 text-[10px] font-bold tracking-[0.3em] text-white uppercase">
                TOKOPEDIA STORE | BMW PARTS SPECIALIST
              </div>

              <h1 className="text-6xl font-extrabold leading-[0.9] tracking-tighter text-slate-900 dark:text-slate-100 md:text-8xl">
                BUILT FOR THE <br />
                <span className="text-primary">BMW BUYING FLOW.</span>
              </h1>

              <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300 md:text-xl">
                Planet Motor BMW helps buyers browse categories such as {showcasePreview}, ask questions through WhatsApp, and continue to the official Tokopedia store.
              </p>

              <div className="relative z-20 mt-12 max-w-2xl border border-primary/45 bg-white p-8 shadow-[3px_3px_0_rgba(68,94,255,0.48)] dark:border-primary/55 dark:bg-[#111827] dark:shadow-[3px_3px_0_rgba(82,125,255,0.32)]">
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold tracking-widest text-outline uppercase">Chassis</label>
                    <select className="h-12 rounded-md border border-primary/35 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-[2px_2px_0_rgba(68,94,255,0.22)] outline-none transition-colors focus:border-primary dark:border-primary/55 dark:bg-[#111827] dark:text-slate-100 dark:shadow-[2px_2px_0_rgba(82,125,255,0.24)]">
                      {fitmentOptions.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold tracking-widest text-outline uppercase">Engine</label>
                    <select className="h-12 rounded-md border border-primary/35 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-[2px_2px_0_rgba(68,94,255,0.22)] outline-none transition-colors focus:border-primary dark:border-primary/55 dark:bg-[#111827] dark:text-slate-100 dark:shadow-[2px_2px_0_rgba(82,125,255,0.24)]">
                      {engineOptions.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold tracking-widest text-outline uppercase">Category</label>
                    <select className="h-12 rounded-md border border-primary/35 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-[2px_2px_0_rgba(68,94,255,0.22)] outline-none transition-colors focus:border-primary dark:border-primary/55 dark:bg-[#111827] dark:text-slate-100 dark:shadow-[2px_2px_0_rgba(82,125,255,0.24)]">
                      {categoryCards.map((category) => (
                        <option key={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Link
                  href="/products"
                  className="motion-button block w-full rounded-md bg-[#0052CC] py-4 text-center text-[10px] font-bold tracking-[0.2em] text-white uppercase shadow-[3px_3px_0_rgba(68,94,255,0.36)] transition-all hover:bg-blue-700 dark:shadow-[3px_3px_0_rgba(82,125,255,0.32)] dark:hover:bg-brand-primary-hover active:scale-[0.98]"
                >
                  VERIFY FITMENT & SHOP
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:col-span-5 lg:block"
              style={{ y: heroCarY }}
            >
              <div className="bg-black p-4 shadow-2xl dark:bg-[#0b1322]">
                <img alt="BMW performance coupe" className="w-full grayscale brightness-110" src={HERO_CAR} referrerPolicy="no-referrer" />
              </div>
              <div className="absolute -bottom-6 -left-6 z-30 border-l-4 border-primary bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:bg-[#111827]">
                <div className="text-4xl font-black leading-none text-primary">4.9/5</div>
                <div className="mt-2 text-[10px] font-bold tracking-widest text-slate-900 uppercase dark:text-slate-100">TOKOPEDIA STORE RATING</div>
              </div>
            </motion.div>
          </div>

        </section>

        <motion.section
          id="store-summary"
          initial={revealInitial}
          whileInView={revealWhileInView}
          viewport={revealViewportOptions}
          variants={sectionReveal}
          className="scroll-mt-24 border-y border-outline-variant bg-white py-24"
        >
          <div className="container-wrap grid items-center gap-16 lg:grid-cols-2">
            <div className="max-w-xl">
              <span className="mb-4 block text-[10px] font-bold tracking-[0.3em] text-primary uppercase">Ringkasan Toko</span>
              <h2 className="text-4xl font-extrabold leading-[1.1] tracking-tighter text-slate-900 uppercase md:text-5xl">
                A clearer path from category browsing to inquiry, then on to Tokopedia.
              </h2>
              <p className="mt-6 font-light leading-relaxed text-slate-600">
                Categories such as {showcasePreview} help buyers understand where to start, which part line to open, and when to continue the conversation with the admin.
              </p>
            </div>

            <motion.div className="grid grid-cols-2 gap-6" style={{ y: summaryY }}>
                {[
                  { icon: "parts", value: `${totalProducts}+`, label: "Products available" },
                  { icon: "category", value: `${categories.length}`, label: "Store showcases" },
                  { icon: "rating", value: `${tokopediaStats.rating}/5`, label: "Store rating" },
                  { icon: "sold", value: `${tokopediaStats.sold}+`, label: "Products sold" },
                ].map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -5 }}
                  className="border border-primary/45 bg-white p-8 shadow-[3px_3px_0_rgba(68,94,255,0.55)] transition-all hover:border-primary hover:shadow-[6px_6px_0_rgba(68,94,255,0.65)] dark:border-primary/55 dark:bg-[#111827] dark:shadow-[3px_3px_0_rgba(82,125,255,0.32)] dark:hover:shadow-[6px_6px_0_rgba(82,125,255,0.42)]"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                    <GridCardIcon name={stat.icon as GridCardIconName} className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-black tracking-tighter text-slate-900">{stat.value}</div>
                  <div className="mt-1 text-[10px] font-bold tracking-widest text-outline uppercase">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          initial={revealInitial}
          whileInView={revealWhileInView}
          viewport={revealViewportOptions}
          variants={sectionReveal}
          className="bg-white py-24"
        >
          <div className="container-wrap">
            <div className="mb-16">
              <span className="mb-4 block text-[10px] font-bold tracking-[0.3em] text-primary uppercase">Collections</span>
              <h2 className="text-4xl font-extrabold tracking-tighter text-slate-900 uppercase leading-none">Shop by Category</h2>
            </div>

            <motion.div variants={staggerReveal} className="grid auto-rows-fr grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
              {categoryCards.map((category) => (
                <motion.div key={category.id} variants={itemReveal} whileHover={{ y: -8 }} className="h-full">
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="group flex h-full min-h-[308px] flex-col border border-primary/45 bg-white p-6 shadow-[3px_3px_0_rgba(68,94,255,0.48)] transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[6px_6px_0_rgba(68,94,255,0.62)] dark:border-primary/55 dark:bg-[#111827] dark:shadow-[3px_3px_0_rgba(82,125,255,0.32)] dark:hover:shadow-[6px_6px_0_rgba(82,125,255,0.42)]"
                  >
                    <div className="mb-6 aspect-square shrink-0 overflow-hidden bg-surface-container-low">
                      <img
                        alt={category.name}
                        className="h-full w-full object-contain p-4 grayscale transition-all duration-500 group-hover:scale-110 group-hover:grayscale-0"
                        src={CATEGORY_IMAGES[category.slug] ?? CATEGORY_IMAGES["rak-spare-part"]}
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-3">
                      <div>
                        <h3 className="text-xs font-bold tracking-widest text-slate-900 uppercase">{category.name}</h3>
                        <p className="mt-1 text-[10px] font-medium text-outline">{category._count.products} PRODUK</p>
                      </div>
                      <ArrowRight className="h-4 w-4 translate-y-[-2px] text-primary opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          initial={revealInitial}
          whileInView={revealWhileInView}
          viewport={revealViewportOptions}
          variants={sectionReveal}
          className="bg-surface-container-low py-24"
        >
          <div className="container-wrap">
            <div className="mb-16 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-4xl font-extrabold tracking-tighter text-slate-900 uppercase">Popular paths inside the store</h2>
                <p className="mt-2 font-light tracking-wide text-slate-600">Built around the categories buyers usually open first.</p>
              </div>

              <Link href="/products" className="motion-button group inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
                View Store Catalog
                <ArrowRight className="motion-arrow h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid h-auto auto-rows-fr grid-cols-1 items-stretch gap-6 md:h-[700px] md:grid-cols-4 md:grid-rows-2">
              <Link href="/products?category=rak-spare-part" className="group relative flex min-h-[360px] overflow-hidden border border-primary/45 bg-white shadow-[3px_3px_0_rgba(68,94,255,0.48)] dark:border-primary/55 dark:bg-[#111827] dark:shadow-[3px_3px_0_rgba(82,125,255,0.32)] md:col-span-2 md:row-span-2 md:min-h-0">
                <img
                  alt="BMW chassis and suspension systems"
                  className="h-full w-full object-cover opacity-80 grayscale transition-transform duration-700 group-hover:scale-105"
                  src={PRECISION_HERO}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent p-10">
                  <div className="flex h-full flex-col justify-end">
                    <h3 className="mb-2 text-3xl font-bold tracking-tighter text-slate-900 uppercase">Rak Spare Part</h3>
                    <p className="mb-6 max-w-xs text-sm tracking-wider text-slate-600 uppercase">
                      Main showcase for daily BMW spare-part needs, replacement components, and parts buyers usually search first.
                    </p>
                    <span className="self-start border border-primary px-6 py-3 text-[10px] font-bold tracking-widest text-primary uppercase transition-all hover:bg-primary hover:text-white">
                      Open Showcase
                    </span>
                  </div>
                </div>
              </Link>

              <Link href="/products?category=rak-lampu" className="group relative flex min-h-[280px] overflow-hidden border border-primary/45 bg-white shadow-[3px_3px_0_rgba(68,94,255,0.48)] dark:border-primary/55 dark:bg-[#111827] dark:shadow-[3px_3px_0_rgba(82,125,255,0.32)] md:col-span-2 md:min-h-0">
                <img
                  alt="BMW lighting category"
                  className="h-full w-full object-cover opacity-60 grayscale transition-transform duration-700 group-hover:scale-105"
                  src={PRECISION_SECONDARY}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex flex-col justify-center p-8">
                  <h3 className="mb-1 text-2xl font-bold tracking-tighter text-slate-900 uppercase">Rak Lampu</h3>
                  <p className="mb-4 text-[10px] font-bold tracking-widest text-primary uppercase">Headlamps, foglamps, and lighting details</p>
                  <span className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase group-hover:underline">
                    Open Showcase
                    <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>

              <Link href="/products?category=rak-kaca" className="group relative flex min-h-[280px] overflow-hidden border border-primary/45 bg-white shadow-[3px_3px_0_rgba(68,94,255,0.48)] dark:border-primary/55 dark:bg-[#111827] dark:shadow-[3px_3px_0_rgba(82,125,255,0.32)] md:min-h-0">
                <div className="flex h-full min-h-full w-full flex-col p-8">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                    <GridCardIcon name="glass" className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tighter text-slate-900 uppercase">Rak Kaca</h3>
                  <p className="mt-2 text-[10px] tracking-widest text-slate-600 uppercase">Glass parts and exterior details buyers often look for</p>
                  <div className="mt-auto text-xs font-bold tracking-widest text-primary">STORE CATEGORY</div>
                </div>
              </Link>

              <Link href="/products" className="group relative flex min-h-[280px] overflow-hidden border border-primary/45 bg-white text-slate-900 shadow-[3px_3px_0_rgba(68,94,255,0.48)] dark:border-primary/55 dark:bg-[#111827] dark:text-slate-100 dark:shadow-[3px_3px_0_rgba(82,125,255,0.32)] md:min-h-0">
                <div className="flex h-full min-h-full w-full flex-col p-8">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                    <GridCardIcon name="official-flow" className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tighter uppercase">Official Store Flow</h3>
                  <p className="mt-2 text-[10px] leading-relaxed tracking-widest text-slate-600 uppercase">
                    Website for browsing, WhatsApp for questions, Tokopedia for purchase.
                  </p>
                  <div className="mt-auto text-[10px] font-bold tracking-widest text-primary uppercase">Browse Categories</div>
                </div>
              </Link>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={revealInitial}
          whileInView={revealWhileInView}
          viewport={revealViewportOptions}
          variants={sectionReveal}
          className="bg-white py-24"
        >
          <div className="container-wrap">
            <div className="mb-8 max-w-3xl">
              <span className="mb-4 block text-[10px] font-bold tracking-[0.3em] text-primary uppercase">Top Picks</span>
              <h2 className="text-4xl font-extrabold tracking-tighter text-slate-900 uppercase leading-none">Highlights from the Planet Motor BMW catalog</h2>
              <p className="mt-4 font-light leading-relaxed text-slate-600">
                A moving rail of listings so visitors can scan more parts before opening product details, asking the admin, or continuing to Tokopedia.
              </p>
            </div>

            <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-2">
              <div className="marquee-mask px-4 md:px-8">
                <div className="marquee-track-ltr flex w-max gap-6" style={{ animationDuration: "44s" }}>
                  {loopingTopPicks.map((product, index) => (
                    <Link
                      key={`${product.id}-${index}`}
                      href={`/products/${product.slug}`}
                      aria-hidden={index >= topPickProducts.length}
                      className="group flex w-[88vw] max-w-[560px] shrink-0 items-center gap-5 border border-outline-variant bg-white p-4 transition-all hover:border-primary hover:shadow-xl md:w-[560px]"
                    >
                      <div className="h-[180px] w-[180px] shrink-0 overflow-hidden bg-white">
                        {product.imageUrl ? (
                          <img
                            alt={product.name}
                            className="h-full w-full object-contain grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                            src={product.imageUrl}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-surface-container" />
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="font-mono text-[10px] font-bold tracking-widest text-outline uppercase">{product.category.name}</span>
                        <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-tight text-slate-900">{product.name}</h3>
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
                          {product.description ?? "Selected BMW part with verified stock and fitment-focused display."}
                        </p>

                        <div className="mt-auto flex items-center justify-between gap-4 pt-5">
                          <span className="text-lg font-black text-slate-900">{formatCurrency(Number(product.price))}</span>
                          <span className="text-[10px] font-bold tracking-widest text-outline uppercase">{product.stock} {product.unit}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={revealInitial}
          whileInView={revealWhileInView}
          viewport={revealViewportOptions}
          variants={sectionReveal}
          className="bg-white py-24"
        >
          <div className="container-wrap">
            <div className="mb-12 flex flex-col gap-2">
              <h2 className="text-[32px] font-bold leading-tight tracking-tighter text-slate-900 uppercase">LISTINGS WORTH CHECKING FIRST</h2>
              <p className="text-base font-light text-slate-500">Selected parts from the store for buyers who want to jump straight into the most searched items.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {essentialProducts.map((product, index) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="group relative flex h-full flex-col rounded-sm border border-outline-variant bg-white p-4 transition-all duration-300 hover:border-primary hover:shadow-xl"
                >
                  <div className="mb-4 flex h-[240px] w-full items-center justify-center overflow-hidden rounded-sm bg-white">
                    {product.imageUrl ? (
                      <img
                        alt={product.name}
                        className="h-full w-full object-contain grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                        src={product.imageUrl}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-full w-full bg-surface-container-low" />
                    )}
                  </div>

                  <div className="flex flex-grow flex-col gap-2">
                    <span className="font-mono text-[10px] font-bold tracking-widest text-outline uppercase">STORE LISTING</span>
                    <h3 className="line-clamp-2 h-10 text-base font-bold leading-tight text-slate-900">{product.name}</h3>

                    <div className="mt-auto flex flex-col gap-3 pt-4">
                      <span className="text-xl font-black text-slate-900">{formatCurrency(Number(product.price))}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                        <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{product.stock} {product.unit} available in catalog</span>
                      </div>
                      <Link
                        href={`/products/${product.slug}`}
                        className="motion-button mt-2 flex h-12 items-center justify-center rounded-sm bg-slate-100 text-xs font-bold tracking-[0.2em] text-slate-900 uppercase transition-all duration-300 group-hover:bg-primary group-hover:text-white"
                      >
                        VIEW DETAIL
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={revealInitial}
          whileInView={revealWhileInView}
          viewport={revealViewportOptions}
          variants={sectionReveal}
          className="bg-white py-32"
        >
          <div className="container-wrap grid items-center gap-24 lg:grid-cols-2">
            <motion.div className="relative" style={{ y: heritageY }}>
              <img alt="Planet Motor BMW workshop heritage" className="w-full border-l-8 border-primary grayscale" src={HERITAGE_IMAGE} referrerPolicy="no-referrer" />
              <div className="absolute -right-10 -bottom-10 hidden border border-outline-variant bg-white p-10 shadow-2xl md:block">
                <div className="text-5xl font-black tracking-tighter text-slate-900">{totalProducts}+</div>
                <div className="mt-2 text-[10px] font-bold tracking-[0.2em] text-outline uppercase">Products in catalog</div>
              </div>
            </motion.div>

            <div>
              <span className="mb-6 block text-[10px] font-bold tracking-[0.3em] text-primary uppercase">Why Planet Motor BMW</span>
              <h2 className="mb-8 text-5xl font-extrabold leading-[1.1] tracking-tighter text-slate-900 uppercase">
                Built around a buying flow that feels clearer for BMW owners.
              </h2>
              <p className="mb-8 font-light leading-relaxed text-slate-600">
                The store is arranged so visitors can read the catalog first, open the right category, confirm details with the admin, and continue to Tokopedia when they are ready to buy.
              </p>

              <div className="space-y-6">
                {[
                  { title: "Clear category structure", desc: `Categories such as ${showcasePreview} help buyers understand where to begin.` },
                  { title: "Responsive admin support", desc: "WhatsApp remains the fastest line for stock questions and part clarification before opening Tokopedia." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="mt-1 h-2 w-2 bg-primary" />
                    <div>
                      <h4 className="text-sm font-bold tracking-wider text-slate-900 uppercase">{item.title}</h4>
                      <p className="mt-1 text-xs text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/about" className="motion-button mt-12 inline-flex bg-primary px-10 py-4 text-[10px] font-bold tracking-[0.2em] text-white uppercase transition-all hover:bg-on-primary-container">
                Learn Our Story
              </Link>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={revealInitial}
          whileInView={revealWhileInView}
          viewport={revealViewportOptions}
          variants={sectionReveal}
          className="bg-surface-container py-24"
        >
          <div className="container-wrap">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-extrabold tracking-tighter text-slate-900 uppercase">Buyer feedback from the Planet Motor BMW flow</h2>
            </div>

            <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-2">
              <div className="marquee-mask px-4 md:px-8">
                <div className="marquee-track-ltr flex w-max gap-8 px-1" style={{ animationDuration: "48s" }}>
                  {loopingReviews.map((review, index) => (
                    <motion.article
                      key={`${review.name}-${index}`}
                      whileHover={{ scale: 1.02 }}
                      aria-hidden={index >= reviews.length}
                      className="group flex min-h-[240px] min-w-[440px] max-w-[440px] items-start gap-5 overflow-hidden border border-outline-variant bg-white p-10"
                    >
                      <div className="shrink-0">
                        <img alt={`${review.product} reviewed by ${review.name}`} className="h-10 w-10 rounded-full border border-outline-variant object-cover" src={review.avatar} referrerPolicy="no-referrer" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <div>
                            <h4 className="text-[10px] font-bold tracking-widest text-slate-900 uppercase">{review.name}</h4>
                            <p className="text-[9px] font-bold tracking-widest text-outline uppercase">{review.product}</p>
                          </div>

                          <div className="flex gap-1">
                            {Array.from({ length: review.stars }).map((_, starIndex) => (
                              <Star key={`${review.name}-${starIndex}`} className="h-3 w-3 fill-primary text-primary" />
                            ))}
                          </div>
                        </div>

                        <p className="font-medium leading-relaxed text-slate-900 italic">&quot;{review.comment}&quot;</p>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={revealInitial}
          whileInView={revealWhileInView}
          viewport={revealViewportOptions}
          variants={sectionReveal}
          className="bg-white py-24"
        >
          <div className="container-wrap max-w-4xl">
            <div className="mb-12">
              <span className="mb-4 block font-montserrat text-[10px] font-bold tracking-[0.3em] text-primary uppercase">Store Support</span>
              <h2 className="mb-4 font-montserrat text-4xl font-extrabold tracking-tighter text-slate-900 uppercase">Questions before opening the official Tokopedia store?</h2>
              <p className="max-w-2xl font-montserrat font-light text-slate-600">
                Everything you need to know about stock checks, part questions, and how Planet Motor BMW handles inquiries before Tokopedia.
              </p>
            </div>

            <div className="space-y-4">
              {messages.home.faq.items.map((faq, index) => (
                <div key={faq.question} className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm transition-shadow hover:shadow-md">
                  <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="motion-button flex w-full items-center justify-between p-6 text-left">
                    <h3 className="font-montserrat text-sm font-bold tracking-wider text-slate-900 uppercase md:text-base">{faq.question}</h3>
                    <ChevronDown className={`h-5 w-5 text-primary transition-transform duration-300 ${openFaq === index ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === index ? (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="border-t border-slate-50 px-6 pt-4 pb-6 font-montserrat text-sm leading-relaxed text-slate-600">
                          {faq.answer}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-2xl bg-surface-container p-8 text-center">
              <p className="mb-4 font-montserrat text-xs font-bold tracking-widest text-outline uppercase">Still need help checking the right part?</p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="motion-button inline-flex items-center gap-3 bg-primary px-8 py-4 font-montserrat text-[10px] font-bold tracking-[0.2em] text-white uppercase transition-all hover:bg-on-primary-container"
              >
                <ChannelIcon channel="whatsapp" size={18} />
                Ask via WhatsApp
                <Headphones className="h-4 w-4" />
              </a>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={revealInitial}
          whileInView={revealWhileInView}
          viewport={revealViewportOptions}
          variants={sectionReveal}
          className="relative overflow-hidden bg-slate-900 py-24"
        >
          <div className="absolute inset-0 opacity-20">
            <img alt="BMW performance detail background" className="h-full w-full object-cover grayscale" src={CTA_BG} referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-slate-900/80" />
          </div>

          <div className="container-wrap relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <span className="mb-6 block text-[10px] font-bold tracking-[0.4em] text-primary-fixed uppercase">Ready to Buy?</span>
              <h2 className="mb-8 text-5xl font-black leading-none tracking-tighter text-white uppercase md:text-7xl">
                Find the part, ask the admin, <br className="hidden md:block" /> then continue to Tokopedia.
              </h2>
              <p className="mx-auto mb-12 max-w-2xl text-lg font-light text-slate-400 md:text-xl">
                Use the website to browse categories first, then continue through Tokopedia or WhatsApp with a clearer buying path.
              </p>
              <div className="mx-auto grid w-full max-w-xl gap-3 sm:grid-cols-2">
                <Link href={tokopediaStoreUrl} target="_blank" rel="noopener noreferrer" className="motion-button inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-md bg-white px-6 text-[10px] font-bold tracking-[0.22em] text-slate-900 uppercase shadow-2xl transition-all hover:bg-primary-fixed">
                  <ChannelIcon channel="tokopedia" size={18} />
                  Open Tokopedia Store
                </Link>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="motion-button inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-md border border-white/30 px-6 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:bg-white/10">
                  <ChannelIcon channel="whatsapp" size={18} />
                  Chat Store Admin
                </a>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
