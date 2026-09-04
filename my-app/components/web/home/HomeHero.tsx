"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomeHero() {
  return (
    <section className="relative w-screen left-1/2 right-1/2 -translate-x-1/2 min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden select-none">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-100"
        style={{ backgroundImage: `url('/bg.avif')` }}
      />

      {/* Editorial Gradient Scrims — Ensures High Contrast Typography */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      <div className="absolute inset-0 backdrop-blur-[0.5px]" />

      {/* Hero Content Lockup */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 flex flex-col items-center text-center text-white">
        {/* Micro Category Tag */}
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.38em] font-medium text-white/80 mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          The Digital Lookbook &amp; Styling Atelier
        </span>

        {/* Brand Display Wordmark */}
        <h2 className="font-display text-5xl sm:text-7xl md:text-8xl tracking-[0.22em] uppercase font-normal text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
          StyleSync
        </h2>

        {/* Editorial Headline */}
        <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-light tracking-wide text-white/95 mt-4 sm:mt-6 drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)]">
          Your Wardrobe, Styled Daily
        </h1>

        {/* Supporting Copy */}
        <p className="max-w-xl text-xs sm:text-sm text-white/80 font-light tracking-wider mt-4 leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
          Reimagine what you already own. Transform your personal closet into a curated digital catalog with intelligent, harmonious outfit curation.
        </p>

        {/* Sézane Understated Text-Link CTA with Animated Underline */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center gap-6">
          <Link
            href="/wardrobe"
            className="group inline-flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.26em] font-semibold text-white transition-all duration-300 pb-1.5 relative drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
          >
            <span className="border-b border-white/80 pb-0.5 group-hover:border-white transition-colors">
              Style My Wardrobe
            </span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Subtle Bottom Divider Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
