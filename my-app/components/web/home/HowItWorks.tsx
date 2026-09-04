"use client";

import { Camera, Sparkles, Bookmark } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      tag: "DIGITIZE",
      title: "Upload Your Wardrobe",
      description:
        "Photograph garments directly or upload photos from your library. StyleSync automatically isolates and categorizes every piece into your digital lookbook.",
      icon: Camera,
    },
    {
      num: "02",
      tag: "CURATE",
      title: "Get Daily Outfit Picks",
      description:
        "Choose an occasion—casual, office, date, or travel. The intelligent styling engine suggests balanced combinations tailored to current weather and personal style.",
      icon: Sparkles,
    },
    {
      num: "03",
      tag: "ARCHIVE",
      title: "Save Your Favorites",
      description:
        "Assemble personal lookbooks, catalog your go-to rotations, and breathe new life into wardrobe essentials you already own.",
      icon: Bookmark,
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 lg:px-8 py-24 sm:py-32 select-none">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] font-medium text-muted-foreground block mb-3">
          The Workflow
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-normal text-foreground tracking-wide">
          How StyleSync Works
        </h2>
        <p className="font-serif text-base sm:text-lg text-muted-foreground italic mt-3">
          A seamless transition from physical closet to intelligent everyday dressing.
        </p>
      </div>

      {/* 3-Step Horizontal Grid (stacks on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="relative flex flex-col items-start border-t border-border pt-8 group"
            >
              {/* Step Number & Micro Tag */}
              <div className="flex items-center justify-between w-full mb-6">
                <span className="font-display text-2xl tracking-widest text-muted-foreground/60 group-hover:text-foreground transition-colors duration-300">
                  {step.num}
                </span>
                <span className="text-[9.5px] uppercase tracking-[0.28em] font-bold text-muted-foreground">
                  {step.tag}
                </span>
              </div>

              {/* Icon Container */}
              <div className="w-10 h-10 flex items-center justify-center border border-border bg-card mb-6 group-hover:border-foreground/40 transition-colors">
                <Icon className="w-4 h-4 text-foreground/80" />
              </div>

              {/* Title & Description */}
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
