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
  // FEATURE: Filter out collections where no item is currently selected (or if the selected item was deleted)
  const selectedCollections = collections.filter((collection) => {
    const selectedItemId = selectedItems[collection.id];
    return collection.items.some((item) => item.id === selectedItemId);
  });

  // FEATURE: Determine if there are any active valid selections in the outfit
  const hasSelections = selectedCollections.length > 0;

  return (
    <div className="mt-8 rounded-xl border border-[color-mix(in_srgb,var(--color-violet-600)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-violet-600)_1%,transparent)] p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-slate-800 dark:text-slate-200">Current Outfit</h2>

      {/* OPERATION: Display placeholder message if no items are selected, otherwise render the outfit cards */}
      {!hasSelections ? (
        <p className="text-sm text-muted-foreground">No items selected yet</p>
      ) : (
        <div className="flex flex-wrap gap-4 pt-1">
          {/* OPERATION: Map over filtered collections to display each selected item as a premium squad-building card */}
          {selectedCollections.map((collection) => {
            const selectedItemId = selectedItems[collection.id];

            const selectedItem = collection.items.find(
              (item) => item.id === selectedItemId,
            )!;

            return (
              <div
                key={collection.id}
                className="relative flex h-36 w-32 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 group select-none transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
              >
                {/* FEATURE: Category label badge at the top-left of the card (resembles FIFA position badge) */}
                <div className="absolute top-2 left-2 z-10 bg-slate-800/80 dark:bg-slate-950/80 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded backdrop-blur-xs">
                  {collection.name}
                </div>

                {/* FEATURE: Top right corner circular close button with lucide X icon to deselect this item from the outfit */}
                <button
                  onClick={() => onDeselect(collection.id)}
                  className="absolute top-2 right-2 z-10 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-800/80 text-white hover:bg-violet-600 dark:bg-slate-950/80 dark:hover:bg-violet-500 transition-colors duration-200 cursor-pointer shadow-xs backdrop-blur-xs"
                  title={`Remove ${selectedItem.name} from outfit`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>

                {/* IMAGE AREA: Displays the clothing image or a premium placeholder */}
                <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950">
                  {selectedItem.imageUrl ? (
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 text-[10px]">
                      <span className="font-medium">No Image</span>
                    </div>
                  )}
                </div>

                {/* CARD FOOTER: Displays the selected item name */}
                <div className="p-2 text-center border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                  <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {selectedItem.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}




