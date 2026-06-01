"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, ListChecks, Link2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label as FormLabel } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { ProjectUser, Label } from "@/components/project/kanban/types";
import { useProjectStore } from "@/stores/project";
import { StorySidebar } from "./StoryForm/StorySidebar";
import { StorySubtasks } from "./StoryForm/StorySubtasks";
import { StoryLinks } from "./StoryForm/StoryLinks";
import { StoryAttachments } from "./StoryForm/StoryAttachments";
import { StoryChecklist } from "./StoryForm/StoryChecklist";

interface CreateStoryDialogProps {
  projectId: string;
  variant?: "button" | "icon";
  onSuccess?: () => void;
  storyId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
}

interface LocalSubtask {
  id: string;
  title: string;
}

interface EditTask {
  id: string;
  taskNumber: number;
  title: string;
  status: string;
  assignee?: { id: string; name: string | null; email: string; avatarUrl?: string | null } | null;
}

interface SavedAttachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

interface StoryLink {
  id: string;
  title: string;
  url: string;
}

export function CreateStoryDialog({
  projectId,
  variant = "button",
  onSuccess,
  storyId,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: CreateStoryDialogProps) {
  const router = useRouter();
  const isEditMode = !!storyId;

  const [openInternal, setOpenInternal] = useState(false);
  const dialogOpen = isEditMode ? (openProp ?? false) : openInternal;
  const setDialogOpen = isEditMode ? (onOpenChangeProp ?? (() => {})) : setOpenInternal;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("BACKLOG");
  const [type, setType] = useState<"FEATURE" | "FIX">("FEATURE");
  const [priority, setPriority] = useState(2);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([]);
  const [originalLabels, setOriginalLabels] = useState<Label[]>([]);

  const [showChecklist, setShowChecklist] = useState(false);
  const [localChecklistItems, setLocalChecklistItems] = useState<ChecklistItem[]>([]);

  const [localSubtasks, setLocalSubtasks] = useState<LocalSubtask[]>([]);
  const [showLinks, setShowLinks] = useState(false);
  const [localLinks, setLocalLinks] = useState<StoryLink[]>([]);
  const [editLinks, setEditLinks] = useState<StoryLink[]>([]);
  const [showAttachments, setShowAttachments] = useState(false);
  const [localFiles, setLocalFiles] = useState<{ id: string; file: File }[]>([]);
  const [editAttachments, setEditAttachments] = useState<SavedAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createAnother, setCreateAnother] = useState(false);

  const { data: editStoryData, isLoading: isLoadingStory, mutate: mutateEditStory } = useSWR<{
    id: string; title: string; description?: string | null; status: string;
    type: "FEATURE" | "FIX"; priority: number; assigneeId?: string | null;
    dueDate?: string | null; labels?: Label[];
    tasks?: EditTask[];
    links?: StoryLink[];
    attachments?: SavedAttachment[];
  }>(
    isEditMode && dialogOpen ? `/api/projects/${projectId}/stories/${storyId}` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateIfStale: false }
  );

  useEffect(() => {
    if (editStoryData && isEditMode) {
      setTitle(editStoryData.title);
      setDescription(editStoryData.description ?? "");
      setStatus(editStoryData.status);
      setType(editStoryData.type);
      setPriority(editStoryData.priority);
      setAssigneeId(editStoryData.assigneeId ?? null);
      setDueDate(editStoryData.dueDate ? new Date(editStoryData.dueDate) : null);
      setSelectedLabels(editStoryData.labels ?? []);
      setOriginalLabels(editStoryData.labels ?? []);
      setEditLinks(editStoryData.links ?? []);
      if ((editStoryData.links ?? []).length > 0) setShowLinks(true);
      setEditAttachments(editStoryData.attachments ?? []);
      if ((editStoryData.attachments ?? []).length > 0) setShowAttachments(true);
    }
  }, [editStoryData, isEditMode]);

  const isAdmin = useProjectStore((s) => s.userRole) !== "MEMBER";

  const { data: projectUsers = [] } = useSWR<ProjectUser[]>(
    dialogOpen ? `/api/projects/${projectId}/members` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateIfStale: false }
  );

  const { data: projectLabels = [], mutate: mutateLabels } = useSWR<Label[]>(
    dialogOpen ? `/api/projects/${projectId}/labels` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateIfStale: false }
  );

  const editTasks: EditTask[] = editStoryData?.tasks ?? [];

  function resetForm() {
    setTitle(""); setDescription(""); setStatus("BACKLOG"); setType("FEATURE");
    setPriority(2); setAssigneeId(null); setDueDate(null);
    setSelectedLabels([]); setOriginalLabels([]);
    setShowChecklist(false); setLocalChecklistItems([]);
    setLocalSubtasks([]);
    setShowLinks(false); setLocalLinks([]); setEditLinks([]);
    setShowAttachments(false); setLocalFiles([]); setEditAttachments([]);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError("Le titre est requis"); return; }
    setIsLoading(true);

    try {
      if (isEditMode && storyId) {
        const res = await fetch(`/api/projects/${projectId}/stories/${storyId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), description: description.trim() || null, status, priority, assignee: assigneeId, dueDate: dueDate?.toISOString() ?? null }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Échec de la mise à jour"); }

        const labelsToSync = [
          ...selectedLabels.filter((l) => !originalLabels.find((ol) => ol.id === l.id)),
          ...originalLabels.filter((ol) => !selectedLabels.find((l) => l.id === ol.id)),
        ];
        await Promise.all(labelsToSync.map((label) =>
          fetch(`/api/projects/${projectId}/stories/${storyId}/labels`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ labelId: label.id }),
          })
        ));

        setDialogOpen(false);
        resetForm();
      } else {
        const response = await fetch(`/api/projects/${projectId}/stories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined, status, type, priority, assigneeId: assigneeId ?? undefined, dueDate: dueDate?.toISOString() ?? undefined, labelIds: selectedLabels.map((l) => l.id) }),
        });
        if (!response.ok) { const d = await response.json(); throw new Error(d.error || "Échec de la création"); }
        const storyData = await response.json();

        for (const subtask of localSubtasks) {
          await fetch(`/api/projects/${projectId}/stories/${storyData.id}/tasks`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: subtask.title }),
          });
        }

        await Promise.all(localLinks.map((link) =>
          fetch(`/api/projects/${projectId}/stories/${storyData.id}/links`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: link.title, url: link.url }),
          })
        ));

        for (const { file } of localFiles) {
          const fd = new FormData();
          fd.append("file", file);
          await fetch(`/api/projects/${projectId}/stories/${storyData.id}/attachments`, { method: "POST", body: fd });
        }

        if (localChecklistItems.length > 0) {
          const clRes = await fetch(`/api/projects/${projectId}/stories/${storyData.id}/checklists`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}),
          });
          if (clRes.ok) {
            const checklist = await clRes.json();
            await Promise.all(localChecklistItems.map((item) =>
              fetch(`/api/projects/${projectId}/stories/${storyData.id}/checklists/${checklist.id}/items`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: item.title, status: item.status }),
              })
            ));
          }
        }

        resetForm();
        if (!createAnother) setDialogOpen(false);
      }

      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleToggleLabel(label: Label) {
    setSelectedLabels((prev) =>
      prev.some((l) => l.id === label.id) ? prev.filter((l) => l.id !== label.id) : [...prev, label]
    );
  }

  async function handleCreateAndToggleLabel(name: string, color: string) {
    const res = await fetch(`/api/projects/${projectId}/labels`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    if (res.ok) {
      const newLabel: Label = await res.json();
      mutateLabels((prev) => [...(prev ?? []), newLabel], false);
      setSelectedLabels((prev) => [...prev, newLabel]);
    }
  }

  async function handleDeleteLabel(labelId: string) {
    mutateLabels((prev) => prev?.filter((l) => l.id !== labelId), false);
    setSelectedLabels((prev) => prev.filter((l) => l.id !== labelId));
    await fetch(`/api/projects/${projectId}/labels/${labelId}`, { method: "DELETE" });
  }

  async function handleToggleSubtaskStatus(taskId: string, currentStatus: string) {
    if (!isEditMode || !storyId) return;
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    mutateEditStory(
      (current) => current ? { ...current, tasks: (current.tasks ?? []).map((t) => t.id === taskId ? { ...t, status: newStatus } : t) } : current,
      false
    );
    await fetch(`/api/projects/${projectId}/stories/${storyId}/tasks/${taskId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  async function handleAssignSubtask(taskId: string, userId: string | null) {
    if (!isEditMode || !storyId) return;
    const user = userId ? projectUsers.find((u) => u.id === userId) ?? null : null;
    const assignee = user ? { id: user.id, name: user.name ?? null, email: user.email, avatarUrl: user.avatarUrl } : null;
    mutateEditStory(
      (current) => current ? { ...current, tasks: (current.tasks ?? []).map((t) => t.id === taskId ? { ...t, assignee } : t) } : current,
      false
    );
    await fetch(`/api/projects/${projectId}/stories/${storyId}/tasks/${taskId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigneeId: userId }),
    });
  }

  async function handleAddSubtask(title: string) {
    if (isEditMode && storyId) {
      const res = await fetch(`/api/projects/${projectId}/stories/${storyId}/tasks`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const task = await res.json();
        mutateEditStory(
          (current) => current ? { ...current, tasks: [...(current.tasks ?? []), task] } : current,
          false
        );
      }
    } else {
      setLocalSubtasks((prev) => [...prev, { id: crypto.randomUUID(), title }]);
    }
  }

  async function handleDeleteSubtask(id: string) {
    if (isEditMode && storyId) {
      mutateEditStory(
        (current) => current ? { ...current, tasks: (current.tasks ?? []).filter((t) => t.id !== id) } : current,
        false
      );
      await fetch(`/api/projects/${projectId}/stories/${storyId}/tasks/${id}`, { method: "DELETE" });
    } else {
      setLocalSubtasks((prev) => prev.filter((s) => s.id !== id));
    }
  }

  async function handleAddLink(linkTitle: string, url: string) {
    if (isEditMode && storyId) {
      const res = await fetch(`/api/projects/${projectId}/stories/${storyId}/links`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: linkTitle, url }),
      });
      if (res.ok) { const link = await res.json(); setEditLinks((prev) => [...prev, link]); }
    } else {
      setLocalLinks((prev) => [...prev, { id: crypto.randomUUID(), title: linkTitle, url }]);
    }
  }

  async function handleDeleteLink(id: string) {
    if (isEditMode && storyId) {
      setEditLinks((prev) => prev.filter((l) => l.id !== id));
      await fetch(`/api/projects/${projectId}/stories/${storyId}/links/${id}`, { method: "DELETE" });
    } else {
      setLocalLinks((prev) => prev.filter((l) => l.id !== id));
    }
  }

  async function handleFilesAdded(files: File[]) {
    if (isEditMode && storyId) {
      setIsUploading(true);
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(`/api/projects/${projectId}/stories/${storyId}/attachments`, { method: "POST", body: fd });
        if (res.ok) { const att = await res.json(); setEditAttachments((prev) => [...prev, att]); }
      }
      setIsUploading(false);
    } else {
      setLocalFiles((prev) => [...prev, ...files.map((file) => ({ id: crypto.randomUUID(), file }))]);
    }
  }

  function handleDeleteLocalFile(id: string) {
    setLocalFiles((prev) => { const next = prev.filter((f) => f.id !== id); if (next.length === 0) setShowAttachments(false); return next; });
  }

  async function handleDeleteAttachment(id: string) {
    if (!isEditMode || !storyId) return;
    setEditAttachments((prev) => { const next = prev.filter((a) => a.id !== id); if (next.length === 0) setShowAttachments(false); return next; });
    await fetch(`/api/projects/${projectId}/stories/${storyId}/attachments/${id}`, { method: "DELETE" });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!isEditMode && (
        <DialogTrigger asChild>
          {variant === "button" ? (
            <Button className="gap-2"><Plus size={16} />Créer une Story</Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-8 w-8"><Plus size={16} /></Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="!max-w-none w-full h-full rounded-none md:rounded-lg md:w-[60vw] md:h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 md:px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            {isEditMode ? "Modifier la Story" : "Créer une Story"}
          </DialogTitle>
        </DialogHeader>

        {isEditMode && isLoadingStory && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        <form onSubmit={handleSubmit} className={cn("flex flex-col flex-1 overflow-hidden", isEditMode && isLoadingStory && "hidden")}>
          <div className="flex-1 overflow-y-auto md:overflow-hidden md:flex">
            {/* Contenu principal */}
            <div className="p-4 md:p-6 space-y-6 md:flex-1 md:overflow-y-auto">
              {/* Titre */}
              <div className="space-y-2">
                <FormLabel htmlFor="title" className="text-sm text-muted-foreground">Titre de la Story</FormLabel>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Entrez le titre de la story..."
                  className="text-lg font-medium border-0 border-b rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-primary"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <FormLabel className="text-sm text-muted-foreground">
                  Description <span className="text-muted-foreground/60">Optionnel</span>
                </FormLabel>
                <RichTextEditor value={description} onChange={setDescription} placeholder="Décrivez la story..." variant="borderless" />
              </div>

              {showChecklist && (
                <StoryChecklist items={localChecklistItems} onItemsChange={setLocalChecklistItems} />
              )}

              <StorySubtasks
                isEditMode={isEditMode}
                editTasks={editTasks}
                localSubtasks={localSubtasks}
                projectUsers={projectUsers}
                onToggleStatus={handleToggleSubtaskStatus}
                onAssign={handleAssignSubtask}
                onDelete={handleDeleteSubtask}
                onAdd={handleAddSubtask}
              />

              {/* Ajouter à la Story */}
              <div className="space-y-3">
                <FormLabel className="text-sm text-muted-foreground">Add to Story</FormLabel>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" className={cn("text-xs", showChecklist && "border-primary text-primary")} onClick={() => setShowChecklist((v) => !v)}>
                    <ListChecks className="h-3 w-3 mr-1" />Checklist
                  </Button>
                  <Button type="button" variant="outline" size="sm" className={cn("text-xs", showLinks && "border-primary text-primary")} onClick={() => setShowLinks((v) => !v)}>
                    <Link2 className="h-3 w-3 mr-1" />Liens externes
                  </Button>
                  <Button type="button" variant="outline" size="sm" className={cn("text-xs", showAttachments && "border-primary text-primary")} onClick={() => setShowAttachments((v) => !v)}>
                    <Paperclip className="h-3 w-3 mr-1" />Pièces jointes
                  </Button>
                </div>
              </div>

              {showAttachments && (
                <StoryAttachments
                  isEditMode={isEditMode}
                  attachments={editAttachments}
                  localFiles={localFiles}
                  isUploading={isUploading}
                  onDeleteAttachment={handleDeleteAttachment}
                  onDeleteLocalFile={handleDeleteLocalFile}
                  onFilesAdded={handleFilesAdded}
                />
              )}

              {showLinks && (
                <StoryLinks
                  links={isEditMode ? editLinks : localLinks}
                  onDelete={handleDeleteLink}
                  onAdd={handleAddLink}
                />
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <StorySidebar
              status={status}
              onStatusChange={setStatus}
              type={type}
              onTypeChange={setType}
              isEditMode={isEditMode}
              priority={priority}
              onPriorityChange={setPriority}
              assigneeId={assigneeId}
              onAssigneeChange={setAssigneeId}
              dueDate={dueDate}
              onDueDateChange={setDueDate}
              selectedLabels={selectedLabels}
              projectLabels={projectLabels}
              projectUsers={projectUsers}
              isAdmin={isAdmin}
              projectId={projectId}
              onToggleLabel={handleToggleLabel}
              onCreateAndToggleLabel={handleCreateAndToggleLabel}
              onDeleteLabel={handleDeleteLabel}
            />
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-background shrink-0">
            <div className="flex items-center justify-between w-full">
              <Button type="button" variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }} disabled={isLoading}>
                Annuler
              </Button>
              <div className="flex items-center gap-3">
                {!isEditMode && (
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input type="checkbox" checked={createAnother} onChange={(e) => setCreateAnother(e.target.checked)} className="rounded border-gray-300" />
                    Créer une autre
                  </label>
                )}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (isEditMode ? "Enregistrement..." : "Création...") : (isEditMode ? "Enregistrer" : "Créer")}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
