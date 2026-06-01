"use client";

import { useState } from "react";
import { CheckSquare, Circle, Check, Loader2, MoreHorizontal, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";
import type { ProjectUser } from "@/components/project/kanban/types";

interface SubtaskAssignee {
  id: string;
  name: string | null;
  email: string;
  avatarUrl?: string | null;
}

interface EditTask {
  id: string;
  taskNumber: number;
  title: string;
  status: string;
  assignee?: SubtaskAssignee | null;
}

interface LocalSubtask {
  id: string;
  title: string;
}

interface StorySubtasksProps {
  isEditMode: boolean;
  editTasks: EditTask[];
  localSubtasks: LocalSubtask[];
  projectUsers: ProjectUser[];
  onToggleStatus: (taskId: string, currentStatus: string) => void;
  onAssign: (taskId: string, userId: string | null) => void;
  onDelete: (id: string) => void;
  onAdd: (title: string) => void;
}

export function StorySubtasks({
  isEditMode,
  editTasks,
  localSubtasks,
  projectUsers,
  onToggleStatus,
  onAssign,
  onDelete,
  onAdd,
}: StorySubtasksProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  function handleAdd() {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setNewTitle("");
    setIsAdding(false);
  }

  const tasks = isEditMode ? editTasks : localSubtasks;
  const completedCount = editTasks.filter((t) => t.status === "DONE").length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <CheckSquare className="h-4 w-4" />
          Sous-tâches
          {isEditMode ? (
            <span className="text-muted-foreground">{completedCount}/{editTasks.length}</span>
          ) : localSubtasks.length > 0 && (
            <span className="text-muted-foreground">{localSubtasks.length}</span>
          )}
        </h3>
      </div>

      <div className="space-y-1">
        {/* Edit mode rows */}
        {isEditMode && editTasks.map((task, index) => (
          <div key={task.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 group">
            <span className="text-xs text-muted-foreground font-mono w-6">{index + 1}</span>
            <button type="button" className="flex-shrink-0 cursor-pointer" onClick={() => onToggleStatus(task.id, task.status)}>
              {task.status === "DONE"
                ? <Check className="h-4 w-4 text-emerald-500" />
                : task.status === "IN_PROGRESS"
                ? <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                : <Circle className="h-4 w-4 text-slate-400" />}
            </button>
            <span className={cn("flex-1 text-sm", task.status === "DONE" && "line-through text-muted-foreground")}>
              {task.title}
            </span>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7"
                    title={task.assignee ? `Assigné à ${task.assignee.name || task.assignee.email}` : "Assigner"}>
                    {task.assignee
                      ? <UserAvatar name={task.assignee.name} email={task.assignee.email} avatarUrl={task.assignee.avatarUrl} size="xs" />
                      : <User className="h-3.5 w-3.5" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => onAssign(task.id, null)}>
                    <Circle className="h-4 w-4 mr-2 text-slate-400" />
                    Non assigné
                  </DropdownMenuItem>
                  <Separator className="my-1" />
                  {projectUsers.map((u) => (
                    <DropdownMenuItem key={u.id} onClick={() => onAssign(task.id, u.id)}
                      className={cn(task.assignee?.id === u.id && "bg-accent")}>
                      <UserAvatar name={u.name} email={u.email} avatarUrl={u.avatarUrl} size="xs" className="mr-2" />
                      {u.name || u.email}
                      {task.assignee?.id === u.id && <Check className="h-3 w-3 ml-auto" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-destructive" onClick={() => onDelete(task.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}

        {/* Create mode rows */}
        {!isEditMode && localSubtasks.map((task, index) => (
          <div key={task.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 group">
            <span className="text-xs text-muted-foreground font-mono w-6">{index + 1}</span>
            <Circle className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <span className="flex-1 text-sm">{task.title}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(task.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {tasks.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground italic py-2">Aucune sous-tâche</p>
        )}
      </div>

      {/* Inline add form */}
      {isAdding ? (
        <div className="flex items-center gap-2 p-2">
          <span className="text-xs text-muted-foreground font-mono w-6">{tasks.length + 1}</span>
          <Circle className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <Input
            autoFocus
            placeholder="Nouvelle sous-tâche..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
              if (e.key === "Escape") { setIsAdding(false); setNewTitle(""); }
            }}
            className="flex-1 h-8 text-sm"
          />
          <Button type="button" size="sm" onClick={handleAdd} disabled={!newTitle.trim()}>Ajouter</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => { setIsAdding(false); setNewTitle(""); }}>Annuler</Button>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => setIsAdding(true)}>
          + Sous-tâche
        </Button>
      )}
    </div>
  );
}
