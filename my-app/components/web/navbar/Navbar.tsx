import Link from "next/link";
import Logo from "./logo";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/theme-toggle";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Logo and Navigation Links */}
          <div className="flex items-center space-x-6">
            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <Logo />
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-1">
              <Button variant="ghost" asChild>
                <Link href="/">Home</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/upload">Upload</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/explore">Explore</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/wardrobe">Wardrobe</Link>
              </Button>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Signup</Link>
            </Button>
            
            {/* Theme Toggle */}
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
