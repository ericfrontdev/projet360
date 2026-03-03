"use client";

import { useRef, useState, useCallback } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  maxSize?: number; // bytes
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Dropzone({
  onFilesAdded,
  maxSize,
  multiple = true,
  disabled,
  className,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback(
    (files: File[]) => {
      const valid = maxSize ? files.filter((f) => f.size <= maxSize) : files;
      if (valid.length > 0) onFilesAdded(valid);
    },
    [onFilesAdded, maxSize]
  );

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-md p-4 text-center transition-colors",
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:border-primary/50",
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        className
      )}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (!disabled) processFiles(Array.from(e.dataTransfer.files));
      }}
      onClick={() => {
        if (!disabled) inputRef.current?.click();
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple={multiple}
        onChange={(e) => {
          processFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      <div className="flex flex-col items-center gap-1 text-muted-foreground">
        <Upload className="h-5 w-5" />
        <p className="text-xs">
          Glisser-déposer ou{" "}
          <span className="text-primary underline">parcourir</span>
        </p>
        {maxSize && (
          <p className="text-xs opacity-60">
            Max {(maxSize / 1024 / 1024).toFixed(0)} Mo par fichier
          </p>
        )}
      </div>
    </div>
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}
