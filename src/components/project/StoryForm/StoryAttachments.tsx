"use client";

import { Paperclip, X, FileText, FileImage, File as FileIcon } from "lucide-react";
import { Dropzone, formatFileSize } from "@/components/ui/dropzone";

interface SavedAttachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

interface LocalFile {
  id: string;
  file: File;
}

interface StoryAttachmentsProps {
  isEditMode: boolean;
  attachments: SavedAttachment[];
  localFiles: LocalFile[];
  isUploading: boolean;
  onDeleteAttachment: (id: string) => void;
  onDeleteLocalFile: (id: string) => void;
  onFilesAdded: (files: File[]) => void;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <FileImage className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />;
  if (mimeType === "application/pdf") return <FileText className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />;
  return <FileIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />;
}

export function StoryAttachments({
  isEditMode,
  attachments,
  localFiles,
  isUploading,
  onDeleteAttachment,
  onDeleteLocalFile,
  onFilesAdded,
}: StoryAttachmentsProps) {
  const count = isEditMode ? attachments.length : localFiles.length;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Paperclip className="h-4 w-4" />
        Pièces jointes
        {count > 0 && <span className="text-xs text-muted-foreground font-normal">{count}</span>}
        {isUploading && <span className="text-xs text-muted-foreground animate-pulse">Envoi...</span>}
      </h3>

      <div className="space-y-1">
        {isEditMode
          ? attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/40">
                {getFileIcon(att.mimeType)}
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm truncate hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {att.filename}
                </a>
                <span className="text-xs text-muted-foreground flex-shrink-0">{formatFileSize(att.size)}</span>
                <button
                  type="button"
                  onClick={() => onDeleteAttachment(att.id)}
                  className="text-muted-foreground hover:text-destructive cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          : localFiles.map(({ id, file }) => (
              <div key={id} className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/40">
                {getFileIcon(file.type)}
                <span className="flex-1 text-sm truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">{formatFileSize(file.size)}</span>
                <button
                  type="button"
                  onClick={() => onDeleteLocalFile(id)}
                  className="text-muted-foreground hover:text-destructive cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
      </div>

      <Dropzone onFilesAdded={onFilesAdded} maxSize={10 * 1024 * 1024} disabled={isUploading} />
    </div>
  );
}
