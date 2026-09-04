"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./logo";
import { ModeToggle } from "@/components/ui/theme-toggle";

import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function Navbar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 20) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down -> hide navbar
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up -> reveal navbar
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/upload", label: "Upload" },
    { href: "/explore", label: "Explore" },
    { href: "/wardrobe", label: "Wardrobe" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border transition-all duration-500 ease-in-out ${
        isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left side: Logo and Navigation Links */}
          <div className="flex items-center space-x-12">
            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="hover:opacity-85 transition-opacity">
                <Logo />
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8 lg:gap-10">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-[11px] uppercase tracking-[0.22em] font-bold transition-colors duration-150 py-1 relative ${
                      isActive
                        ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-foreground"
                        : "text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center space-x-4">
            <Show when="signed-out">
              <SignInButton mode="redirect">
                <button className="text-[11px] uppercase tracking-[0.2em] font-bold text-foreground/70 hover:text-foreground transition-colors px-2 py-1 cursor-pointer">
                  Login
                </button>
              </SignInButton>

              <SignUpButton mode="redirect">
                <button className="text-[11px] uppercase tracking-[0.2em] font-bold border border-foreground text-foreground hover:bg-foreground hover:text-background transition-all px-3.5 py-1.5 rounded-xs cursor-pointer">
                  Signup
                </button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            </Show>

            {/* Theme Toggle */}
            <div className="opacity-80 hover:opacity-100 transition-opacity">
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
