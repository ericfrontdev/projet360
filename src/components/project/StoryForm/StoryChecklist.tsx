"use client";

import { useState } from "react";
import { ListChecks, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
}

interface StoryChecklistProps {
  items: ChecklistItem[];
  onItemsChange: (items: ChecklistItem[]) => void;
}

export function StoryChecklist({ items, onItemsChange }: StoryChecklistProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  function handleAdd() {
    if (!newTitle.trim()) return;
    onItemsChange([...items, { id: crypto.randomUUID(), title: newTitle.trim(), status: "TODO" }]);
    setNewTitle("");
  }

  function handleToggle(id: string) {
    onItemsChange(
      items.map((i) =>
        i.id === id
          ? { ...i, status: i.status === "TODO" ? "IN_PROGRESS" : i.status === "IN_PROGRESS" ? "DONE" : "TODO" }
          : i
      )
    );
  }

  function handleDelete(id: string) {
    onItemsChange(items.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <ListChecks className="h-4 w-4" />
        Checklist
        <span className="text-xs text-muted-foreground font-normal">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </h3>

      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-muted/40">
            <Checkbox
              checked={item.status === "DONE" ? true : item.status === "IN_PROGRESS" ? "indeterminate" : false}
              onCheckedChange={() => handleToggle(item.id)}
            />
            <span className={cn("flex-1 text-sm", item.status === "DONE" && "line-through text-muted-foreground")}>
              {item.title}
            </span>
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              className="text-muted-foreground hover:text-destructive"
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
            placeholder="Nouvel item..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newTitle.trim()) { handleAdd(); }
              if (e.key === "Escape") { setIsAdding(false); setNewTitle(""); }
            }}
            className="h-8 text-sm"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              className="h-7 text-xs"
              disabled={!newTitle.trim()}
              onClick={() => { handleAdd(); }}
            >
              Créer
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => { setIsAdding(false); setNewTitle(""); }}
            >
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
          + Ajouter un item
        </Button>
      )}
    </div>
  );
}
