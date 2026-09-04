"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export default function HomeFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="w-full bg-background border-t border-border pt-16 pb-12 select-none">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Centered Brand Header Lockup — Ported from Sézane */}
        <div className="flex flex-col items-center justify-center pb-12 border-b border-border text-center">
          <Link href="/" className="hover:opacity-85 transition-opacity">
            <span className="font-display text-3xl sm:text-4xl uppercase tracking-[0.24em] font-normal text-foreground">
              StyleSync
            </span>
          </Link>
          <span className="font-serif text-xs sm:text-sm text-muted-foreground mt-2 tracking-widest uppercase">
            Personal Lookbook &amp; Intelligent Wardrobe Atelier
          </span>
        </div>

        {/* 4-Column Editorial Links & Newsletter Capture */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16 border-b border-border">
          {/* Column 1: Categories */}
          <div>
            <h4 className="text-[10.5px] uppercase tracking-[0.28em] font-bold text-foreground mb-6">
              Wardrobe
            </h4>
            <ul className="space-y-3.5">
              {[
                { label: "Shirts & Tops", href: "/wardrobe" },
                { label: "Trousers & Denim", href: "/wardrobe" },
                { label: "Footwear & Shoes", href: "/wardrobe" },
                { label: "Kurtas & Traditional", href: "/wardrobe" },
                { label: "Explore All Categories", href: "/wardrobe" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors font-light tracking-wide"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: The Studio */}
          <div>
            <h4 className="text-[10.5px] uppercase tracking-[0.28em] font-bold text-foreground mb-6">
              The Studio
            </h4>
            <ul className="space-y-3.5">
              {[
                { label: "Our Philosophy", href: "#" },
                { label: "Lookbook Archive", href: "/wardrobe" },
                { label: "Occasion Styling", href: "/wardrobe" },
                { label: "AI Vision Architecture", href: "#" },
                { label: "Privacy & Data Storage", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors font-light tracking-wide"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Assistance */}
          <div>
            <h4 className="text-[10.5px] uppercase tracking-[0.28em] font-bold text-foreground mb-6">
              Assistance
            </h4>
            <ul className="space-y-3.5">
              {[
                { label: "Getting Started Guide", href: "/wardrobe" },
                { label: "Camera Upload Tips", href: "/wardrobe" },
                { label: "Wardrobe Categorization", href: "/wardrobe" },
                { label: "Frequently Asked Questions", href: "#" },
                { label: "Contact Concierge", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors font-light tracking-wide"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter / Style Dispatch */}
          <div>
            <h4 className="text-[10.5px] uppercase tracking-[0.28em] font-bold text-foreground mb-4">
              The Style Dispatch
            </h4>
            <p className="text-xs text-muted-foreground font-light leading-relaxed mb-5">
              Receive curated weekly outfit formulas, seasonal rotation guides, and product releases.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-muted border border-border text-foreground text-xs">
                <Check className="w-4 h-4 text-accent" />
                <span>You are subscribed to The Style Dispatch.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-border px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-background uppercase tracking-[0.22em] text-[10.5px] font-semibold py-2.5 hover:bg-foreground/85 transition-colors cursor-pointer"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Quiet Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-muted-foreground">
          <p>© {new Date().getFullYear()} STYLESYNC ATELIER. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center space-x-6">
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
