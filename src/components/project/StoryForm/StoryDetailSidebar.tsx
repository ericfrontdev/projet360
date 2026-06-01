"use client";

import { useState } from "react";
import { Link2, Copy, CopyCheck, MoreHorizontal, Check, GitBranch, Tag, Flag, User, Calendar, Archive, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/user-avatar";
import { DatePicker } from "@/components/ui/date-picker";
import { LabelSelector } from "@/components/project/LabelSelector";
import type { Label } from "@/components/project/kanban/types";

interface Assignee {
  name: string | null;
  email: string;
  avatarUrl?: string | null;
}

interface ProjectUser {
  id: string;
  name: string | null;
  email: string;
  avatarUrl?: string | null;
}

interface StoryDetailSidebarProps {
  projectId: string;
  displayStory: { type: "FEATURE" | "FIX"; storyNumber: number };
  status: string | undefined;
  priority: number | undefined;
  assignee: Assignee | null | undefined;
  author: Assignee | null | undefined;
  dueDate: string | null | undefined;
  createdAt: string | undefined;
  labels: Label[];
  projectUsers: ProjectUser[];
  projectLabels: Label[];
  isAdmin: boolean;
  isArchived: boolean;
  onAssign: (userId: string | null) => void;
  onDueDateChange: (date: Date | null) => void;
  onToggleLabel: (label: Label) => void;
  onCreateAndToggleLabel: (name: string, color: string) => Promise<void>;
  onDeleteLabel: (labelId: string) => Promise<void>;
  onDuplicate: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

function getStatusLabel(status: string) {
  switch (status) {
    case "TODO": return "À faire";
    case "IN_PROGRESS": return "En cours";
    case "IN_REVIEW": return "En révision";
    case "DONE": return "Terminé";
    case "BACKLOG": return "Backlog";
    case "ARCHIVED": return "Archivé";
    default: return status;
  }
}

function getPriorityLabel(priority: number) {
  switch (priority) {
    case 0: return "P0 - Critique";
    case 1: return "P1 - Haute";
    case 2: return "P2 - Normale";
    case 3: return "P3 - Basse";
    default: return `P${priority}`;
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function StoryDetailSidebar({
  projectId,
  displayStory,
  status,
  priority,
  assignee,
  author,
  dueDate,
  createdAt,
  labels,
  projectUsers,
  projectLabels,
  isAdmin,
  isArchived,
  onAssign,
  onDueDateChange,
  onToggleLabel,
  onCreateAndToggleLabel,
  onDeleteLabel,
  onDuplicate,
  onArchive,
  onRestore,
}: StoryDetailSidebarProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(`${displayStory.type}-${displayStory.storyNumber}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border-t md:border-t-0 md:border-l bg-muted/20 p-4 space-y-4 md:w-72 md:overflow-y-auto">
      {/* Story ID */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Story ID</label>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-muted px-2 py-1 rounded text-sm font-mono truncate">
            {displayStory.type}-{displayStory.storyNumber}
          </code>
          <Button variant="ghost" size="icon" className="h-7 w-7" title={copied ? "Copié!" : "Copier"} onClick={handleCopy}>
            {copied ? <CopyCheck className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Dupliquer la story
              </DropdownMenuItem>
              {isArchived ? (
                <DropdownMenuItem onClick={onRestore}>
                  <ArchiveRestore className="h-4 w-4 mr-2" />
                  Restaurer la story
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-destructive" onClick={onArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archiver la story
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Permalink */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Permalink</label>
        <div className="flex items-center gap-2">
          <Link2 className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground truncate flex-1">
            projet360.ca/story/{displayStory.type}-{displayStory.storyNumber}
          </span>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        {/* Status */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            Statut
          </label>
          <Badge variant="outline" className="font-normal">
            {getStatusLabel(status || "BACKLOG")}
          </Badge>
        </div>

        {/* Type */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Tag className="h-3 w-3" />
            Type
          </label>
          <div className="text-sm">{displayStory.type === "FEATURE" ? "Feature" : "Fix"}</div>
        </div>

        {/* Priority */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Flag className="h-3 w-3" />
            Priorité
          </label>
          <div className="text-sm">{getPriorityLabel(priority ?? 2)}</div>
        </div>

        {/* Assignee */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            Assigné à
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-auto py-1.5 px-2 -ml-2 font-normal">
                {assignee ? (
                  <div className="flex items-center gap-2">
                    <UserAvatar name={assignee.name} email={assignee.email} avatarUrl={assignee.avatarUrl} size="xs" />
                    <span className="text-sm">{assignee.name || assignee.email}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">Non assigné</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => onAssign(null)}>
                <span className="text-muted-foreground">Non assigné</span>
                {!assignee && <Check className="h-3 w-3 ml-auto" />}
              </DropdownMenuItem>
              {projectUsers.map((u) => (
                <DropdownMenuItem key={u.id} onClick={() => onAssign(u.id)}>
                  <div className="flex items-center gap-2 flex-1">
                    <UserAvatar name={u.name} email={u.email} avatarUrl={u.avatarUrl} size="xs" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm truncate">{u.name || u.email}</span>
                      {u.name && <span className="text-xs text-muted-foreground truncate">{u.email}</span>}
                    </div>
                  </div>
                  {assignee?.email === u.email && <Check className="h-3 w-3 ml-auto flex-shrink-0" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Labels */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Tag className="h-3 w-3" />
            Labels
          </label>
          <LabelSelector
            projectId={projectId}
            selectedLabels={labels}
            projectLabels={projectLabels}
            onToggle={onToggleLabel}
            onCreateAndToggle={isAdmin ? onCreateAndToggleLabel : undefined}
            onDelete={isAdmin ? onDeleteLabel : undefined}
          />
        </div>

        {/* Due date */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Date d'échéance
          </label>
          <DatePicker
            value={dueDate ? new Date(dueDate) : null}
            onChange={onDueDateChange}
            placeholder="Pas de date"
          />
        </div>

        {/* Requester */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            Demandeur
          </label>
          <div className="text-sm">
            {author ? (
              <div className="flex items-center gap-2">
                <UserAvatar name={author.name} email={author.email} avatarUrl={author.avatarUrl} size="xs" />
                <span>{author.name || author.email}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        </div>

        {/* Created */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Créée le
          </label>
          <div className="text-sm">{createdAt ? formatDate(createdAt) : "-"}</div>
        </div>
      </div>
    </div>
  );
}
