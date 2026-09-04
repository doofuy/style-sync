import { Item } from "@/types/wardrobe";
import { X, Camera } from "lucide-react";

interface WardrobeCardProps {
  item: Item;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: () => void;
  onImageClick?: () => void;
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
      title={item.name}
      className={`relative flex h-52 w-40 sm:h-60 sm:w-44 shrink-0 cursor-pointer flex-col overflow-hidden bg-card border-r border-border select-none group transition-colors duration-200 ${
        isSelected ? "bg-accent/5" : "hover:bg-muted/30"
      }`}
    >
      {/* Image Container with subtle overflow-clipped hover zoom */}
      <div className="relative flex-1 w-full overflow-hidden bg-muted/20 flex items-center justify-center">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground text-xs font-serif italic">
            <span>No Image</span>
          </div>
        )}

        {/* Selected State: Bottom subtle scrim + uppercase label */}
        {isSelected && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent py-1 px-2 flex items-center justify-center z-10 animate-in fade-in duration-200">
            <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-white">
              Selected
            </span>
          </div>
        )}

        {/* Hover Scrim: visual overlay with pointer-events-none so clicking the card selects the item */}
        {onImageClick && (
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 flex flex-col items-center justify-center">
            {/* Edit Button: pointer-events-auto so only clicking the camera/edit button opens the edit modal */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onImageClick();
              }}
              className="pointer-events-auto flex flex-col items-center justify-center text-white text-[10px] font-bold tracking-[0.2em] uppercase gap-1.5 p-2 rounded-full hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              title="Edit image"
            >
              <span className="bg-white/25 hover:bg-white/40 p-2.5 rounded-full backdrop-blur-xs shadow-md transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </span>
              <span className="drop-shadow-sm">Edit</span>
            </button>
          </div>
        )}

        {/* Top-Right Delete Action */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-white hover:bg-primary transition-colors duration-150 z-30 opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Delete item"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Selected 2px Terracotta Accent Bottom Indicator */}
      <div
        className={`h-[2px] w-full transition-all duration-200 ${
          isSelected ? "bg-accent" : "bg-transparent"
        }`}
      />
    </div>
  );
}