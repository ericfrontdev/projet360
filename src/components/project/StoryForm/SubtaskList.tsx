"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";

interface Subtask {
  id: string;
  title: string;
}

interface SubtaskListProps {
  subtasks: Subtask[];
  setSubtasks: (subtasks: Subtask[]) => void;
  storyType: "FEATURE" | "FIX";
}

export function SubtaskList({ subtasks, setSubtasks, storyType }: SubtaskListProps) {
  const [newSubtask, setNewSubtask] = useState("");

  function handleAdd() {
    if (!newSubtask.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `temp-${Date.now()}`, title: newSubtask.trim() },
    ]);
    setNewSubtask("");
  }

  function handleRemove(id: string) {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">
          Sous-tâches{" "}
          <span className="text-muted-foreground">({subtasks.length})</span>
        </span>
      </div>
      <div className="space-y-2">
        {subtasks.map((subtask, index) => (
          <div
            key={subtask.id}
            className="flex items-center gap-2 p-2 bg-muted/50 rounded-md group"
          >
            <GripVertical size={14} className="text-muted-foreground cursor-grab" />
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground font-mono">
                {storyType}-{index + 1}
              </span>
              <span className="text-sm">{subtask.title}</span>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(subtask.id)}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="Ajouter une sous-tâche..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={!newSubtask.trim()}
          >
            Ajouter
          </Button>
        </div>
      </div>
    </div>
  );
}
