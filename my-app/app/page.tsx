"use client";

import HomeHero from "@/components/web/home/HomeHero";
import OutfitShowcase from "@/components/web/home/OutfitShowcase";
import HowItWorks from "@/components/web/home/HowItWorks";
import EditorialBanner from "@/components/web/home/EditorialBanner";
import HomeFooter from "@/components/web/home/HomeFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* 1. Hero Section (~90vh full-bleed with seamless bottom blend) */}
      <HomeHero />

      {/* 2. Today's Outfit AI Showcase (~80vh full-bleed with terracotta CTA) */}
      <OutfitShowcase />

      {/* 3. How It Works (Contained width, generous breathing room) */}
      <HowItWorks />

      {/* 4. Editorial / Mood Banner (~70vh full-bleed) */}
      <EditorialBanner />

      {/* 5. Footer (Sézane-inspired 4-column layout) */}
      <HomeFooter />
    </div>
  );
}
