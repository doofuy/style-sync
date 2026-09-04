import { useRef } from "react";
import { Collection, Item } from "@/types/wardrobe";
import { Check, Plus, Camera, X } from "lucide-react";

interface CollectionRowProps {
  collection: Collection;
  selectedItems: Record<string, string>;
  setSelectedItems: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  onAddItem: (collectionId: string) => void;
  onDeleteItem: (collectionId: string, itemId: string) => void;
  onDeleteCollection: (collection: Collection) => void;
  onEditImage: (collectionId: string, itemId: string) => void;
  onReorderItems: (collectionId: string, updatedItems: Item[]) => void;
  onPreviewImage?: (url: string, title: string, subtitle: string) => void;
}

export default function CollectionRow({
  collection,
  selectedItems,
  setSelectedItems,
  onAddItem,
  onDeleteItem,
  onDeleteCollection,
  onEditImage,
  onReorderItems,
  onPreviewImage,
}: CollectionRowProps) {
  const draggedIndex = useRef<number | null>(null);
  const targetIndex = useRef<number | null>(null);

  const handleDragEnd = () => {
    if (draggedIndex.current === null || targetIndex.current === null) return;
    if (draggedIndex.current === targetIndex.current) return;

    const updatedItems = [...collection.items];
    const [movedItem] = updatedItems.splice(draggedIndex.current, 1);
    updatedItems.splice(targetIndex.current, 0, movedItem);

    onReorderItems(collection.id, updatedItems);

    draggedIndex.current = null;
    targetIndex.current = null;
  };

  return (
    <div className="w-full select-none">
      {/* Top Metadata Bar — Mirrors Recommendation Section */}
      <div className="flex flex-wrap items-center justify-between border-b border-border pb-6 mb-8 gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[10.5px] uppercase tracking-[0.24em] font-bold px-3.5 py-1.5 bg-muted text-foreground border border-border">
            <Check className="w-3.5 h-3.5 text-accent" />
            Category: {collection.name}
          </span>
          <span className="text-[10px] uppercase tracking-[0.24em] font-medium text-muted-foreground hidden sm:inline">
            Archived: {collection.items.length} {collection.items.length === 1 ? "Piece" : "Pieces"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onAddItem(collection.id)}
            className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.2em] font-bold text-foreground hover:bg-muted border border-border px-3.5 py-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-accent" />
            <span>Add Item</span>
          </button>

          <button
            onClick={() => onDeleteCollection(collection)}
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-destructive/80 hover:text-destructive transition-colors cursor-pointer hover:underline"
          >
            Delete Collection
          </button>
        </div>
      </div>

      {/* Items Lookbook Frame — Zero Gutters Sézane Look */}
      {collection.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-border bg-muted/20 text-center p-8">
          <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-semibold">
            No items in this collection yet
          </span>
          <p className="font-serif text-sm text-muted-foreground italic mt-2">
            Add photographs to start styling and cataloging this category.
          </p>
          <button
            onClick={() => onAddItem(collection.id)}
            className="mt-6 inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[10.5px] uppercase tracking-[0.22em] font-bold hover:bg-foreground/85 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-0 border border-border bg-muted/20">
          {collection.items.map((item, index) => {
            const isSelected = selectedItems[collection.id] === item.id;
            const pieceNum = String(index + 1).padStart(2, "0");

            return (
              <div
                key={item.id}
                draggable
                onDragStart={() => {
                  draggedIndex.current = index;
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  targetIndex.current = index;
                }}
                onDragEnd={handleDragEnd}
                className={`group relative flex flex-col items-center p-6 transition-all duration-300 sm:border-r sm:border-b sm:border-border cursor-grab active:cursor-grabbing ${
                  isSelected ? "bg-accent/5" : ""
                }`}
              >
                {/* Micro Piece Number Tag */}
                <div className="flex items-center justify-between w-full max-w-[240px] mb-4">
                  <span className="text-[9.5px] uppercase tracking-[0.3em] font-bold text-muted-foreground">
                    PIECE {pieceNum}
                  </span>
                  {isSelected && (
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-accent">
                      Selected
                    </span>
                  )}
                </div>

                {/* Piece Image in Portrait Frame */}
                <div
                  onClick={() =>
                    setSelectedItems({
                      ...selectedItems,
                      [collection.id]: item.id,
                    })
                  }
                  className="relative w-full aspect-[3/4] max-w-[240px] overflow-hidden bg-background border border-border/50 mb-5 cursor-pointer"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground font-serif italic">
                      No Image
                    </div>
                  )}

                  {/* Hover Overlay with Action Buttons */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                    {/* Top Row: Delete & Edit */}
                    <div className="flex items-center justify-between w-full">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditImage(collection.id, item.id);
                        }}
                        className="p-1.5 rounded-full bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
                        title="Edit Image"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(collection.id, item.id);
                        }}
                        className="p-1.5 rounded-full bg-black/60 hover:bg-destructive text-white transition-colors cursor-pointer"
                        title="Delete Item"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Center: View Image */}
                    <div className="flex justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.imageUrl) {
                            onPreviewImage?.(
                              item.imageUrl,
                              item.name,
                              `${collection.name} • Curated Piece`
                            );
                          }
                        }}
                        className="text-[9.5px] uppercase tracking-[0.2em] font-bold text-white border border-white/80 px-3 py-1.5 backdrop-blur-xs shadow-md hover:bg-white hover:text-black transition-colors cursor-pointer"
                      >
                        View Image
                      </button>
                    </div>

                    <div />
                  </div>
                </div>

                {/* Details */}
                <div className="text-center w-full max-w-[240px]">
                  <h4 className="font-serif text-lg text-foreground font-medium truncate">
                    {item.name}
                  </h4>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1 truncate">
                    {collection.name} · Curated
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Collection Notes Footer */}
      <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <span className="text-[10px] uppercase tracking-[0.26em] font-bold text-foreground block mb-1">
            Collection Notes
          </span>
          <p className="text-xs text-muted-foreground font-light leading-relaxed">
            {collection.name} archive contains {collection.items.length}{" "}
            {collection.items.length === 1 ? "piece" : "pieces"} categorized for daily outfit recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
