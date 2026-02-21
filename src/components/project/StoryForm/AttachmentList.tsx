"use client";

import { Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttachmentListProps {
  attachments: File[];
  onRemove: (index: number) => void;
  onAdd: (files: FileList | null) => void;
}

export function AttachmentList({ attachments, onRemove, onAdd }: AttachmentListProps) {
  return (
    <div>
      <span className="text-sm font-medium">Pièces jointes</span>
      <div className="mt-2 space-y-2">
        {attachments.length > 0 && (
          <div className="space-y-1">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm"
              >
                <Paperclip size={14} className="text-muted-foreground" />
                <span className="flex-1 truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => onAdd(e.target.files)}
          />
          <Button type="button" variant="outline" size="sm" asChild>
            <span>
              <Paperclip size={14} className="mr-1.5" />
              Ajouter un fichier
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
}
