import {ClerkProvider} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Italiana, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/web/navbar/Navbar";
import { ThemeProvider } from "@/components/web/navbar/theme-provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const italiana = Italiana({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "StyleSync — AI Wardrobe",
  description: "AI-powered wardrobe management and styling lookbook",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${italiana.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <ClerkProvider afterSignOutUrl="/">
          <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          >
          <Navbar />
          <main className="flex-1 pt-20">{children}</main>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}