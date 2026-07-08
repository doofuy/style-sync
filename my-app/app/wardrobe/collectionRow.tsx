import { useRef } from "react";
import WardrobeCard from "@/components/wardrobe/WardrobeCard";
import { Collection, Item } from "@/types/wardrobe";

// Props definition for the CollectionRow component representing a category row (e.g., Sneakers, Caps)
interface CollectionRowProps {
  collection: Collection;
  selectedItems: Record<string, string>; // Maps collectionId -> itemId
  setSelectedItems: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  onAddItem: (collectionId: string) => void; // Callback to open the Add Item modal for this collection
  onDeleteItem: (collectionId: string, itemId: string) => void; // Callback to delete a wardrobe item
  onEditImage: (collectionId: string, itemId: string) => void; // Callback to open the Edit Image modal for a specific item
  onReorderItems: (collectionId: string, updatedItems: Item[]) => void; // Callback to trigger collections state reorder on drop
}

export default function CollectionRow({
  collection,
  selectedItems,
  setSelectedItems,
  onAddItem,
  onDeleteItem,
  onEditImage,
  onReorderItems,
}: CollectionRowProps) {
  // REFS: Track drag indices without using state to avoid unnecessary, frequent render updates during dragover
  const draggedIndex = useRef<number | null>(null);
  const targetIndex = useRef<number | null>(null);

  // OPERATION: Arranges items according to target drop location and notifies the page component on drag completion
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
    <div className="mb-8">
      {/* HEADER SECTION: Displays category/collection name and trigger to add a new item */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{collection.name}</h2>

        {/* OPERATION: Open the "Add Item" modal for this collection when clicked */}
        <button
          onClick={() => {
            console.log("ADD ITEM CLICKED", collection.id);
            onAddItem(collection.id);
          }}
          className="rounded-lg border px-3 py-1 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
        >
          + Add Item
        </button>
      </div>

      {/* ITEMS GALLERY: Lists items horizontally with overflow scrolling */}
      <div className="flex gap-4 overflow-x-auto pt-2 pb-3 px-1 whitespace-nowrap">
        {/* CONDITION: Display empty state placeholder if the collection contains no items */}
        {collection.items.length === 0 ? (
          <div className="flex h-40 w-44 flex-col items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground bg-slate-50/50 dark:bg-slate-950/20">
            <span>No items yet</span>
            <span className="mt-1 text-xs text-slate-400">Add your first item</span>
          </div>
        ) : (
          /* OPERATION: Map over collection items and render a draggable wrapper for each WardrobeCard */
          collection.items.map((item, index) => (
            <div
              key={item.id}
              draggable
              // OPERATION: Store index of the item that the drag operation is initiated from
              onDragStart={() => {
                draggedIndex.current = index;
              }}
              // OPERATION: Mark index of active drag target card and prevent default to allow drop
              onDragOver={(e) => {
                e.preventDefault();
                targetIndex.current = index;
              }}
              // OPERATION: Rearrange items array once drag ends
              onDragEnd={handleDragEnd}
              className="flex-shrink-0 cursor-grab active:cursor-grabbing"
            >
              <WardrobeCard
                item={item}
                isSelected={selectedItems[collection.id] === item.id}
                // OPERATION: Select/toggle this item for the current outfit in this collection
                onClick={() =>
                  setSelectedItems({
                    ...selectedItems,
                    [collection.id]: item.id,
                  })
                }
                // OPERATION: Delete item completely from the wardrobe
                onDelete={() => onDeleteItem(collection.id, item.id)}
                // OPERATION: Edit the image URL or upload a local image file for this item
                onImageClick={() => onEditImage(collection.id, item.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

