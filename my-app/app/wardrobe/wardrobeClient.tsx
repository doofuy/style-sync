"use client";

// import { auth } from "@clerk/nextjs/server";

import { SetStateAction, useState, useEffect } from "react";
import SelectedOutfit from "./currentOutfit";
import CollectionRow from "./collectionRow";
import { Collection, Item } from "@/types/wardrobe";

export default function WardrobeClient() {
  // await auth.protect();

  // STATE: Stores all collections of clothes (e.g., Sneakers, Caps) and their respective items
  const [collections, setCollections] = useState<Collection[]>([]);

  // Fetch wardrobe collections and items from API
  const fetchWardrobe = async () => {
    try {
      const res = await fetch("/api/wardrobe");
      const data = await res.json();
      if (data.success && Array.isArray(data.collections)) {
        setCollections(data.collections);
      }
    } catch (err) {
      console.error("Failed to fetch wardrobe:", err);
    }
  };

  useEffect(() => {
    console.log("Fetching wardrobe...");
    fetchWardrobe();
  }, []);

  // STATE: Manage visibility, state variables, and upload indicators for the AI Upload section
  const [aiUploadFile, setAiUploadFile] = useState<File | null>(null);
  const [aiUploadName, setAiUploadName] = useState("");
  const [isAiOrganizing, setIsAiOrganizing] = useState(false);

  console.log("RENDER:", collections);

  // STATE: Stores the current outfit selections (mapping collectionId -> itemId)
  const [selectedItems, setSelectedItems] = useState<Record<string, string>>(
    {},
  );

  // STATE: Manage visibility and input for the "Create Collection" modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");

  // OPERATION: Creates a new clothing collection (category)
  const handleCreateCollection = async () => {
    console.log("clicked");

    if (!collectionName.trim()) return;

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: collectionName }),
      });
      const data = await res.json();
      if (data.success && data.collection) {
        const newCollection: Collection = {
          id: data.collection._id || data.collection.id,
          name: data.collection.name,
          items: [],
        };
        setCollections((prev) => [...prev, newCollection]);
        showToast("Collection created successfully!");
      }
    } catch (error) {
      console.error("Failed to create collection:", error);
    }

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
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(
    null,
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [isUploadingItem, setIsUploadingItem] = useState(false);
  const [isUploadingEdit, setIsUploadingEdit] = useState(false);

  // STATE: Manage collection deletion confirmation modal
  const [collectionToDelete, setCollectionToDelete] =
    useState<Collection | null>(null);
  const [isDeletingCollection, setIsDeletingCollection] = useState(false);

  // STATE: Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
  const handleItemLocalImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingItem(true);
    const url = await uploadImageFile(file);
    if (url) {
      setItemImageUrl(url);
    } else {
      showToast("Failed to upload image. Please try again.", "error");
    }
    setIsUploadingItem(false);
  };

  // OPERATION: Handles local file selection and triggers upload when editing an existing item's image
  const handleEditLocalImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingEdit(true);
    const url = await uploadImageFile(file);
    if (url) {
      setEditImageUrl(url);
    } else {
      showToast("Failed to upload image. Please try again.", "error");
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
  const handleSaveImage = async () => {
    if (!editingCollectionId || !editingItemId) return;

    try {
      const res = await fetch(`/api/items/${editingItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: editImageUrl.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCollections((prev) =>
          prev.map((collection) =>
            collection.id === editingCollectionId
              ? {
                  ...collection,
                  items: collection.items.map((item) =>
                    item.id === editingItemId
                      ? {
                          ...item,
                          imageUrl: editImageUrl.trim()
                            ? editImageUrl.trim()
                            : undefined,
                        }
                      : item,
                  ),
                }
              : collection,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to update item image:", error);
    }

    setIsEditModalOpen(false);
    setEditingCollectionId(null);
    setEditingItemId(null);
    setEditImageUrl("");
  };

  // OPERATION: Deletes an item from its collection and cleans up its selection from the current outfit state
  const handleDeleteItem = async (collectionId: string, itemId: string) => {
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCollections((prev) =>
          prev.map((c) =>
            c.id === collectionId
              ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
              : c,
          ),
        );
        setSelectedItems((prev) => {
          if (prev[collectionId] === itemId) {
            const updated = { ...prev };
            delete updated[collectionId];
            return updated;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  // OPERATION: Opens the delete collection confirmation modal
  const handleOpenDeleteModal = (collection: Collection) => {
    setCollectionToDelete(collection);
  };

  // OPERATION: Confirms and deletes the collection and all its items
  const confirmDeleteCollection = async () => {
    if (!collectionToDelete) return;

    setIsDeletingCollection(true);
    try {
      const res = await fetch(`/api/collections/${collectionToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCollections((prev) =>
          prev.filter((c) => c.id !== collectionToDelete.id),
        );
        setSelectedItems((prev) => {
          const updated = { ...prev };
          delete updated[collectionToDelete.id];
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to delete collection:", error);
    } finally {
      setIsDeletingCollection(false);
      setCollectionToDelete(null);
    }
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
  const handleReorderItems = async (
    collectionId: string,
    updatedItems: Item[],
  ) => {
    // Optimistically update frontend state
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              items: updatedItems,
            }
          : c,
      ),
    );

    try {
      const itemsPayload = updatedItems.map((item, index) => ({
        id: item.id,
        order: index,
      }));

      await fetch("/api/items/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsPayload }),
      });
    } catch (error) {
      console.error("Failed to reorder items in database:", error);
    }
  };

  // OPERATION: Appends a newly created clothing item (with name and optional image) to its collection list
  const handleCreateItem = async () => {
    if (!itemName.trim()) return;
    if (!activeCollectionId) return;

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: itemName,
          imageUrl: itemImageUrl.trim(),
          collectionId: activeCollectionId,
        }),
      });
      const data = await res.json();
      if (data.success && data.item) {
        const newItem: Item = {
          id: data.item._id || data.item.id,
          name: data.item.name,
          imageUrl: data.item.imageUrl || undefined,
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
        showToast("Item added successfully!");
      }
    } catch (error) {
      console.error("Failed to create item:", error);
    }

    setItemName("");
    setItemImageUrl("");
    setActiveCollectionId(null);
    setIsItemModalOpen(false);
  };

  // OPERATION: AI Classification and Organization
  const handleAiUploadAndOrganize = async () => {
    if (!aiUploadFile || !aiUploadName.trim()) return;

    setIsAiOrganizing(true);
    try {
      // 1. Upload to Cloudinary
      const imageUrl = await uploadImageFile(aiUploadFile);
      if (!imageUrl) {
        showToast("Failed to upload image. Please try again.", "error");
        setIsAiOrganizing(false);
        return;
      }

      // 2. Call ML API
      const res = await fetch("/api/items/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: aiUploadName,
          imageUrl: imageUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // 3. Success state
        setAiUploadFile(null);
        setAiUploadName("");
        showToast("Item organized successfully into " + data.collection + "!");
        
        // 4. Refresh wardrobe data
        await fetchWardrobe();
      } else {
        showToast(data.message || "Failed to classify and organize image.", "error");
      }
    } catch (error) {
      console.error("AI Upload Error:", error);
      showToast("An unexpected error occurred during AI Upload.", "error");
    } finally {
      setIsAiOrganizing(false);
    }
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
            <h2 className="mb-4 text-xl font-semibold text-slate-800 dark:text-slate-200">
              Add Item
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Item Name
                </label>
                <input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Nike Air Max"
                  className="w-full rounded-lg border p-2 text-sm bg-background"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Image URL
                </label>
                <input
                  value={itemImageUrl}
                  onChange={(e) => setItemImageUrl(e.target.value)}
                  placeholder="Paste an image link..."
                  className="w-full rounded-lg border p-2 text-sm bg-background"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="shrink mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  or
                </span>
                <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  Upload Local File
                </label>
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
                  <img
                    src={itemImageUrl}
                    alt="Preview"
                    className="h-full w-full object-contain"
                  />
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
            <h2 className="mb-4 text-xl font-semibold text-slate-800 dark:text-slate-200">
              Edit Image
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Image URL
                </label>
                <input
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="Paste an image link..."
                  className="w-full rounded-lg border p-2 text-sm bg-background"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="shrink mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  or
                </span>
                <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  Upload Local File
                </label>
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
                  <img
                    src={editImageUrl}
                    alt="Preview"
                    className="h-full w-full object-contain"
                  />
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

      {/* MODAL: Confirmation modal for deleting a collection */}
      {collectionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl transition-all">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-500 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 shrink-0">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Delete Collection
              </h2>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                "{collectionToDelete.name}"
              </span>
              ?
            </p>

            {collectionToDelete.items.length > 0 && (
              <div className="mt-3.5 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <svg
                  className="h-4 w-4 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  This collection contains{" "}
                  <strong>
                    {collectionToDelete.items.length}{" "}
                    {collectionToDelete.items.length === 1 ? "item" : "items"}
                  </strong>
                  . Deleting it will permanently remove all items inside it.
                </span>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setCollectionToDelete(null)}
                className="rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                disabled={isDeletingCollection}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCollection}
                disabled={isDeletingCollection}
                className="rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white font-medium px-4 py-2 text-sm cursor-pointer transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isDeletingCollection ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  "Delete Collection"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI UPLOAD SECTION */}
      <div className="mt-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>🤖</span> AI Upload
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Upload a clothing image and let AI automatically organize it into the correct collection.
          </p>
        </div>

        <div className="flex flex-col gap-4 max-w-xl">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">
              Image Upload
            </label>
            {!aiUploadFile ? (
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer group">
                <svg
                  className="w-8 h-8 text-slate-400 group-hover:text-violet-500 mb-2 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Click to browse or drag & drop</span>
                <span className="text-xs text-slate-400 mt-1">Accepts only image files</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setAiUploadFile(file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isAiOrganizing}
                />
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row items-center gap-4">
                <div className="h-24 w-24 shrink-0 rounded border bg-white dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                  <img
                    src={URL.createObjectURL(aiUploadFile)}
                    alt="AI Upload Preview"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex flex-col flex-grow items-start">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate w-48 mb-2">
                    {aiUploadFile.name}
                  </span>
                  <button
                    onClick={() => setAiUploadFile(null)}
                    disabled={isAiOrganizing}
                    className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer"
                  >
                    Remove / Change
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Item Name
            </label>
            <input
              value={aiUploadName}
              onChange={(e) => setAiUploadName(e.target.value)}
              placeholder="e.g. Blue Oversized T-Shirt"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 p-2.5 text-sm bg-background"
              disabled={isAiOrganizing}
            />
          </div>

          <div className="mt-2">
            <button
              onClick={handleAiUploadAndOrganize}
              disabled={!aiUploadFile || !aiUploadName.trim() || isAiOrganizing}
              className="w-full sm:w-auto rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-2.5 text-sm transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isAiOrganizing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Organizing...
                </>
              ) : (
                "Upload & Organize"
              )}
            </button>
          </div>
        </div>
      </div>

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
            onDeleteCollection={handleOpenDeleteModal}
            onEditImage={handleOpenEditImageModal}
            onReorderItems={handleReorderItems}
          />
        ))}
      </div>

      <div className="mt-8 border-t pt-6"></div>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg border transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
          toast.type === "success" 
            ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/80 dark:border-green-900 dark:text-green-300" 
            : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/80 dark:border-red-900 dark:text-red-300"
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
            ) : (
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            )}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </main>
  );
}
