"use client";

import { Collection } from "@/types/wardrobe";

interface CategoryGridProps {
  collections: Collection[];
  onCategoryClick?: (collectionId: string) => void;
}

interface PredefinedCategory {
  name: string;
  cover: string;
  matchKeys: string[];
}

const ALL_PREDEFINED_CATEGORIES: PredefinedCategory[] = [
  { name: "Casual Shoes", cover: "/categories/Casual Shoes.png", matchKeys: ["casual shoes", "casual shoe"] },
  { name: "Flip Flops", cover: "/categories/Flip Flops.avif", matchKeys: ["flip flops", "flip flop"] },
  { name: "Formal Shoes", cover: "/categories/Formal Shoes.avif", matchKeys: ["formal shoes", "formal shoe"] },
  { name: "Heels", cover: "/categories/Heels.avif", matchKeys: ["heels", "heel"] },
  { name: "Jeans", cover: "/categories/Jeans.avif", matchKeys: ["jeans", "jean"] },
  { name: "Kurtas", cover: "/categories/Kurtas.png", matchKeys: ["kurtas", "kurta"] },
  { name: "Leggings", cover: "/categories/Leggings.png", matchKeys: ["leggings", "legging"] },
  { name: "Sandals", cover: "/categories/Sandals.png", matchKeys: ["sandals", "sandal"] },
  { name: "Shirts", cover: "/categories/Shirts.avif", matchKeys: ["shirts", "shirt"] },
  { name: "Shorts", cover: "/categories/Shorts.avif", matchKeys: ["shorts", "short"] },
  { name: "Sports Shoes", cover: "/categories/Sports Shoes.png", matchKeys: ["sports shoes", "sports shoe", "sneakers"] },
  { name: "Tops", cover: "/categories/Tops.avif", matchKeys: ["tops", "top"] },
  { name: "Track Pants", cover: "/categories/Track Pants.jpg", matchKeys: ["track pants", "track pant", "trackpants"] },
  { name: "Trousers", cover: "/categories/Trousers.webp", matchKeys: ["trousers", "trouser", "pants"] },
  { name: "T-Shirts", cover: "/categories/Tshirts.png", matchKeys: ["tshirts", "tshirt", "t-shirts", "t-shirt", "t shirts", "t shirt", "tee"] },
];

export default function CategoryGrid({ collections = [], onCategoryClick }: CategoryGridProps) {
  // Normalize string for exact key matching
  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Build complete category grid list combining predefined categories and user collections
  const matchedUserCollectionIds = new Set<string>();

  const gridItems = ALL_PREDEFINED_CATEGORIES.map((predef) => {
    // Find matching user collection
    const userColl = collections.find((c) => {
      const cNorm = normalize(c.name);
      return predef.matchKeys.some((k) => normalize(k) === cNorm);
    });

    if (userColl) {
      matchedUserCollectionIds.add(userColl.id);
      return {
        id: userColl.id,
        name: predef.name,
        itemCount: userColl.items ? userColl.items.length : 0,
        coverImage: predef.cover,
        collectionId: userColl.id,
      };
    }

    return {
      id: `predef-${predef.name}`,
      name: predef.name,
      itemCount: 0,
      coverImage: predef.cover,
      collectionId: undefined,
    };
  });

  // Include any extra user-created collections not in predefined list
  collections.forEach((c) => {
    if (!matchedUserCollectionIds.has(c.id)) {
      const firstImg = c.items?.find((item) => item.imageUrl && item.imageUrl.trim() !== "")?.imageUrl;
      gridItems.push({
        id: c.id,
        name: c.name,
        itemCount: c.items ? c.items.length : 0,
        coverImage: firstImg || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
        collectionId: c.id,
      });
    }
  });

  // Sort: max items first (descending), secondary sort alphabetically
  gridItems.sort((a, b) => {
    if (b.itemCount !== a.itemCount) {
      return b.itemCount - a.itemCount;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <section className="w-screen relative left-1/2 right-1/2 -translate-x-1/2 mb-12">
      {/* Edge-to-Edge Sézane-Inspired Gap-0 & Zero-Border Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0 w-full">
        {gridItems.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onCategoryClick?.(cat.collectionId || cat.name)}
            className="group relative aspect-[4/5] cursor-pointer overflow-hidden bg-neutral-900 select-none"
          >
            {/* Image with subtle overflow-clipped hover zoom */}
            <img
              src={cat.coverImage}
              alt={cat.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Editorial Gradient Scrim — High Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/35 transition-opacity duration-300 group-hover:from-black/90 group-hover:via-black/65" />

            {/* Centered Category Title — High Contrast White Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center z-10">
              <span className="font-serif text-xs sm:text-sm tracking-[0.28em] uppercase font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {cat.name}
              </span>
              <span className="mt-1.5 text-[9.5px] uppercase tracking-[0.22em] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                {cat.itemCount} {cat.itemCount === 1 ? "Piece" : "Pieces"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
