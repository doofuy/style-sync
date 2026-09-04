"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, X, FileImage, CloudUpload, Camera } from "lucide-react";
import CameraModal from "@/components/camera/CameraModal";

interface UploadBoxProps {
  onFileSelect: (file: File | null) => void;
  previewUrl: string;
  setPreviewUrl: (url: string) => void;
}

export default function UploadBox({ onFileSelect, previewUrl, setPreviewUrl }: UploadBoxProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      onFileSelect(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFileSelect(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraInput = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCameraOpen(true);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Hidden standard file input */}
      <input
        ref={fileInputRef}
        className="hidden"
        id="imageUpload"
        type="file"
        accept="image/*"
        onChange={handleChange}
      />

      {/* Hidden mobile camera input fallback */}
      <input
        ref={cameraInputRef}
        className="hidden"
        id="cameraUpload"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
      />

      {/* Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) => {
          processFile(file);
          setIsCameraOpen(false);
        }}
      />

      {!previewUrl ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`
            relative group border-2 border-dashed rounded-3xl p-8 
            cursor-pointer flex flex-col items-center justify-center 
            transition-all duration-300 ease-out min-h-[320px]
            ${
              isDragActive
                ? "border-violet-500 bg-violet-50/50 dark:bg-violet-950/10 scale-[1.01] shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                : "border-muted-foreground/30 hover:border-violet-500/50 hover:bg-muted/40 hover:scale-[0.99]"
            }
          `}
        >
          {/* Decorative Glowing Background Gradients */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-violet-500/5 to-fuchsia-500/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className={`
            p-4 rounded-2xl bg-muted/60 mb-4 text-muted-foreground
            group-hover:bg-violet-500/10 group-hover:text-violet-500
            transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
            ${isDragActive ? "bg-violet-500/10 text-violet-500 scale-110 rotate-3" : ""}
          `}>
            <CloudUpload className="w-10 h-10 stroke-[1.5]" />
          </div>

          <p className="text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-violet-500">
            {isDragActive ? "Drop your outfit here!" : "Upload Outfit Image"}
          </p>
          
          <p className="text-sm text-muted-foreground mt-2 text-center max-w-[280px]">
            Drag and drop your photo here, or{" "}
            <span className="text-violet-500 font-medium group-hover:underline">browse</span> from device
          </p>

          {/* Action buttons: Take Photo & Browse */}
          <div className="mt-6 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={triggerCameraInput}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs shadow-md shadow-violet-500/20 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Take Photo</span>
            </button>
            <button
              type="button"
              onClick={triggerFileInput}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-muted-foreground/30 hover:bg-muted font-medium text-xs text-foreground transition-all duration-200 cursor-pointer active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Browse File</span>
            </button>
          </div>
          
          <span className="text-[11px] text-muted-foreground/60 mt-5 bg-muted/30 px-3 py-1 rounded-full border border-muted/50">
            Supports PNG, JPG, WEBP up to 10MB
          </span>
        </div>
      ) : (
        <div className="relative group rounded-3xl overflow-hidden border bg-card shadow-lg transition-all duration-300 hover:shadow-xl">
          {/* Top glassmorphic header overlay */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
            <button
              onClick={handleRemove}
              className="p-2 rounded-full bg-background/80 backdrop-blur-md text-muted-foreground hover:text-destructive border shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              title="Remove Image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Styled Image Preview */}
          <div className="relative aspect-[4/3] w-full bg-muted/20 overflow-hidden flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Outfit Preview"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            {/* Soft gradient overlay at the bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>

          {/* Info bar at the bottom */}
          <div className="p-4 border-t flex items-center justify-between bg-muted/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-500">
                <FileImage className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground truncate max-w-[180px]">
                Selected Outfit Image
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={triggerCameraInput}
                className="text-xs font-semibold text-violet-500 hover:text-violet-600 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                Retake
              </button>
              <button
                type="button"
                onClick={triggerFileInput}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline transition-colors cursor-pointer"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

