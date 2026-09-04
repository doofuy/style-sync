import { Item } from "@/types/wardrobe";
import { X } from "lucide-react";

// Props definition for individual wardrobe item cards in the gallery
interface WardrobeCardProps {
  item: Item;
  isSelected: boolean; // Indicates if this item is selected as part of the current outfit
  onClick: () => void; // Triggered when selecting this card to toggle active outfit item
  onDelete?: () => void; // Triggered when deleting the item from the collection
  onImageClick?: () => void; // Triggered when clicking on the image area to change/upload the image
}

export default function WardrobeCard({
  item,
  isSelected,
  onClick,
  onDelete,
  onImageClick,
}: WardrobeCardProps) {
  return (
    <div
      onClick={onClick}
      /* FEATURE: Dynamic border, scale, background, and shadow depending on whether the card is selected */
      className={`relative flex h-40 w-44 cursor-pointer flex-col overflow-hidden rounded-xl border transition-all duration-300 ease-out select-none group ${
        isSelected
          ? "scale-105 border-violet-600 bg-[color-mix(in_srgb,var(--color-violet-600)_6%,transparent)] shadow-lg shadow-[color-mix(in_srgb,var(--color-violet-600)_15%,transparent)] ring-2 ring-[color-mix(in_srgb,var(--color-violet-600)_20%,transparent)] dark:border-violet-400 dark:bg-[color-mix(in_srgb,var(--color-violet-400)_10%,transparent)]"
          : "border-slate-200 bg-white shadow-sm hover:scale-105 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <div
        className={`flex-1 relative flex items-center justify-center overflow-hidden transition-colors duration-300 ${
          isSelected
            ? "bg-[color-mix(in_srgb,var(--color-violet-600)_5%,transparent)] dark:bg-[color-mix(in_srgb,var(--color-violet-400)_5%,transparent)]"
            : "bg-slate-50 dark:bg-slate-950"
        }`}
      >
        {/* CONDITION: Renders the clothing item image if present, or a fallback 'No Image' text */}
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 text-xs">
            <span className="font-medium">No Image</span>
          </div>
        )}

        {/* FEATURE: Overlay that appears on hover when onImageClick is active, showing a camera icon to edit image */}
        {onImageClick && (
          <div
            onClick={(e) => {
              e.stopPropagation(); // Avoid selecting the card when edit image is clicked
              onImageClick();
            }}
            className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white text-[11px] font-semibold gap-1.5"
          >
            <span className="bg-white/20 p-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </span>
            <span>Edit Image</span>
          </div>
        )}

        {/* FEATURE: Top right corner circular delete button to delete this item from the collection */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Avoid triggering selection of the item when deleting
              onDelete();
            }}
            className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white hover:bg-violet-600 dark:hover:bg-violet-500 transition-colors duration-200 shadow-sm z-10"
            title="Delete item"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}