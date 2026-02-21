"use client";

import { MoreHorizontal, Layers, ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface Story {
  id: string;
  storyNumber: number;
  title: string;
  status: string;
  type: "FEATURE" | "FIX";
  priority: number;
  subtasks: number;
  completedSubtasks: number;
  description?: string | null;
  assigneeId?: string | null;
}

interface StoryTableProps {
  stories: Story[];
  title: string;
  showStatus?: boolean;
  selectedStories: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  sortField: "title" | "status" | "subtasks";
  sortDirection: "asc" | "desc";
  onSort: (field: "title" | "status" | "subtasks") => void;
  onMoveToBoard?: (id: string) => void;
  onMoveToBacklog?: (id: string) => void;
  onView?: (story: Story) => void;
  onEdit?: (story: Story) => void;
  onDelete?: (story: Story) => void;
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

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "DONE": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "IN_PROGRESS": return "bg-blue-100 text-blue-800 border-blue-200";
    case "IN_REVIEW": return "bg-amber-100 text-amber-800 border-amber-200";
    case "ARCHIVED": return "bg-gray-100 text-gray-600 border-gray-200 line-through";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function StoryTable({
  stories,
  title,
  showStatus = false,
  selectedStories,
  onToggleSelect,
  onToggleSelectAll,
  sortField,
  sortDirection,
  onSort,
  onMoveToBoard,
  onMoveToBacklog,
  onView,
  onEdit,
  onDelete,
}: StoryTableProps) {
  const allSelected = stories.length > 0 && stories.every((s) => selectedStories.includes(s.id));

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">
          {title}
          <span className="ml-2 text-sm font-normal text-muted-foreground">({stories.length})</span>
        </h3>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full">
          <thead className="bg-muted border-b">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <Checkbox checked={allSelected} onCheckedChange={onToggleSelectAll} />
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton field="title" label="Nom" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
              </th>
              {showStatus && (
                <th className="px-4 py-3 text-left">
                  <SortButton field="status" label="Statut" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                </th>
              )}
              <th className="px-4 py-3 text-left">
                <SortButton field="subtasks" label="Sous-tâches" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
              </th>
              <th className="w-16 px-4 py-3 text-right"></th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {stories.map((story) => (
              <tr key={story.id} className="group cursor-pointer bg-background hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Checkbox checked={selectedStories.includes(story.id)} onCheckedChange={() => onToggleSelect(story.id)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      {story.type}-{story.storyNumber}
                    </span>
                    <span 
                      className="font-medium text-sm underline underline-offset-2 decoration-muted-foreground/30 hover:decoration-foreground cursor-pointer"
                      onClick={() => onView?.(story)}
                    >
                      {story.title}
                    </span>
                  </div>
                </td>
                {showStatus && (
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`${getStatusBadgeClass(story.status)} font-normal`}>
                      {getStatusLabel(story.status)}
                    </Badge>
                  </td>
                )}
                <td className="px-4 py-3">
                  {story.subtasks > 0 ? (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Layers size={14} />
                      <span>{showStatus ? `${story.completedSubtasks}/` : ""}{story.subtasks}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(story)}>Modifier</DropdownMenuItem>
                      {story.status === "BACKLOG" && onMoveToBoard && (
                        <DropdownMenuItem onClick={() => onMoveToBoard(story.id)}>
                          Ajouter au tableau
                        </DropdownMenuItem>
                      )}
                      {story.status !== "BACKLOG" && onMoveToBacklog && (
                        <DropdownMenuItem onClick={() => onMoveToBacklog(story.id)}>
                          Renvoyer au backlog
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDelete?.(story)} className="text-destructive">
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}

            {stories.length === 0 && (
              <tr>
                <td colSpan={showStatus ? 5 : 4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Aucune story
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface SortButtonProps {
  field: "title" | "status" | "subtasks";
  label: string;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: "title" | "status" | "subtasks") => void;
}

function SortButton({ field, label, sortField, sortDirection, onSort }: SortButtonProps) {
  const isActive = sortField === field;
  const icon = isActive ? (sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />) : <ArrowUpDown size={14} className="text-muted-foreground" />;
  return (
    <button onClick={() => onSort(field)} className="flex items-center gap-1 font-semibold text-sm hover:text-foreground">
      {label} {icon}
    </button>
  );
}
