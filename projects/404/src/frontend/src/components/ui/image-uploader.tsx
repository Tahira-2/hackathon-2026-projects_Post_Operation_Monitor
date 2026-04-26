import React, { useRef, useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadImageMutation } from "@/apis/uploadApi";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUploader({ value, onChange, className }: ImageUploaderProps) {
  const [uploadImage, { isLoading }] = useUploadImageMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadImage(formData).unwrap();
      if (res.success && res.data.url) {
        onChange(res.data.url);
      }
    } catch (err) {
      console.error("Failed to upload image", err);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="relative group w-full h-48 overflow-hidden rounded-xl border border-border bg-muted/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded content"
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="text-white font-medium text-sm">Change Image</span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-destructive hover:text-white backdrop-blur rounded-full text-muted-foreground transition-all z-10 shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
          {/* Invisible overlay to trigger file change when the image itself is clicked */}
          <div
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 z-0 cursor-pointer"
          />
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isLoading && inputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden bg-muted/20 hover:bg-muted/50",
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            isLoading && "opacity-70 pointer-events-none"
          )}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="p-3 bg-background rounded-full border shadow-sm">
                <UploadCloud className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Click or drag image to upload</p>
                <p className="text-xs">SVG, PNG, JPG or WEBP (max. 5MB)</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
