import { Collection } from "@/types/wardrobe";
import { X } from "lucide-react";

// Props definition for the SelectedOutfit component managing collections and active selections
interface SelectedOutfitProps {
  collections: Collection[];
  selectedItems: Record<string, string>; // Maps collectionId -> itemId
  onDeselect: (collectionId: string) => void; // Callback to remove an item from the current outfit selection
}

export default function SelectedOutfit({
  collections,
  selectedItems,
  onDeselect,
}: SelectedOutfitProps) {
  // Filter out collections where no item is currently selected
  const selectedCollections = collections.filter((collection) => {
    const selectedItemId = selectedItems[collection.id];
    return collection.items.some((item) => item.id === selectedItemId);
  });

  const hasSelections = selectedCollections.length > 0;

  return (
    <div className="my-8">
      <div className="mb-3 flex items-baseline justify-between border-b border-border/40 pb-2">
        <h2 className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-bold text-foreground">
          Current Look
        </h2>
        {hasSelections && (
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
            {selectedCollections.length} {selectedCollections.length === 1 ? "Piece" : "Pieces"}
          </span>
        )}
      </div>

      {!hasSelections ? (
        <div className="border border-dashed border-border bg-card/60 p-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] font-medium text-muted-foreground">
            No items selected yet — click items below to build your look
          </p>
        </div>
      ) : (
        <div className="flex gap-0 overflow-x-auto border border-border bg-card scrollbar-thin">
          {selectedCollections.map((collection) => {
            const selectedItemId = selectedItems[collection.id];
            const selectedItem = collection.items.find(
              (item) => item.id === selectedItemId,
            )!;

            return (
              <div
                key={collection.id}
                className="relative flex h-52 w-36 sm:h-56 sm:w-40 shrink-0 flex-col overflow-hidden border-r border-border bg-card select-none group transition-colors duration-200"
              >
                {/* Image Container with clipped zoom */}
                <div className="relative flex-1 w-full overflow-hidden bg-muted/20 flex items-center justify-center">
                  {/* Subtle top scrim + clean category label */}
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-2 z-10 flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-[0.22em] font-bold text-white/95">
                      {collection.name}
                    </span>
                    <button
                      onClick={() => onDeselect(collection.id)}
                      className="flex h-4 w-4 items-center justify-center rounded-full bg-black/40 text-white hover:bg-primary transition-colors cursor-pointer"
                      title={`Remove ${selectedItem.name} from outfit`}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>

                  {selectedItem.imageUrl ? (
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.name}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground text-[10px] font-serif italic">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
