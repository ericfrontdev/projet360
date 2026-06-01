"use client";

import { useState } from "react";
import { Link2, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StoryLink {
  id: string;
  title: string;
  url: string;
}

interface StoryLinksProps {
  links: StoryLink[];
  onDelete: (id: string) => void;
  onAdd: (title: string, url: string) => void;
}

export function StoryLinks({ links, onDelete, onAdd }: StoryLinksProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");

  function handleAdd() {
    if (!newTitle.trim() || !newUrl.trim()) return;
    onAdd(newTitle.trim(), newUrl.trim());
    setNewTitle("");
    setNewUrl("");
    setIsAdding(false);
  }

  function handleCancel() {
    setIsAdding(false);
    setNewTitle("");
    setNewUrl("");
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Link2 className="h-4 w-4" />
        Liens externes
        {links.length > 0 && (
          <span className="text-xs text-muted-foreground font-normal">{links.length}</span>
        )}
      </h3>

      <div className="space-y-1">
        {links.map((link) => (
          <div key={link.id} className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/40 group">
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-sm text-primary hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {link.title}
            </a>
            <button
              type="button"
              onClick={() => onDelete(link.id)}
              className="text-muted-foreground hover:text-destructive cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className="space-y-2 pl-1">
          <Input
            autoFocus
            placeholder="Titre du lien..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") handleCancel(); }}
            className="h-8 text-sm"
          />
          <Input
            placeholder="https://..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
              if (e.key === "Escape") handleCancel();
            }}
            className="h-8 text-sm"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              className="h-7 text-xs"
              disabled={!newTitle.trim() || !newUrl.trim()}
              onClick={handleAdd}
            >
              Ajouter
            </Button>
            <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={handleCancel}>
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={() => setIsAdding(true)}
        >
          + Ajouter un lien
        </Button>
      )}
    </div>
  );
}
