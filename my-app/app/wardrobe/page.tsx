"use client";
import { SetStateAction, useState } from "react";
import SelectedOutfit from "./currentOutfit";
import CollectionRow from "./collectionRow";
import { Collection, Item } from "@/types/wardrobe";

export default function WardrobePage() {
  // STATE: Stores all collections of clothes (e.g., Sneakers, Caps) and their respective items
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: "1",
      name: "Sneakers",
      items: [
        {
          id: "s1",
          name: "Air Max",
          imageUrl: "",
        },
        {
          id: "s2",
          name: "Converse Chuck",
          imageUrl: "",
        },
      ],
    },
    {
      id: "2",
      name: "Caps",
      items: [
        {
          id: "c1",
          name: "Baseball Cap",
          imageUrl: "",
        },
        {
          id: "c2",
          name: "Beanie",
          imageUrl: "",
        },
      ],
    },
  ]);

  console.log("RENDER:", collections);

  // STATE: Stores the current outfit selections (mapping collectionId -> itemId)
  const [selectedItems, setSelectedItems] = useState<Record<string, string>>(
    {},
  );

  // STATE: Manage visibility and input for the "Create Collection" modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");

  // OPERATION: Creates a new clothing collection (category)
  const handleCreateCollection = () => {
    console.log("clicked");

    if (!collectionName.trim()) return;

    const newCollection = {
      id: Date.now().toString(),
      name: collectionName,
      items: [],
    };

    console.log(newCollection);

    setCollections((prev) => {
      const updated = [...prev, newCollection];

      console.log("UPDATED COLLECTIONS:", updated);

      return updated;
    });

    setCollectionName("");
    setIsModalOpen(false);
  };

  // STATE: Manage visibility, inputs, and active collection context for the "Add Item" modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  console.log("ITEM MODAL STATE:", isItemModalOpen);

  const [itemName, setItemName] = useState("");
  const [itemImageUrl, setItemImageUrl] = useState("");
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(
    null,
  );

  // STATE: Manage visibility, state variables, and upload indicators for the "Edit Image" modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [isUploadingItem, setIsUploadingItem] = useState(false);
  const [isUploadingEdit, setIsUploadingEdit] = useState(false);

  // HELPER: Uploads an image file to the `/api/upload` endpoint (Cloudinary backend)
  const uploadImageFile = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.imageUrl) {
        return data.imageUrl;
      }
      return null;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  // OPERATION: Opens the "Add Item" modal and initializes its input state
  const handleOpenItemModal = (collectionId: string) => {
    console.log("OPEN MODAL", collectionId);

    setActiveCollectionId(collectionId);
    setItemName("");
    setItemImageUrl("");
    setIsItemModalOpen(true);
  };

  // OPERATION: Handles local file selection and triggers upload for new wardrobe items
  const handleItemLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingItem(true);
    const url = await uploadImageFile(file);
    if (url) {
      setItemImageUrl(url);
    } else {
      alert("Failed to upload image. Please try again.");
    }
    setIsUploadingItem(false);
  };

  // OPERATION: Handles local file selection and triggers upload when editing an existing item's image
  const handleEditLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingEdit(true);
    const url = await uploadImageFile(file);
    if (url) {
      setEditImageUrl(url);
    } else {
      alert("Failed to upload image. Please try again.");
    }
    setIsUploadingEdit(false);
  };

  // OPERATION: Opens the "Edit Image" modal pre-populating with the current item image URL
  const handleOpenEditImageModal = (collectionId: string, itemId: string) => {
    const collection = collections.find((c) => c.id === collectionId);
    const item = collection?.items.find((i) => i.id === itemId);
    if (!item) return;

    setEditingCollectionId(collectionId);
    setEditingItemId(itemId);
    setEditImageUrl(item.imageUrl || "");
    setIsEditModalOpen(true);
  };

  // OPERATION: Saves the updated image URL (either external or uploaded Cloudinary URL) to the item in collections state
  const handleSaveImage = () => {
    if (!editingCollectionId || !editingItemId) return;

    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === editingCollectionId
          ? {
              ...collection,
              items: collection.items.map((item) =>
                item.id === editingItemId
                  ? { ...item, imageUrl: editImageUrl.trim() ? editImageUrl.trim() : undefined }
                  : item
              ),
            }
          : collection
      )
    );

    setIsEditModalOpen(false);
    setEditingCollectionId(null);
    setEditingItemId(null);
    setEditImageUrl("");
  };

  // OPERATION: Deletes an item from its collection and cleans up its selection from the current outfit state
  const handleDeleteItem = (collectionId: string, itemId: string) => {
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId
          ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
          : c
      )
    );
    setSelectedItems((prev) => {
      if (prev[collectionId] === itemId) {
        const updated = { ...prev };
        delete updated[collectionId];
        return updated;
      }
      return prev;
    });
  };

  // OPERATION: Clears selection for a specific collection in the current outfit state
  const handleDeselectItem = (collectionId: string) => {
    setSelectedItems((prev) => {
      const updated = { ...prev };
      delete updated[collectionId];
      return updated;
    });
  };

  // FEATURE/OPERATION: Reorder items inside a specific collection row when a drag and drop completes
  const handleReorderItems = (collectionId: string, updatedItems: Item[]) => {
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              items: updatedItems,
            }
          : c
      )
    );
  };

  // OPERATION: Appends a newly created clothing item (with name and optional image) to its collection list
  const handleCreateItem = () => {
    if (!itemName.trim()) return;
    if (!activeCollectionId) return;

    const newItem = {
      id: Date.now().toString(),
      name: itemName,
      imageUrl: itemImageUrl.trim() ? itemImageUrl.trim() : undefined,
    };

    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === activeCollectionId
          ? {
              ...collection,
              items: [...collection.items, newItem],
            }
          : collection,
      ),
    );

    setItemName("");
    setItemImageUrl("");
    setActiveCollectionId(null);
    setIsItemModalOpen(false);
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold">My Wardrobe</h1>
      
      {/* TRIGGER: Button to open Create Collection Modal */}
      <button
        className="mt-4 rounded-lg border border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white px-4 py-2 font-medium transition-all duration-200 shadow-sm shadow-violet-50 hover:shadow-md cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        + Create Collection
      </button>

      {/* COMPONENT: Renders current outfit selections card, filtering out unselected collections */}
      <SelectedOutfit
        collections={collections}
        selectedItems={selectedItems}
        onDeselect={handleDeselectItem}
      />

      {/* MODAL: Form to create a new Collection category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border bg-background p-6">
            <h2 className="mb-4 text-xl font-semibold">Create Collection</h2>

            <input
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="Collection name"
              className="w-full rounded-lg border p-2 bg-background"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border px-4 py-2 cursor-pointer text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateCollection}
                className="rounded-lg border bg-violet-600 text-white hover:bg-violet-700 transition-colors px-4 py-2 cursor-pointer text-sm"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Form to add a new clothing item, supporting either Image URLs or local file uploads */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border bg-background p-6">
            <h2 className="mb-4 text-xl font-semibold text-slate-800 dark:text-slate-200">Add Item</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Item Name</label>
                <input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Nike Air Max"
                  className="w-full rounded-lg border p-2 text-sm bg-background"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Image URL</label>
                <input
                  value={itemImageUrl}
                  onChange={(e) => setItemImageUrl(e.target.value)}
                  placeholder="Paste an image link..."
                  className="w-full rounded-lg border p-2 text-sm bg-background"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="shrink mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">or</span>
                <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Upload Local File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleItemLocalImageUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-600 dark:file:bg-violet-950/30 dark:file:text-violet-400 file:cursor-pointer file:transition-colors duration-200 cursor-pointer"
                  disabled={isUploadingItem}
                />
                {isUploadingItem && (
                  <span className="text-xs text-violet-600 dark:text-violet-400 animate-pulse mt-1 block">
                    Uploading to Cloudinary...
                  </span>
                )}
              </div>

              {/* Live preview of the uploaded or pasted item image */}
              {itemImageUrl && (
                <div className="mt-2 h-32 w-full border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                  <img src={itemImageUrl} alt="Preview" className="h-full w-full object-contain" />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateItem}
                className="rounded-lg border bg-violet-600 text-white hover:bg-violet-700 transition-colors px-4 py-2 text-sm cursor-pointer disabled:opacity-50"
                disabled={isUploadingItem}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Form to edit the image of an existing wardrobe item (URL or upload options) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border bg-background p-6">
            <h2 className="mb-4 text-xl font-semibold text-slate-800 dark:text-slate-200">Edit Image</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Image URL</label>
                <input
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="Paste an image link..."
                  className="w-full rounded-lg border p-2 text-sm bg-background"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="shrink mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">or</span>
                <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Upload Local File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditLocalImageUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-600 dark:file:bg-violet-950/30 dark:file:text-violet-400 file:cursor-pointer file:transition-colors duration-200 cursor-pointer"
                  disabled={isUploadingEdit}
                />
                {isUploadingEdit && (
                  <span className="text-xs text-violet-600 dark:text-violet-400 animate-pulse mt-1 block">
                    Uploading to Cloudinary...
                  </span>
                )}
              </div>

              {/* Live preview of the updated image URL or uploaded Cloudinary URL */}
              {editImageUrl && (
                <div className="mt-2 h-32 w-full border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                  <img src={editImageUrl} alt="Preview" className="h-full w-full object-contain" />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCollectionId(null);
                  setEditingItemId(null);
                  setEditImageUrl("");
                }}
                className="rounded-lg border px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveImage}
                className="rounded-lg border bg-violet-600 text-white hover:bg-violet-700 transition-colors px-4 py-2 text-sm cursor-pointer disabled:opacity-50"
                disabled={isUploadingEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OPERATION: Renders the horizontal rows for Sneakers, Caps, and other collections dynamically */}
      <div className="mt-8">
        {collections.map((collection) => (
          <CollectionRow
            key={collection.id}
            collection={collection}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            onAddItem={handleOpenItemModal}
            onDeleteItem={handleDeleteItem}
            onEditImage={handleOpenEditImageModal}
            onReorderItems={handleReorderItems}
          />
        ))}
      </div>

      <div className="mt-8 border-t pt-6"></div>
    </main>
  );
}
