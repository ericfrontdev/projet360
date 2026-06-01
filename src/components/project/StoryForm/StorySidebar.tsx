"use client";

import { Clock, Tag, Flag, User, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { LabelSelector } from "@/components/project/LabelSelector";
import { cn, getInitials } from "@/lib/utils";
import type { ProjectUser, Label } from "@/components/project/kanban/types";

const statusOptions = [
  { id: "BACKLOG", label: "Backlog", color: "bg-slate-400" },
  { id: "TODO", label: "À faire", color: "bg-slate-400" },
  { id: "IN_PROGRESS", label: "En cours", color: "bg-blue-500" },
  { id: "IN_REVIEW", label: "En révision", color: "bg-amber-500" },
  { id: "DONE", label: "Terminé", color: "bg-emerald-500" },
];

const typeOptions = [
  { id: "FEATURE", label: "Feature" },
  { id: "FIX", label: "Fix" },
];

const priorityOptions = [
  { id: 0, label: "P0 - Critique", color: "bg-red-500" },
  { id: 1, label: "P1 - Haute", color: "bg-orange-500" },
  { id: 2, label: "P2 - Normale", color: "bg-blue-500" },
  { id: 3, label: "P3 - Basse", color: "bg-gray-400" },
];

interface StorySidebarProps {
  status: string;
  onStatusChange: (s: string) => void;
  type: "FEATURE" | "FIX";
  onTypeChange: (t: "FEATURE" | "FIX") => void;
  isEditMode: boolean;
  priority: number;
  onPriorityChange: (p: number) => void;
  assigneeId: string | null;
  onAssigneeChange: (id: string | null) => void;
  dueDate: Date | null;
  onDueDateChange: (d: Date | null) => void;
  selectedLabels: Label[];
  projectLabels: Label[];
  projectUsers: ProjectUser[];
  isAdmin: boolean;
  projectId: string;
  onToggleLabel: (label: Label) => void;
  onCreateAndToggleLabel: (name: string, color: string) => Promise<void>;
  onDeleteLabel: (id: string) => Promise<void>;
}

export function StorySidebar({
  status,
  onStatusChange,
  type,
  onTypeChange,
  isEditMode,
  priority,
  onPriorityChange,
  assigneeId,
  onAssigneeChange,
  dueDate,
  onDueDateChange,
  selectedLabels,
  projectLabels,
  projectUsers,
  isAdmin,
  projectId,
  onToggleLabel,
  onCreateAndToggleLabel,
  onDeleteLabel,
}: StorySidebarProps) {
  const currentStatus = statusOptions.find((s) => s.id === status);
  const currentType = typeOptions.find((t) => t.id === type);
  const currentPriority = priorityOptions.find((p) => p.id === priority);
  const currentAssignee = projectUsers.find((u) => u.id === assigneeId);

  return (
    <div className="border-t md:border-t-0 md:border-l bg-muted/20 p-4 space-y-4 md:w-72 md:overflow-y-auto">
      {/* Status */}
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          State
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-auto py-1.5 px-2 -ml-2 font-normal">
              <div className={cn("w-2 h-2 rounded-full mr-2", currentStatus?.color)} />
              {currentStatus?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {statusOptions.map((s) => (
              <DropdownMenuItem key={s.id} onClick={() => onStatusChange(s.id)}>
                <div className={cn("w-2 h-2 rounded-full mr-2", s.color)} />
                {s.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Type */}
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <Tag className="h-3 w-3" />
          Type
        </label>
        {isEditMode ? (
          <div className="flex items-center py-1.5 px-2 text-sm text-muted-foreground">
            {currentType?.label}
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-auto py-1.5 px-2 -ml-2 font-normal">
                {currentType?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {typeOptions.map((t) => (
                <DropdownMenuItem key={t.id} onClick={() => onTypeChange(t.id as "FEATURE" | "FIX")}>
                  {t.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Priority */}
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <Flag className="h-3 w-3" />
          Priority
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-auto py-1.5 px-2 -ml-2 font-normal">
              <div className={cn("w-2 h-2 rounded-full mr-2", currentPriority?.color)} />
              {currentPriority?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {priorityOptions.map((p) => (
              <DropdownMenuItem key={p.id} onClick={() => onPriorityChange(p.id)}>
                <div className={cn("w-2 h-2 rounded-full mr-2", p.color)} />
                {p.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator />

      {/* Assigné à */}
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <User className="h-3 w-3" />
          Assigné à
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-auto py-1.5 px-2 -ml-2 font-normal">
              {currentAssignee ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground flex-shrink-0">
                    {getInitials(currentAssignee.name || currentAssignee.email)}
                  </div>
                  <span>{currentAssignee.name || currentAssignee.email}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Personne</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => onAssigneeChange(null)}>
              <span className="text-muted-foreground">Personne</span>
            </DropdownMenuItem>
            {projectUsers.map((u) => (
              <DropdownMenuItem key={u.id} onClick={() => onAssigneeChange(u.id)}>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground flex-shrink-0">
                    {getInitials(u.name || u.email)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">{u.name || u.email}</span>
                    {u.name && <span className="text-xs text-muted-foreground">{u.email}</span>}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Date d'échéance */}
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Date d&apos;échéance
        </label>
        <DatePicker value={dueDate} onChange={onDueDateChange} placeholder="Pas de date" />
      </div>

      <Separator />

      {/* Labels */}
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <Tag className="h-3 w-3" />
          Labels
        </label>
        <LabelSelector
          projectId={projectId}
          selectedLabels={selectedLabels}
          projectLabels={projectLabels}
          onToggle={onToggleLabel}
          onCreateAndToggle={isAdmin ? onCreateAndToggleLabel : undefined}
          onDelete={isAdmin ? onDeleteLabel : undefined}
        />
      </div>
    </div>
  );
}
