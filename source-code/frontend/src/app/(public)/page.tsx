import { connection } from "next/server";
import { HomeShowcase } from "@/components/home/home-showcase";
import tokopediaReviews from "@/data/tokopedia-reviews.json";
import { getCategories, getFeaturedProducts, getProducts } from "@/lib/products";

const TOKOPEDIA_STORE_URL = "https://tk.tokopedia.com/ZSHhyGtpk/";
const WHATSAPP_URL = "https://wa.me/6281234567890";
const REVIEW_LIMIT = 16;

type ScrapedTokopediaReview = {
  id: string;
  rating: number;
  reviewText?: string;
  reviewer?: {
    name?: string;
    avatar?: string;
  };
  product?: {
    name?: string;
    imageUrl?: string;
  };
};

type ScrapedTokopediaReviews = {
  summary?: {
    ratingScore?: string;
    totalRatings?: number;
    breakdown?: Array<{
      rate: number;
      percentageFloat?: number;
    }>;
  };
  reviews?: ScrapedTokopediaReview[];
};

type HomepageTokopediaReview = ScrapedTokopediaReview & {
  reviewText: string;
  reviewer: {
    name: string;
    avatar?: string;
  };
  product: {
    name: string;
    imageUrl: string;
  };
};

const tokopediaReviewData = tokopediaReviews as ScrapedTokopediaReviews;
const ratingScore = Number(tokopediaReviewData.summary?.ratingScore);
const fiveStarShare = tokopediaReviewData.summary?.breakdown?.find((item) => item.rate === 5)?.percentageFloat;

const TOKOPEDIA_STATS = {
  rating: Number.isFinite(ratingScore) ? ratingScore : 4.9,
  totalRatings: tokopediaReviewData.summary?.totalRatings ?? 96,
  satisfaction: Math.round(fiveStarShare ?? 97),
  sold: 176,
};

function hasHomepageReviewFields(review: ScrapedTokopediaReview): review is HomepageTokopediaReview {
  return Boolean(
    review.rating === 5 &&
      review.reviewText?.trim() &&
      review.reviewer?.name?.trim() &&
      review.product?.name?.trim() &&
      review.product?.imageUrl?.trim(),
  );
}

const REVIEW_CARDS = (tokopediaReviewData.reviews ?? [])
  .filter(hasHomepageReviewFields)
  .slice(0, REVIEW_LIMIT)
  .map((review) => ({
    name: review.reviewer.name.trim(),
    product: review.product.name.trim(),
    comment: review.reviewText.trim(),
    stars: review.rating,
    avatar: review.product.imageUrl.trim(),
  }));

export default async function HomePage() {
  await connection();

  const [categories, featuredProducts, allProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getProducts({ sort: "featured" }),
  ]);

  const topPickMap = new Map<string, (typeof allProducts)[number]>();
  for (const item of featuredProducts) topPickMap.set(item.id, item);
  for (const item of allProducts) {
    if (!topPickMap.has(item.id)) topPickMap.set(item.id, item);
    if (topPickMap.size >= 12) break;
  }

  const topPickProducts = [...topPickMap.values()].slice(0, 12);

  return (
    <HomeShowcase
      categories={categories}
      featuredProducts={featuredProducts}
      topPickProducts={topPickProducts}
      reviews={REVIEW_CARDS}
      tokopediaStats={TOKOPEDIA_STATS}
      tokopediaStoreUrl={TOKOPEDIA_STORE_URL}
      whatsappUrl={WHATSAPP_URL}
    />
  );
}
