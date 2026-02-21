"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Story } from "./StoryTable";

interface DeleteStoryDialogProps {
  story: Story | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (storyId: string) => void;
  isDeleting?: boolean;
}

export function DeleteStoryDialog({
  story,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteStoryDialogProps) {
  function handleConfirm() {
    if (!story) return;
    onConfirm(story.id);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Supprimer la story</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer <strong>{story?.title}</strong> ?
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
