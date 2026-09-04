"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface EditorialBannerProps {
  imageSrc?: string;
  tag?: string;
  headline?: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function EditorialBanner({
  imageSrc = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85",
  tag = "EDITORIAL PERSPECTIVE",
  headline = "Effortless dressing, curated for everyday life.",
  ctaText = "Explore The Catalog",
  ctaHref = "/explore",
}: EditorialBannerProps) {
  return (
    <section className="relative w-screen left-1/2 right-1/2 -translate-x-1/2 min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden select-none">
      {/* Editorial Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000"
        style={{ backgroundImage: `url('${imageSrc}')` }}
      />

      {/* Cinematic High-Contrast Scrim Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/70" />

      {/* Centered Minimalist Editorial Message */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center text-white">
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] font-medium text-white/80 block mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          {tag}
        </span>

        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal leading-tight text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
          {headline}
        </h2>

        {ctaText && ctaHref && (
          <div className="mt-8 sm:mt-10">
            <Link
              href={ctaHref}
              className="group inline-flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.24em] font-semibold text-white transition-all duration-300 pb-1 relative drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
            >
              <span className="border-b border-white/80 pb-0.5 group-hover:border-white transition-colors">
                {ctaText}
              </span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
