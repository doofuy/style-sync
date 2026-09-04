"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Check } from "lucide-react";

export default function OutfitShowcase() {
  const recommendedItems = [
    {
      slot: "TOP",
      name: "Relaxed Linen Shirt",
      category: "Shirts",
      image: "/categories/Shirts.avif",
      tone: "Ivory",
    },
    {
      slot: "BOTTOM",
      name: "Vintage Straight Denim",
      category: "Jeans",
      image: "/categories/Jeans.avif",
      tone: "Washed Indigo",
    },
    {
      slot: "FOOTWEAR",
      name: "Minimalist Casual Sneakers",
      category: "Casual Shoes",
      image: "/categories/Casual Shoes.png",
      tone: "Warm White",
    },
  ];

  return (
    <section className="relative w-screen left-1/2 right-1/2 -translate-x-1/2 py-20 sm:py-28 bg-card border-y border-border overflow-hidden select-none">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-[10.5px] uppercase tracking-[0.3em] font-semibold text-muted-foreground">
                AI Styling Atelier
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-wide text-foreground">
              Today&apos;s Outfit, Curated
            </h2>
          </div>

          <p className="font-serif text-base sm:text-lg text-muted-foreground max-w-md italic leading-relaxed">
            Intelligent pairings assembled from your closet pieces, balanced for the day&apos;s climate, silhouette, and occasion.
          </p>
        </div>

        {/* Real Product UI Mockup / Showcase Frame */}
        <div className="relative border border-border bg-background p-6 sm:p-10 shadow-sm">
          {/* Top Bar of Lookbook */}
          <div className="flex flex-wrap items-center justify-between border-b border-border pb-6 mb-8 gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.24em] font-bold px-3 py-1 bg-muted text-foreground border border-border">
                <Check className="w-3 h-3 text-accent" /> Occasion: Casual Date
              </span>
              <span className="text-[10px] uppercase tracking-[0.24em] font-medium text-muted-foreground hidden sm:inline">
                Weather: 22°C · Clear Sky
              </span>
            </div>

            <div className="text-[10.5px] uppercase tracking-[0.22em] font-semibold text-muted-foreground">
              Harmonized Palette: Warm Ivory &amp; Indigo
            </div>
          </div>

          {/* Coordinated Outfit Items — Zero Gutters Sézane Look */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 border border-border bg-muted/20">
            {recommendedItems.map((item, idx) => (
              <div
                key={item.slot}
                className={`group relative flex flex-col items-center p-6 transition-all duration-300 ${
                  idx !== recommendedItems.length - 1 ? "sm:border-r sm:border-border" : ""
                }`}
              >
                {/* Slot Tag */}
                <span className="text-[9.5px] uppercase tracking-[0.3em] font-bold text-muted-foreground mb-4">
                  {item.slot}
                </span>

                {/* Piece Image */}
                <div className="relative w-full aspect-[3/4] max-w-[240px] overflow-hidden bg-background border border-border/50 mb-5">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Details */}
                <div className="text-center">
                  <h4 className="font-serif text-lg text-foreground font-medium">
                    {item.name}
                  </h4>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                    {item.category} · {item.tone}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Editorial Styling Notes & Terracotta CTA */}
          <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center sm:text-left">
              <span className="text-[10px] uppercase tracking-[0.26em] font-bold text-foreground block mb-1">
                Stylist Notes
              </span>
              <p className="text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">
                Clean lines with a relaxed drape. The breathable linen keeps the look elevated yet nonchalant, grounded by classic washed denim and pristine leather sneakers.
              </p>
            </div>

            {/* TERRACOTTA ACCENT CTA — ONLY USE OF ACCENT TOKEN PER PRD §4.3 & §5 */}
            <Link
              href="/wardrobe"
              className="inline-flex items-center justify-center gap-2.5 bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.24em] text-xs font-semibold px-8 py-4 transition-all duration-300 shadow-sm hover:shadow active:scale-[0.99] whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Today&apos;s Look</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
