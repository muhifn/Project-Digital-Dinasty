"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

type HeroGalleryImage = {
  src: string;
  alt: string;
  caption: string;
};

type HeroCircleGalleryProps = {
  images: HeroGalleryImage[];
  autoPlayInterval?: number;
};

export function HeroCircleGallery({ images, autoPlayInterval = 5600 }: HeroCircleGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || images.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, autoPlayInterval);

    return () => window.clearInterval(timer);
  }, [autoPlayInterval, images.length, isPaused]);

  function goPrev() {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function goNext() {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-full"
      style={{ clipPath: "circle(50% at 50% 50%)" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {images.map((image, index) => (
        <div
          key={image.src}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            index === activeIndex ? "z-10 opacity-100" : "z-0 opacity-0"
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 440px, (min-width: 640px) 70vw, 88vw"
            className="object-cover"
            priority={index === 0}
            quality={100}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,transparent_28%,rgba(0,0,0,0.12)_72%),linear-gradient(180deg,transparent_0%,rgba(3,8,16,0.46)_100%)]" />
        </div>
      ))}

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-[6.5%] top-1/2 z-20 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/18 text-white backdrop-blur-md transition-colors hover:bg-black/32 sm:size-11"
            aria-label="Previous hero image"
          >
            <ChevronLeft className="size-5" />
          </button>

          <button
            type="button"
            onClick={goNext}
            className="absolute right-[6.5%] top-1/2 z-20 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/18 text-white backdrop-blur-md transition-colors hover:bg-black/32 sm:size-11"
            aria-label="Next hero image"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-[16%] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {images.map((image, index) => (
              <button
                key={`${image.src}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex ? "w-7 bg-white" : "w-2.5 bg-white/45 hover:bg-white/65"
                }`}
                aria-label={`Show hero image ${index + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}

      <div className="pointer-events-none absolute inset-x-[12%] bottom-[5.5%] z-20 text-center">
        <p className="truncate text-lg font-semibold text-white sm:text-2xl">{images[activeIndex]?.caption}</p>
      </div>
    </div>
  );
}
