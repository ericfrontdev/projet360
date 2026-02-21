"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Story } from "./StoryTable";

interface EditStoryDialogProps {
  story: Story | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (storyId: string, data: { title: string; description: string; status: string }) => void;
  isSaving?: boolean;
}

export function EditStoryDialog({
  story,
  open,
  onOpenChange,
  onSave,
  isSaving = false,
}: EditStoryDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (story) {
      setTitle(story.title);
      setDescription(story.description || "");
      setStatus(story.status);
    }
  }, [story]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!story || !title.trim()) return;
    onSave(story.id, { title: title.trim(), description: description.trim(), status });
  }

  if (!story) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier la story</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Titre *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la story"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Description de la story"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Statut</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="edit-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BACKLOG">Backlog</SelectItem>
                <SelectItem value="TODO">À faire</SelectItem>
                <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                <SelectItem value="IN_REVIEW">En révision</SelectItem>
                <SelectItem value="DONE">Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSaving || !title.trim()}>
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
