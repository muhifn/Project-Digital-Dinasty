"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { useLocale } from "@/components/providers/locale-provider";

type TokopediaStats = {
  rating: number;
  totalRatings: number;
  satisfaction: number;
  sold: number;
};

type ReviewItem = {
  name: string;
  product: string;
  comment: string;
  stars: number;
  avatar: string;
};

type ReviewsCarouselProps = {
  reviews: ReviewItem[];
  stats: TokopediaStats;
};

export function ReviewsCarousel({ reviews, stats }: ReviewsCarouselProps) {
  const { messages } = useLocale();
  const loopingReviews = [...reviews, ...reviews];

  return (
    <section className="container-wrap mt-16 overflow-hidden">
      <div className="rounded-sm border border-border bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)] sm:p-8">
        <ScrollReveal className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-brand-primary">{messages.home.reviews.badge}</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-text-heading sm:text-[2.2rem]">
            {messages.home.reviews.title}
          </h2>
          <p className="mt-4 text-sm leading-7 text-text-body sm:text-base">
            {messages.home.reviews.description}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.08} className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-sm border border-border bg-[#f8fafc] p-5">
            <p className="text-sm font-semibold text-text-heading">Tokopedia</p>
            <p className="mt-2 text-3xl font-bold text-brand-primary">{stats.rating}/5.0</p>
            <p className="mt-2 text-sm text-text-body">{stats.totalRatings} rating</p>
          </div>
          <div className="rounded-sm border border-border bg-[#f8fafc] p-5">
            <p className="text-sm font-semibold text-text-heading">{messages.home.reviews.trustLabel}</p>
            <p className="mt-2 text-3xl font-bold text-brand-primary">{stats.satisfaction}%</p>
            <p className="mt-2 text-sm text-text-body">{messages.home.reviews.summary}</p>
          </div>
          <div className="rounded-sm border border-border bg-[#f8fafc] p-5">
            <p className="text-sm font-semibold text-text-heading">{messages.home.socialProof.items.sold}</p>
            <p className="mt-2 text-3xl font-bold text-brand-primary">{stats.sold}+</p>
            <p className="mt-2 text-sm text-text-body">{messages.home.reviews.sold}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.12} className="mt-8">
          <div className="overflow-hidden rounded-sm border border-border bg-[#f8fafc] p-4 sm:p-5">
            <div className="review-marquee-mask">
              <div className="review-marquee-track flex w-max gap-4" style={{ animationDuration: "44s" }}>
                {loopingReviews.map((review, index) => (
                  <article
                    key={`${review.name}-${review.product}-${index}`}
                    aria-hidden={index >= reviews.length}
                    className="flex min-h-[220px] w-[78vw] max-w-[320px] shrink-0 flex-col rounded-sm border border-border bg-white p-5 sm:w-[330px] sm:max-w-none lg:w-[350px]"
                  >
                    <div className="flex items-start gap-3">
                      <Image
                        src={review.avatar}
                        alt={review.name}
                        width={48}
                        height={48}
                        className="size-12 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-text-heading">{review.name}</p>
                        <p className="mt-1 line-clamp-1 text-xs text-text-muted">{review.product}</p>
                        <div className="mt-2 flex items-center gap-1">
                          {Array.from({ length: review.stars }).map((_, starIndex) => (
                            <Star key={`${review.name}-${starIndex}`} size={13} fill="#F59E0B" color="#F59E0B" />
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-5 break-words text-sm leading-7 text-text-body">&quot;{review.comment}&quot;</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
