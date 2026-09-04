"use client";

// import { auth } from "@clerk/nextjs/server";

import { SetStateAction, useState, useEffect } from "react";
import SelectedOutfit from "./currentOutfit";
import CollectionRow from "./collectionRow";
import CategoryGrid from "@/components/wardrobe/CategoryGrid";
import { Collection, Item } from "@/types/wardrobe";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  Coffee,
  Heart,
  Briefcase,
  Sparkles,
  Building2,
  Crown,
  Plane,
  Dumbbell,
  Music,
  ChevronDown,
  Check,
  Wand2,
  Bot,
  Camera,
  X,
  ArrowRight,
  Plus,
} from "lucide-react";
import CameraModal from "@/components/camera/CameraModal";

const OCCASIONS = [
  {
    value: "college",
    label: "College",
    icon: GraduationCap,
    note: "Casual ease with structured essentials. Comfortable layering built for campus movement and everyday style.",
    palette: "Heather Grey & Navy",
  },
  {
    value: "casual",
    label: "Casual",
    icon: Coffee,
    note: "Clean lines with a relaxed drape. The breathable linen keeps the look elevated yet nonchalant, grounded by classic denim and leather footwear.",
    palette: "Warm Ivory & Indigo",
  },
  {
    value: "date",
    label: "Date",
    icon: Heart,
    note: "Refined, romantic silhouette with rich textures and understated accents designed for intimate ambiance.",
    palette: "Midnight Ink & Burgundy",
  },
  {
    value: "interview",
    label: "Interview",
    icon: Briefcase,
    note: "Sharp tailored proportions structured for executive presence and impeccable confidence.",
    palette: "Charcoal & Crisp White",
  },
  {
    value: "party",
    label: "Night Party",
    icon: Sparkles,
    note: "Bold contrasts and dynamic styling to stand out effortlessly under evening lights.",
    palette: "Onyx Black & Metallic",
  },
  {
    value: "office",
    label: "Office / Work",
    icon: Building2,
    note: "Modern professional palette with crisp tailoring and comfortable day-long poise.",
    palette: "Stone Taupe & Slate",
  },
  {
    value: "wedding",
    label: "Wedding / Formal",
    icon: Crown,
    note: "Regal elegance and celebratory textures curated for memorable ceremonies.",
    palette: "Royal Cream & Gold",
  },
  {
    value: "travel",
    label: "Travel & Escape",
    icon: Plane,
    note: "Breathable travel-ready garments prioritizing comfort without sacrificing aesthetic polish.",
    palette: "Sand Dune & Olive",
  },
  {
    value: "gym",
    label: "Athletic & Gym",
    icon: Dumbbell,
    note: "High-performance technical fabrics engineered for peak mobility and recovery.",
    palette: "Graphite & Volt",
  },
  {
    value: "festival",
    label: "Festival",
    icon: Music,
    note: "Vibrant bohemian expression with textured layers and statement accessories.",
    palette: "Terracotta & Desert Gold",
  },
];

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

  // STATE: Outfit Recommendation section
  const [occasion, setOccasion] = useState("college");
  const [isRecommending, setIsRecommending] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recommendedOutfit, setRecommendedOutfit] = useState<Record<
    string,
    { name: string; imageUrl?: string; articleType: string } | null
  > | null>(null);

  // STATE: Full Image Modal Preview
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  const selectedOccasionObj =
    OCCASIONS.find((o) => o.value === occasion) || OCCASIONS[0];
  const SelectedIcon = selectedOccasionObj.icon;

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

  // HELPER: Retrieves existing collection ID or creates a new collection by category name on the fly
  const getOrCreateCollection = async (collectionIdOrName: string): Promise<string | null> => {
    const byId = collections.find((c) => c.id === collectionIdOrName);
    if (byId) return byId.id;

    const byName = collections.find(
      (c) => c.name.toLowerCase() === collectionIdOrName.toLowerCase()
    );
    if (byName) return byName.id;

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: collectionIdOrName }),
      });
      const data = await res.json();
      if (data.success && data.collection) {
        const newCollection: Collection = {
          id: data.collection._id || data.collection.id,
          name: data.collection.name,
          items: [],
        };
        setCollections((prev) => [...prev, newCollection]);
        return newCollection.id;
      }
    } catch (error) {
      console.error("Failed to auto-create collection:", error);
    }
    return null;
  };

  const handleAddFirstItemToCategory = async (categoryName: string) => {
    const colId = await getOrCreateCollection(categoryName);
    if (colId) {
      setOpenCollectionId(colId);
      handleOpenItemModal(colId);
    } else {
      showToast("Failed to initialize category. Please try again.", "error");
    }
  };

  // STATE: Manage visibility, inputs, and active collection context for the "Add Item" modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  console.log("ITEM MODAL STATE:", isItemModalOpen);

  const [itemName, setItemName] = useState("");
  const [itemImageUrl, setItemImageUrl] = useState("");
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(
    null,
  );
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [itemError, setItemError] = useState("");

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

  // STATE: Manage camera modal capture
  const [cameraTarget, setCameraTarget] = useState<"add" | "edit" | "ai" | null>(null);

  const handleCameraCapture = async (file: File) => {
    if (cameraTarget === "ai") {
      setAiUploadFile(file);
      setCameraTarget(null);
      return;
    }

    if (cameraTarget === "add") {
      setIsUploadingItem(true);
      setCameraTarget(null);
      const url = await uploadImageFile(file);
      if (url) {
        setItemImageUrl(url);
      } else {
        showToast("Failed to upload captured photo. Please try again.", "error");
      }
      setIsUploadingItem(false);
      return;
    }

    if (cameraTarget === "edit") {
      setIsUploadingEdit(true);
      setCameraTarget(null);
      const url = await uploadImageFile(file);
      if (url) {
        setEditImageUrl(url);
      } else {
        showToast("Failed to upload captured photo. Please try again.", "error");
      }
      setIsUploadingEdit(false);
      return;
    }
  };

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
    setItemError("");
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

  // OPERATION: Deletes an item from its collection and automatically removes collection if 0 items remain
  const handleDeleteItem = async (collectionId: string, itemId: string) => {
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCollections((prev) => {
          const targetCol = prev.find((c) => c.id === collectionId);
          if (!targetCol) return prev;

          const updatedItems = targetCol.items.filter((i) => i.id !== itemId);
          // If no items remain in collection or server auto-deleted empty collection
          if (updatedItems.length === 0 || data.collectionDeleted) {
            return prev.filter((c) => c.id !== collectionId);
          }

          return prev.map((c) =>
            c.id === collectionId ? { ...c, items: updatedItems } : c,
          );
        });

        setSelectedItems((prev) => {
          if (prev[collectionId] === itemId || prev[collectionId]) {
            const updated = { ...prev };
            delete updated[collectionId];
            return updated;
          }
          return prev;
        });

        if (data.collectionDeleted) {
          showToast("Item deleted. Empty collection was automatically removed.");
        } else {
          showToast("Item deleted successfully.");
        }
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
    if (!activeCollectionId) {
      showToast("No collection selected. Please reopen the modal.", "error");
      setItemError("No active collection selected.");
      return;
    }

    const targetCollection = collections.find((c) => c.id === activeCollectionId);
    let finalName = itemName.trim();

    // If user provided an image but left name empty, give a clean default name
    if (!finalName) {
      if (itemImageUrl.trim()) {
        finalName = `${targetCollection?.name || "Clothing"} Piece`;
      } else {
        setItemError("Please enter an item name or provide an image.");
        return;
      }
    }

    setIsCreatingItem(true);
    setItemError("");

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finalName,
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
        setItemName("");
        setItemImageUrl("");
        setItemError("");
        setActiveCollectionId(null);
        setIsItemModalOpen(false);
      } else {
        const errorMsg = data.message || "Failed to create item. Please try again.";
        setItemError(errorMsg);
        showToast(errorMsg, "error");
      }
    } catch (error) {
      console.error("Failed to create item:", error);
      const networkMsg = "Network error. Failed to save item.";
      setItemError(networkMsg);
      showToast(networkMsg, "error");
    } finally {
      setIsCreatingItem(false);
    }
  };

  // OPERATION: AI Classification and Organization
  const handleAiUploadAndOrganize = async () => {
    if (!aiUploadFile) return;

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
          imageUrl: imageUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // 3. Success state
        setAiUploadFile(null);
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

  // OPERATION: Fetch Outfit Recommendation
  const handleRecommendOutfit = async () => {
    setIsRecommending(true);
    try {
      const res = await fetch("/api/outfit/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.outfit) {
        setRecommendedOutfit(data.outfit);
        showToast(
          `Outfit recommended for ${occasion.charAt(0).toUpperCase() + occasion.slice(1)}!`,
        );
      } else {
        showToast(
          data.message || "Failed to get outfit recommendation.",
          "error",
        );
      }
    } catch (error) {
      console.error("Recommend Outfit Error:", error);
      showToast("An unexpected error occurred during recommendation.", "error");
    } finally {
      setIsRecommending(false);
    }
  };

  // STATE: Manage open collection from CategoryGrid
  const [openCollectionId, setOpenCollectionId] = useState<string | null>(null);

  return (
    <main className="max-w-6xl mx-auto p-6">
      {/* GLOBAL CAMERA MODAL */}
      <CameraModal
        isOpen={cameraTarget !== null}
        onClose={() => setCameraTarget(null)}
        onCapture={handleCameraCapture}
      />

      {/* HERO BANNER SECTION: Full-bleed image background running for the entire screen height like Home Hero */}
      <div
        className="relative w-screen left-1/2 right-1/2 -translate-x-1/2 min-h-[85vh] sm:min-h-[90vh] bg-cover bg-center flex items-center justify-center -mt-6 pt-6 mb-0 select-none overflow-hidden"
        style={{ backgroundImage: `url('/bg.avif')` }}
      >
        {/* Dark Scrim Overlay for high contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 backdrop-blur-[0.5px]" />

        {/* Centered High-Contrast Editorial Header & Action Button */}
        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center max-w-2xl">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.38em] font-medium text-white/80 mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            Personal Lookbook &amp; Style Catalog
          </span>
          <h1 className="font-display text-5xl sm:text-7xl font-normal tracking-[0.22em] uppercase text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            My Wardrobe
          </h1>
          <p className="max-w-md text-xs sm:text-sm text-white/80 font-light tracking-wider mt-4 leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
            Explore your curated categories, discover daily AI pairings, and assemble custom outfits.
          </p>

          {/* TRIGGER: Button to open Create Collection Modal — Elegant White Outline */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-8 border border-white/90 bg-black/35 hover:bg-white hover:text-black text-white uppercase tracking-[0.24em] text-[11px] font-semibold px-8 py-3.5 transition-all duration-300 cursor-pointer rounded-none shadow-[0_4px_12px_rgba(0,0,0,0.8)] active:scale-[0.99]"
          >
            + Create Collection
          </button>
        </div>

        {/* Subtle Bottom Divider Gradient — seamless white/background blend */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
      </div>

      {/* COMPONENT: Sézane-inspired Edge-to-Edge Category Grid */}
      <CategoryGrid
        collections={collections}
        onCategoryClick={(collectionId) => {
          setOpenCollectionId((prev) => (prev === collectionId ? null : collectionId));
        }}
      />

      {/* COMPONENT: Selected outfit lookbook panel (Current Look) */}
      <SelectedOutfit
        collections={collections}
        selectedItems={selectedItems}
        onDeselect={handleDeselectItem}
      />

      {/* MODAL: Form to create a new Collection category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-md border border-border bg-card p-6 shadow-xl">
            <h2 className="mb-2 text-xs uppercase tracking-[0.22em] font-semibold text-foreground">
              Create Collection
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Add a new category section to your lookbook.
            </p>

            <input
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="e.g. Knitwear, Trench Coats, Loafers"
              className="w-full rounded-sm border border-border p-2.5 bg-background text-sm text-foreground focus:outline-none focus:border-primary"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-sm border border-border px-4 py-2 cursor-pointer text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateCollection}
                className="rounded-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity px-5 py-2 cursor-pointer text-xs uppercase tracking-wider font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Form to add a new clothing item, supporting either Image URLs or local file uploads */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-md border border-border bg-card p-6 shadow-xl">
            <h2 className="mb-2 text-xs uppercase tracking-[0.22em] font-semibold text-foreground">
              Add Item
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Upload an image or paste a URL for this clothing piece.
            </p>

            {itemError && (
              <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs rounded-sm">
                {itemError}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
                  Item Name
                </label>
                <input
                  value={itemName}
                  onChange={(e) => {
                    setItemName(e.target.value);
                    if (itemError) setItemError("");
                  }}
                  placeholder="e.g. Linen Shirt, Loafers"
                  className="w-full rounded-sm border border-border p-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
                  Image URL
                </label>
                <input
                  value={itemImageUrl}
                  onChange={(e) => {
                    setItemImageUrl(e.target.value);
                    if (itemError) setItemError("");
                  }}
                  placeholder="Paste an image link..."
                  className="w-full rounded-sm border border-border p-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-border"></div>
                <span className="shrink mx-4 text-muted-foreground text-[10px] font-semibold uppercase tracking-widest">
                  or
                </span>
                <div className="grow border-t border-border"></div>
              </div>

              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Upload or Take Photo
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCameraTarget("add")}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-sm bg-primary hover:opacity-90 text-primary-foreground font-medium text-xs uppercase tracking-wider transition-opacity cursor-pointer shrink-0"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Take Photo</span>
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleItemLocalImageUpload}
                    className="w-full text-xs text-muted-foreground file:mr-2 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-medium file:uppercase file:tracking-wider file:bg-muted file:text-foreground file:cursor-pointer hover:file:opacity-80 transition-opacity cursor-pointer"
                    disabled={isUploadingItem || isCreatingItem}
                  />
                </div>
                {isUploadingItem && (
                  <span className="text-xs text-accent animate-pulse mt-1 block">
                    Uploading image...
                  </span>
                )}
              </div>

              {/* Live preview of the uploaded or pasted item image */}
              {itemImageUrl && (
                <div className="mt-2 h-32 w-full border border-border rounded-sm overflow-hidden flex items-center justify-center bg-muted/20">
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
                onClick={() => {
                  setItemError("");
                  setIsItemModalOpen(false);
                }}
                disabled={isCreatingItem}
                className="rounded-sm border border-border px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateItem}
                className="rounded-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity px-5 py-2 text-xs uppercase tracking-wider font-medium cursor-pointer disabled:opacity-50 flex items-center gap-2"
                disabled={isUploadingItem || isCreatingItem}
              >
                {isCreatingItem ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Form to edit the image of an existing wardrobe item (URL or upload options) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-md border border-border bg-card p-6 shadow-xl">
            <h2 className="mb-2 text-xs uppercase tracking-[0.22em] font-semibold text-foreground">
              Edit Image
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Update image URL or capture/upload a replacement.
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
                  Image URL
                </label>
                <input
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="Paste an image link..."
                  className="w-full rounded-sm border border-border p-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-border"></div>
                <span className="shrink mx-4 text-muted-foreground text-[10px] font-semibold uppercase tracking-widest">
                  or
                </span>
                <div className="grow border-t border-border"></div>
              </div>

              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Upload or Take Photo
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCameraTarget("edit")}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-sm bg-primary hover:opacity-90 text-primary-foreground font-medium text-xs uppercase tracking-wider transition-opacity cursor-pointer shrink-0"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Take Photo</span>
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditLocalImageUpload}
                    className="w-full text-xs text-muted-foreground file:mr-2 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-medium file:uppercase file:tracking-wider file:bg-muted file:text-foreground file:cursor-pointer hover:file:opacity-80 transition-opacity cursor-pointer"
                    disabled={isUploadingEdit}
                  />
                </div>
                {isUploadingEdit && (
                  <span className="text-xs text-accent animate-pulse mt-1 block">
                    Uploading image...
                  </span>
                )}
              </div>

              {/* Live preview of the updated image URL or uploaded Cloudinary URL */}
              {editImageUrl && (
                <div className="mt-2 h-32 w-full border border-border rounded-sm overflow-hidden flex items-center justify-center bg-muted/20">
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
                className="rounded-sm border border-border px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveImage}
                className="rounded-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity px-5 py-2 text-xs uppercase tracking-wider font-medium cursor-pointer disabled:opacity-50"
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-md border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center gap-3 text-destructive mb-3">
              <h2 className="text-xs uppercase tracking-[0.22em] font-semibold text-foreground">
                Delete Collection
              </h2>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground uppercase tracking-wider">
                "{collectionToDelete.name}"
              </span>
              ?
            </p>

            {collectionToDelete.items.length > 0 && (
              <div className="mt-3.5 rounded-sm border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive flex items-start gap-2.5">
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
                className="rounded-sm border border-border px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                disabled={isDeletingCollection}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCollection}
                disabled={isDeletingCollection}
                className="rounded-sm bg-destructive text-destructive-foreground hover:opacity-90 font-medium px-5 py-2 text-xs uppercase tracking-wider cursor-pointer transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {isDeletingCollection ? (
                  <>
                    <svg
                      className="animate-spin h-3.5 w-3.5 text-white"
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
      <section className="my-14 rounded-md border border-border bg-card p-6 sm:p-10 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center p-2.5 rounded-full bg-accent/10 text-accent mb-3">
            <Bot className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-foreground">
            AI Upload & Categorize
          </h2>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-1.5 font-bold">
            Upload an item and let AI classify it into your wardrobe
          </p>
        </div>

        <div className="flex flex-col gap-4 max-w-lg mx-auto items-center">
          <div className="w-full">
            {!aiUploadFile ? (
              <div className="flex flex-col gap-3">
                <div className="border border-dashed border-border hover:border-accent rounded-sm p-8 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors relative cursor-pointer group">
                  <svg
                    className="w-8 h-8 text-muted-foreground group-hover:text-accent mb-2 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[11px] uppercase tracking-[0.22em] font-bold text-foreground">
                    Click to browse or drag & drop
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">
                    Accepts PNG, JPG, WEBP
                  </span>
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
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setCameraTarget("ai")}
                    disabled={isAiOrganizing}
                    className="flex items-center gap-2 px-4 py-2 rounded-sm bg-primary hover:opacity-90 text-primary-foreground text-[10px] uppercase tracking-[0.2em] font-bold transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Take Photo with Camera</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-border rounded-sm p-4 bg-muted/20 flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="h-28 w-28 shrink-0 rounded-sm border border-border bg-card overflow-hidden flex items-center justify-center">
                  <img
                    src={URL.createObjectURL(aiUploadFile)}
                    alt="AI Upload Preview"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-foreground truncate w-48 mb-2">
                    {aiUploadFile.name}
                  </span>
                  <button
                    onClick={() => setAiUploadFile(null)}
                    disabled={isAiOrganizing}
                    className="text-[10px] uppercase tracking-wider text-destructive hover:underline font-bold cursor-pointer"
                  >
                    Remove / Change
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 w-full flex justify-center">
            <button
              onClick={handleAiUploadAndOrganize}
              disabled={!aiUploadFile || isAiOrganizing}
              className="w-full sm:w-auto rounded-sm bg-accent text-accent-foreground hover:opacity-90 font-bold px-8 py-3 text-[10px] uppercase tracking-[0.22em] transition-opacity disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              {isAiOrganizing ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-accent-foreground" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Organizing...</span>
                </>
              ) : (
                "Upload & Organize"
              )}
            </button>
          </div>
        </div>
      </section>

      {/* OUTFIT RECOMMENDATION SECTION: Sézane-inspired Curated Lookbook Frame */}
      <section className="my-16 select-none">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-[10.5px] uppercase tracking-[0.3em] font-semibold text-muted-foreground">
                AI Styling Atelier
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-wide text-foreground">
              Today&apos;s Outfit, Curated
            </h2>
          </div>

          <p className="font-serif text-base sm:text-lg text-muted-foreground max-w-md italic leading-relaxed">
            Intelligent pairings assembled from your closet pieces, balanced for the day&apos;s climate, silhouette, and occasion.
          </p>
        </div>

        {/* Real Product Lookbook Card Frame */}
        <div className="relative border border-border bg-background p-6 sm:p-10 shadow-xs">
          {/* Top Bar of Lookbook */}
          <div className="flex flex-wrap items-center justify-between border-b border-border pb-6 mb-8 gap-4">
            <div className="flex items-center gap-3">
              {/* Dropdown for Occasion Selector */}
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    disabled={isRecommending}
                    className="inline-flex items-center gap-2 text-[10px] sm:text-[10.5px] uppercase tracking-[0.24em] font-bold px-3.5 py-1.5 bg-muted text-foreground border border-border hover:border-accent transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5 text-accent" />
                    <span>Occasion: {selectedOccasionObj.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  sideOffset={6}
                  className="w-[280px] p-1.5 rounded-none border border-border bg-card shadow-xl z-50"
                >
                  <DropdownMenuRadioGroup
                    value={occasion}
                    onValueChange={(val) => {
                      setOccasion(val);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {OCCASIONS.map((occ) => {
                      const IconComponent = occ.icon;
                      const isSelected = occasion === occ.value;
                      return (
                        <DropdownMenuRadioItem
                          key={occ.value}
                          value={occ.value}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 text-[10px] uppercase tracking-[0.18em] font-bold cursor-pointer transition-colors my-0.5",
                            isSelected
                              ? "bg-accent/10 text-accent font-bold"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <IconComponent className="w-3.5 h-3.5" />
                            <span>{occ.label}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
                        </DropdownMenuRadioItem>
                      );
                    })}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <span className="text-[10px] uppercase tracking-[0.24em] font-medium text-muted-foreground hidden sm:inline">
                Weather: 22°C · Clear Sky
              </span>
            </div>

            <div className="text-[10.5px] uppercase tracking-[0.22em] font-semibold text-muted-foreground">
              Harmonized Palette: {selectedOccasionObj.palette || "Warm Ivory & Indigo"}
            </div>
          </div>

          {/* Coordinated Outfit Items — Zero Gutters Sézane Look */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 border border-border bg-muted/20">
            {[
              {
                slot: "TOP",
                fallbackName: "Relaxed Linen Shirt",
                fallbackCategory: "Shirts",
                fallbackTone: "Ivory",
                fallbackImage: "/categories/Shirts.avif",
                item: recommendedOutfit?.topwear,
              },
              {
                slot: "BOTTOM",
                fallbackName: "Vintage Straight Denim",
                fallbackCategory: "Jeans",
                fallbackTone: "Washed Indigo",
                fallbackImage: "/categories/Jeans.avif",
                item: recommendedOutfit?.bottomwear,
              },
              {
                slot: "FOOTWEAR",
                fallbackName: "Minimalist Casual Sneakers",
                fallbackCategory: "Casual Shoes",
                fallbackTone: "Warm White",
                fallbackImage: "/categories/Casual Shoes.png",
                item: recommendedOutfit?.footwear,
              },
            ].map((slotItem, idx) => {
              const name = slotItem.item ? slotItem.item.name : slotItem.fallbackName;
              const category = slotItem.item ? slotItem.item.articleType : slotItem.fallbackCategory;
              const tone = slotItem.fallbackTone;
              const image = slotItem.item?.imageUrl || slotItem.fallbackImage;

              return (
                <div
                  key={slotItem.slot}
                  className={`group relative flex flex-col items-center p-6 transition-all duration-300 ${
                    idx !== 2 ? "sm:border-r sm:border-border" : ""
                  }`}
                >
                  {/* Slot Tag */}
                  <span className="text-[9.5px] uppercase tracking-[0.3em] font-bold text-muted-foreground mb-4">
                    {slotItem.slot}
                  </span>

                  {/* Piece Image */}
                  <div
                    onClick={() =>
                      image &&
                      setPreviewImage({
                        url: image,
                        title: name,
                        subtitle: `${slotItem.slot} • ${category}`,
                      })
                    }
                    className="relative w-full aspect-[3/4] max-w-[240px] overflow-hidden bg-background border border-border/50 mb-5 cursor-pointer"
                  >
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-[9.5px] uppercase tracking-[0.2em] font-bold text-white border border-white/80 px-3 py-1.5 backdrop-blur-xs shadow-md">
                        View Image
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="text-center">
                    <h4 className="font-serif text-lg text-foreground font-medium truncate max-w-[220px]">
                      {name}
                    </h4>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                      {category} · {tone}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Editorial Styling Notes & Terracotta CTA */}
          <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center sm:text-left">
              <span className="text-[10px] uppercase tracking-[0.26em] font-bold text-foreground block mb-1">
                Stylist Notes
              </span>
              <p className="text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">
                {selectedOccasionObj.note ||
                  "Clean lines with a relaxed drape. The breathable linen keeps the look elevated yet nonchalant, grounded by classic washed denim and pristine leather sneakers."}
              </p>
            </div>

            {/* TERRACOTTA ACCENT CTA — ONLY USE OF ACCENT TOKEN */}
            <button
              onClick={handleRecommendOutfit}
              disabled={isRecommending}
              className="inline-flex items-center justify-center gap-2.5 bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.24em] text-xs font-semibold px-8 py-4 transition-all duration-300 shadow-sm hover:shadow active:scale-[0.99] whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              {isRecommending ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-accent-foreground" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Curating Look...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Today&apos;s Look</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* MODAL: COLLECTION ROW POP-UP */}
      {openCollectionId && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setOpenCollectionId(null)}
        >
          <div 
            className="relative w-full max-w-5xl bg-background border border-border shadow-2xl overflow-y-auto max-h-[90vh] p-6 sm:p-10 animate-in zoom-in-95 duration-200 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header for Modal */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="text-[10.5px] uppercase tracking-[0.3em] font-semibold text-muted-foreground">
                  Wardrobe Lookbook Archive
                </span>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setOpenCollectionId(null)}
                className="rounded-full bg-muted/60 text-foreground p-2 hover:bg-muted transition-colors cursor-pointer"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const activeColl = collections.find(
                (c) =>
                  c.id === openCollectionId ||
                  c.name.toLowerCase() === openCollectionId.toLowerCase()
              );

              if (activeColl) {
                return (
                  <CollectionRow
                    collection={activeColl}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                    onAddItem={handleOpenItemModal}
                    onDeleteItem={handleDeleteItem}
                    onDeleteCollection={handleOpenDeleteModal}
                    onEditImage={handleOpenEditImageModal}
                    onReorderItems={handleReorderItems}
                    onPreviewImage={(url, title, subtitle) =>
                      setPreviewImage({ url, title, subtitle })
                    }
                  />
                );
              }

              // Empty uninitialized category
              return (
                <div className="w-full select-none">
                  {/* Top Metadata Bar */}
                  <div className="flex flex-wrap items-center justify-between border-b border-border pb-6 mb-8 gap-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[10.5px] uppercase tracking-[0.24em] font-bold px-3.5 py-1.5 bg-muted text-foreground border border-border">
                        <Check className="w-3.5 h-3.5 text-accent" />
                        Category: {openCollectionId}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.24em] font-medium text-muted-foreground">
                        Archived: 0 Pieces
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddFirstItemToCategory(openCollectionId)}
                      className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.2em] font-bold text-foreground hover:bg-muted border border-border px-3.5 py-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-accent" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  {/* Empty State Lookbook Frame */}
                  <div className="flex flex-col items-center justify-center py-20 border border-border bg-muted/20 text-center p-8">
                    <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-semibold">
                      No items in this collection yet
                    </span>
                    <p className="font-serif text-sm text-muted-foreground italic mt-2 max-w-md">
                      Add photographs or upload clothing pieces to start styling and cataloging your {openCollectionId} collection.
                    </p>
                    <button
                      onClick={() => handleAddFirstItemToCategory(openCollectionId)}
                      className="mt-6 inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[10.5px] uppercase tracking-[0.22em] font-bold hover:bg-foreground/85 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <div className="mt-12 border-t border-border pt-6"></div>

      {/* MODAL: Full Image Preview Pop-up */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200 cursor-pointer select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center bg-card border border-border rounded-sm p-4 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Close Button */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 z-10 rounded-full bg-black/60 text-white p-2 hover:bg-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Preview */}
            <div className="max-h-[75vh] w-full flex items-center justify-center overflow-hidden bg-black/20 rounded-xs">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[75vh] max-w-full object-contain"
              />
            </div>

            {/* Footer Metadata */}
            <div className="mt-3 text-center">
              <h3 className="font-serif text-lg tracking-wider uppercase font-semibold text-foreground">
                {previewImage.title}
              </h3>
              {previewImage.subtitle && (
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1 font-bold">
                  {previewImage.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION: Editorial Card Styling */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-sm shadow-xl border bg-card text-foreground transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
            toast.type === "success"
              ? "border-accent/40 text-foreground"
              : "border-destructive/40 text-destructive"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === "success" ? (
              <span className="h-2 w-2 rounded-full bg-accent" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-destructive" />
            )}
            <p className="text-xs uppercase tracking-wider font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </main>
  );
}
