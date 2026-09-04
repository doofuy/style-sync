"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, X, Check, AlertCircle } from "lucide-react";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export default function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize camera stream when modal opens or facingMode changes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setCapturedImage(null);

    const startCamera = async () => {
      // Stop existing tracks before starting new stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API is not supported by your browser.");
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (isMounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Camera access error:", err);
          setError(
            err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
              ? "Camera permission denied. Please allow access in browser settings."
              : err.message || "Failed to access camera."
          );
          setIsLoading(false);
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flip horizontally if front-facing camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(dataUrl);
  };

  const handleConfirm = () => {
    if (!capturedImage) return;

    // Convert base64 dataUrl to File object
    const arr = capturedImage.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const file = new File([u8arr], `camera_photo_${Date.now()}.jpg`, { type: mime });

    onCapture(file);
    handleClose();
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setError(null);
    onClose();
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-md border border-slate-700 bg-slate-900 text-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-slate-800 text-accent">
              <Camera className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-medium uppercase tracking-[0.18em]">Take Photo</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Viewport / Preview */}
        <div className="relative aspect-[4/3] w-full bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-slate-300 max-w-xs flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-red-500/20 text-red-400">
                <AlertCircle className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : capturedImage ? (
            /* Snap Preview */
            <img
              src={capturedImage}
              alt="Captured frame"
              className="w-full h-full object-cover"
            />
          ) : (
            /* Live Stream Video */
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-slate-400 gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-accent" />
                  <span className="text-xs uppercase tracking-wider">Starting camera...</span>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === "user" ? "scale-x-[-1]" : ""
                }`}
              />
            </>
          )}

          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          {!capturedImage ? (
            <>
              {/* Switch Camera Button */}
              <button
                onClick={toggleFacingMode}
                disabled={!!error || isLoading}
                className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-300 hover:text-white p-2.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-all cursor-pointer"
                title="Switch Camera"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Flip</span>
              </button>

              {/* Shutter Button: Ink-filled circular button with terracotta accent ring */}
              <button
                onClick={handleCapture}
                disabled={!!error || isLoading}
                className="w-14 h-14 rounded-full border-2 border-slate-600 bg-slate-950 ring-2 ring-accent hover:ring-4 active:scale-95 flex items-center justify-center shadow-lg transition-all cursor-pointer disabled:opacity-50"
                title="Capture"
              >
                <div className="w-6 h-6 rounded-full bg-white" />
              </button>

              {/* Cancel Button */}
              <button
                onClick={handleClose}
                className="text-xs uppercase tracking-wider font-medium text-slate-400 hover:text-white p-2.5 rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </>
          ) : (
            /* Confirmation Actions */
            <div className="w-full flex items-center justify-between gap-3">
              <button
                onClick={() => setCapturedImage(null)}
                className="flex-1 py-2.5 px-4 rounded border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-medium uppercase tracking-wider transition-all cursor-pointer"
              >
                Retake
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 px-4 rounded bg-accent hover:opacity-90 text-white text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Use Photo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
