"use client";

import { useState } from "react";
import { CheckSquare, Check, Clock, Circle, User, MoreHorizontal, FileText, FolderOpen, Archive, Loader2 } from "lucide-react";
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

interface TaskAssignee {
  id: string;
  name: string | null;
  email: string;
  avatarUrl?: string | null;
}

interface Task {
  id: string;
  taskNumber: number;
  title: string;
  status: string;
  assignee?: TaskAssignee | null;
}

interface StoryDetailSubtasksProps {
  tasks: Task[];
  projectUsers: TaskAssignee[];
  isLoadingUsers: boolean;
  onToggleStatus: (taskId: string, currentStatus: string) => void;
  onAssign: (taskId: string, userId: string | null) => void;
  onAdd: (title: string) => void;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "DONE": return <Check className="h-4 w-4 text-emerald-500" />;
    case "IN_PROGRESS": return <Clock className="h-4 w-4 text-blue-500" />;
    default: return <Circle className="h-4 w-4 text-slate-400" />;
  }
}

export function StoryDetailSubtasks({
  tasks,
  projectUsers,
  isLoadingUsers,
  onToggleStatus,
  onAssign,
  onAdd,
}: StoryDetailSubtasksProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const completedCount = tasks.filter((t) => t.status === "DONE").length;

  function handleAdd() {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setNewTitle("");
    setIsAdding(false);
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <CheckSquare className="h-4 w-4" />
        Sous-tâches
        <span className="text-muted-foreground">{completedCount}/{tasks.length}</span>
      </h3>

      <div className="space-y-1">
        {tasks.map((task, index) => (
          <div key={task.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 group">
            <span className="text-xs text-muted-foreground font-mono w-6">{index + 1}</span>
            <button className="flex-shrink-0 cursor-pointer" onClick={() => onToggleStatus(task.id, task.status)}>
              {getStatusIcon(task.status)}
            </button>
            <span className={cn("flex-1 text-sm", task.status === "DONE" && "line-through text-muted-foreground")}>
              {task.title}
            </span>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 relative"
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
                  {isLoadingUsers ? (
                    <DropdownMenuItem disabled>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Chargement...
                    </DropdownMenuItem>
                  ) : (
                    projectUsers.map((user) => (
                      <DropdownMenuItem key={user.id} onClick={() => onAssign(task.id, user.id)}
                        className={cn(task.assignee?.id === user.id && "bg-accent")}>
                        <UserAvatar name={user.name} email={user.email} avatarUrl={user.avatarUrl} size="xs" className="mr-2" />
                        {user.name || user.email}
                        {task.assignee?.id === user.id && <Check className="h-3 w-3 ml-auto" />}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    Détacher et convertir en story
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Changer de story parent
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Archive className="h-4 w-4 mr-2" />
                    Détacher et archiver
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}

        {tasks.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground italic py-2">Aucune sous-tâche</p>
        )}
      </div>

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
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") { setIsAdding(false); setNewTitle(""); }
            }}
            className="flex-1 h-8 text-sm"
          />
          <Button size="sm" onClick={handleAdd} disabled={!newTitle.trim()}>Ajouter</Button>
          <Button variant="ghost" size="sm" onClick={() => { setIsAdding(false); setNewTitle(""); }}>Annuler</Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="text-xs" onClick={() => setIsAdding(true)}>
          + Sous-tâche
        </Button>
      )}
    </div>
  );
}
