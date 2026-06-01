"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { X, Edit3, Loader2, ListChecks, Link2, Paperclip, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ChecklistSection } from "@/components/project/ChecklistSection";
import { StoryDetailSubtasks } from "@/components/project/StoryForm/StoryDetailSubtasks";
import { StoryComments } from "@/components/project/StoryForm/StoryComments";
import { StoryDetailSidebar } from "@/components/project/StoryForm/StoryDetailSidebar";
import { StoryAttachments } from "@/components/project/StoryForm/StoryAttachments";
import { StoryLinks } from "@/components/project/StoryForm/StoryLinks";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { Label, Checklist } from "@/components/project/kanban/types";
import { useProjectStore } from "@/stores/project";
import { sanitizeHtml } from "@/lib/sanitize";

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

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string | null; email: string; avatarUrl?: string | null };
}

interface StoryLink {
  id: string;
  title: string;
  url: string;
}

interface StoryAttachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

interface StoryDetail {
  id: string;
  storyNumber: number;
  title: string;
  description?: string | null;
  status: string;
  type: "FEATURE" | "FIX";
  priority: number;
  createdAt: string;
  tasks: Task[];
  comments: Comment[];
  assignee?: { name: string | null; email: string; avatarUrl?: string | null } | null;
  author?: { name: string | null; email: string; avatarUrl?: string | null } | null;
  dueDate?: string | null;
  labels?: Label[];
  checklists?: Checklist[];
  links?: StoryLink[];
  attachments?: StoryAttachment[];
}

interface StoryDetailDialogProps {
  story: { id: string; storyNumber: number; title: string; type: "FEATURE" | "FIX" } | null;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  scrollToComments?: boolean;
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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function StoryDetailDialog({
  story,
  projectId,
  open,
  onOpenChange,
  onEdit,
  scrollToComments = false,
}: StoryDetailDialogProps) {
  const isAdmin = useProjectStore((s) => s.userRole) !== "MEMBER";
  const syncStorySubtasks = useProjectStore((s) => s.syncStorySubtasks);

  const storyKey = story?.id ? `/api/projects/${projectId}/stories/${story.id}` : null;
  const commentsKey = open && story ? `/api/projects/${projectId}/stories/${story.id}/comments` : null;
  const membersKey = open ? `/api/projects/${projectId}/members` : null;
  const labelsKey = open ? `/api/projects/${projectId}/labels` : null;

  const SWR_OPTS = { revalidateOnFocus: false, revalidateIfStale: false } as const;
  const { data: storyDetail, isLoading, mutate: mutateStory } = useSWR<StoryDetail>(storyKey, fetcher, SWR_OPTS);
  const { data: comments = [], isLoading: isLoadingComments, mutate: mutateComments } = useSWR<Comment[]>(commentsKey, fetcher, SWR_OPTS);
  const { data: projectUsers = [], isLoading: isLoadingUsers } = useSWR<TaskAssignee[]>(membersKey, fetcher, SWR_OPTS);
  const { data: projectLabels = [], mutate: mutateProjectLabels } = useSWR<Label[]>(labelsKey, fetcher, SWR_OPTS);

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [isSavingDescription, setIsSavingDescription] = useState(false);

  const [showChecklist, setShowChecklist] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserAvatarUrl, setCurrentUserAvatarUrl] = useState<string | null>(null);
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if ((storyDetail?.checklists ?? []).length > 0) setShowChecklist(true); }, [storyDetail?.checklists]);
  useEffect(() => { if ((storyDetail?.links ?? []).length > 0) setShowLinks(true); }, [storyDetail?.links]);
  useEffect(() => { if ((storyDetail?.attachments ?? []).length > 0) setShowAttachments(true); }, [storyDetail?.attachments]);

  const subtaskCount = storyDetail?.tasks.length;
  const completedSubtaskCount = storyDetail?.tasks.filter((t) => t.status === "DONE").length;
  useEffect(() => {
    if (!story || subtaskCount === undefined || completedSubtaskCount === undefined) return;
    syncStorySubtasks(story.id, subtaskCount, completedSubtaskCount);
  }, [story?.id, subtaskCount, completedSubtaskCount, syncStorySubtasks]);

  useEffect(() => {
    if (!open || !scrollToComments || isLoadingComments) return;
    const timer = setTimeout(() => { commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
    return () => clearTimeout(timer);
  }, [open, scrollToComments, isLoadingComments]);

  useEffect(() => {
    fetch("/api/users/me").then((r) => r.json()).then((data) => {
      setCurrentUserName(data.name ?? data.email ?? null);
      setCurrentUserAvatarUrl(data.avatarUrl ?? null);
    }).catch(() => {});
  }, []);

  async function handleSaveDescription() {
    if (!storyDetail) return;
    setIsSavingDescription(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/stories/${storyDetail.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: editedDescription }),
      });
      if (response.ok) { mutateStory({ ...storyDetail, description: editedDescription }, false); setIsEditingDescription(false); }
    } finally { setIsSavingDescription(false); }
  }

  async function handleAddSubtask(title: string) {
    if (!storyDetail) return;
    const response = await fetch(`/api/projects/${projectId}/stories/${storyDetail.id}/tasks`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }),
    });
    if (response.ok) {
      const newTask: Task = await response.json();
      mutateStory({ ...storyDetail, tasks: [...storyDetail.tasks, newTask] }, false);
    }
  }

  async function handleToggleTaskStatus(taskId: string, currentStatus: string) {
    if (!storyDetail) return;
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    mutateStory({ ...storyDetail, tasks: storyDetail.tasks.map((t) => t.id === taskId ? { ...t, status: newStatus } : t) }, false);
    try {
      await fetch(`/api/projects/${projectId}/stories/${storyDetail.id}/tasks/${taskId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }),
      });
    } finally { mutateStory(); }
  }

  async function handleAssignTask(taskId: string, userId: string | null) {
    if (!storyDetail) return;
    const assignee = userId ? projectUsers.find((u) => u.id === userId) || null : null;
    mutateStory({ ...storyDetail, tasks: storyDetail.tasks.map((t) => t.id === taskId ? { ...t, assignee: assignee || undefined } : t) }, false);
    try {
      await fetch(`/api/projects/${projectId}/stories/${storyDetail.id}/tasks/${taskId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assigneeId: userId }),
      });
    } finally { mutateStory(); }
  }

  async function handleToggleLabel(label: Label) {
    if (!storyDetail) return;
    const isSelected = storyDetail.labels?.some((l) => l.id === label.id);
    mutateStory({
      ...storyDetail,
      labels: isSelected ? storyDetail.labels?.filter((l) => l.id !== label.id) : [...(storyDetail.labels ?? []), label],
    }, false);
    try {
      await fetch(`/api/projects/${projectId}/stories/${storyDetail.id}/labels`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ labelId: label.id }),
      });
    } finally { mutateStory(); }
  }

  async function handleCreateAndToggleLabel(name: string, color: string) {
    if (!storyDetail) return;
    const res = await fetch(`/api/projects/${projectId}/labels`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, color }),
    });
    if (res.ok) { const newLabel: Label = await res.json(); mutateProjectLabels((prev) => [...(prev ?? []), newLabel], false); await handleToggleLabel(newLabel); }
  }

  async function handleDeleteLabel(labelId: string) {
    mutateProjectLabels((prev) => prev?.filter((l) => l.id !== labelId), false);
    if (storyDetail) mutateStory({ ...storyDetail, labels: storyDetail.labels?.filter((l) => l.id !== labelId) }, false);
    await fetch(`/api/projects/${projectId}/labels/${labelId}`, { method: "DELETE" });
  }

  async function handleToggleChecklist() {
    if (!storyDetail) return;
    if ((storyDetail.checklists ?? []).length > 0) { setShowChecklist((v) => !v); return; }
    const res = await fetch(`/api/projects/${projectId}/stories/${storyDetail.id}/checklists`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}),
    });
    if (res.ok) { const newChecklist: Checklist = await res.json(); mutateStory({ ...storyDetail, checklists: [newChecklist] }, false); setShowChecklist(true); }
  }

  function handleUpdateChecklists(updater: (prev: Checklist[]) => Checklist[]) {
    if (!storyDetail) return;
    mutateStory({ ...storyDetail, checklists: updater(storyDetail.checklists ?? []) }, false);
  }

  async function handleDeleteChecklist(checklistId: string) {
    if (!storyDetail) return;
    mutateStory({ ...storyDetail, checklists: (storyDetail.checklists ?? []).filter((c) => c.id !== checklistId) }, false);
    await fetch(`/api/projects/${projectId}/stories/${storyDetail.id}/checklists/${checklistId}`, { method: "DELETE" });
  }

  async function handleAddLink(title: string, url: string) {
    if (!storyDetail) return;
    const res = await fetch(`/api/projects/${projectId}/stories/${storyDetail.id}/links`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, url }),
    });
    if (res.ok) { const link: StoryLink = await res.json(); mutateStory({ ...storyDetail, links: [...(storyDetail.links ?? []), link] }, false); }
  }

  async function handleDeleteLink(linkId: string) {
    if (!storyDetail) return;
    mutateStory({ ...storyDetail, links: (storyDetail.links ?? []).filter((l) => l.id !== linkId) }, false);
    await fetch(`/api/projects/${projectId}/stories/${storyDetail.id}/links/${linkId}`, { method: "DELETE" });
  }

  async function handleFilesAdded(files: File[]) {
    if (!storyDetail) return;
    setIsUploading(true);
    for (const file of files) {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch(`/api/projects/${projectId}/stories/${storyDetail.id}/attachments`, { method: "POST", body: fd });
      if (res.ok) { const att: StoryAttachment = await res.json(); mutateStory({ ...storyDetail, attachments: [...(storyDetail.attachments ?? []), att] }, false); }
    }
    setIsUploading(false);
  }

  async function handleDeleteAttachment(attachmentId: string) {
    if (!storyDetail) return;
    const next = (storyDetail.attachments ?? []).filter((a) => a.id !== attachmentId);
    mutateStory({ ...storyDetail, attachments: next }, false);
    if (next.length === 0) setShowAttachments(false);
    await fetch(`/api/projects/${projectId}/stories/${storyDetail.id}/attachments/${attachmentId}`, { method: "DELETE" });
  }

  async function handleAssignStory(userId: string | null) {
    if (!storyDetail) return;
    const assignee = userId ? projectUsers.find((u) => u.id === userId) || null : null;
    mutateStory({ ...storyDetail, assignee: assignee ? { name: assignee.name, email: assignee.email } : null }, false);
    try {
      await fetch(`/api/projects/${projectId}/stories/${storyDetail.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assignee: userId }),
      });
    } finally { mutateStory(); }
  }

  async function handleDueDateChange(date: Date | null) {
    if (!storyDetail) return;
    mutateStory({ ...storyDetail, dueDate: date ? date.toISOString() : null }, false);
    try {
      await fetch(`/api/projects/${projectId}/stories/${storyDetail.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dueDate: date ? date.toISOString() : null }),
      });
    } finally { mutateStory(); }
  }

  async function handleSubmitComment(content: string, mentions: string[]) {
    if (!story) return;
    const response = await fetch(`/api/projects/${projectId}/stories/${story.id}/comments`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, mentions }),
    });
    if (response.ok) { const comment = await response.json(); mutateComments((prev) => [...(prev ?? []), comment], false); }
  }

  async function handleDuplicate() {
    if (!storyDetail) return;
    await fetch(`/api/projects/${projectId}/stories`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `${storyDetail.title} (copie)`, description: storyDetail.description, type: storyDetail.type, status: "BACKLOG", priority: storyDetail.priority }),
    });
    onOpenChange(false);
  }

  const displayStory = storyDetail || story;
  if (!displayStory) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none w-full h-full rounded-none md:rounded-lg md:w-[60vw] md:h-[90vh] overflow-hidden flex flex-col p-0 gap-0" showCloseButton={false}>
        {/* Header */}
        <DialogHeader className="px-4 md:px-6 py-4 border-b flex flex-row items-center justify-between">
          <DialogTitle className="sr-only">Détails de la story {displayStory.title}</DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{displayStory.type}-{displayStory.storyNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}><Edit3 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}><X className="h-4 w-4" /></Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto md:overflow-hidden md:flex">
            {/* Main Content */}
            <div className="p-4 md:p-6 space-y-6 md:flex-1 md:overflow-y-auto">
              <h1 className="text-2xl font-semibold">{displayStory.title}</h1>

              {/* Description */}
              <div className="space-y-3">
                {isEditingDescription ? (
                  <div className="space-y-3">
                    <RichTextEditor value={editedDescription} onChange={setEditedDescription} placeholder="Décrivez la story..." variant="borderless" />
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditingDescription(false)} disabled={isSavingDescription}>Annuler</Button>
                      <Button size="sm" onClick={handleSaveDescription} disabled={isSavingDescription}>
                        {isSavingDescription ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Enregistrement...</> : "Enregistrer"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {storyDetail?.description ? (
                      <div className="text-sm text-muted-foreground prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(storyDetail.description) }} />
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Aucune description</p>
                    )}
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => { setEditedDescription(storyDetail?.description || ""); setIsEditingDescription(true); }}>
                      <Edit3 className="h-3 w-3 mr-1" />Modifier la description
                    </Button>
                  </div>
                )}
              </div>

              {/* Checklists */}
              {showChecklist && (storyDetail?.checklists ?? []).length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-6">
                    {(storyDetail?.checklists ?? []).map((checklist) => (
                      <ChecklistSection key={checklist.id} checklist={checklist} projectId={projectId} storyId={storyDetail!.id} onUpdate={handleUpdateChecklists} onDelete={handleDeleteChecklist} />
                    ))}
                  </div>
                </>
              )}

              <Separator />

              {/* Subtasks */}
              <StoryDetailSubtasks
                tasks={storyDetail?.tasks ?? []}
                projectUsers={projectUsers}
                isLoadingUsers={isLoadingUsers}
                onToggleStatus={handleToggleTaskStatus}
                onAssign={handleAssignTask}
                onAdd={handleAddSubtask}
              />

              <Separator />

              {/* Add to Story */}
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Add to Story</h3>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" className={cn("text-xs", showChecklist && "border-primary text-primary")} onClick={handleToggleChecklist} disabled={!storyDetail}>
                    <ListChecks className="h-3 w-3 mr-1" />Checklist
                  </Button>
                  <Button type="button" variant="outline" size="sm" className={cn("text-xs", showLinks && "border-primary text-primary")} onClick={() => { setShowLinks((v) => !v); }} disabled={!storyDetail}>
                    <Link2 className="h-3 w-3 mr-1" />Liens externes
                  </Button>
                  <Button type="button" variant="outline" size="sm" className={cn("text-xs", showAttachments && "border-primary text-primary")} onClick={() => setShowAttachments((v) => !v)} disabled={!storyDetail}>
                    <Paperclip className="h-3 w-3 mr-1" />Pièces jointes
                  </Button>
                </div>
              </div>

              {showAttachments && (
                <StoryAttachments
                  isEditMode={true}
                  attachments={storyDetail?.attachments ?? []}
                  localFiles={[]}
                  isUploading={isUploading}
                  onDeleteAttachment={handleDeleteAttachment}
                  onDeleteLocalFile={() => {}}
                  onFilesAdded={handleFilesAdded}
                />
              )}

              {showLinks && (
                <StoryLinks
                  links={storyDetail?.links ?? []}
                  onDelete={handleDeleteLink}
                  onAdd={handleAddLink}
                />
              )}

              <Separator />

              {/* Comments */}
              <div ref={commentsRef}>
                <StoryComments
                  comments={comments}
                  isLoading={isLoadingComments}
                  projectUsers={projectUsers}
                  currentUserName={currentUserName}
                  currentUserAvatarUrl={currentUserAvatarUrl}
                  onSubmit={handleSubmitComment}
                />
              </div>

              <Separator />

              {/* Activity */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Activité
                </h3>
                <div className="flex items-start gap-3 text-sm">
                  <UserAvatar name={storyDetail?.author?.name} email={storyDetail?.author?.email} avatarUrl={storyDetail?.author?.avatarUrl} size="sm" />
                  <div>
                    <span className="font-medium">{storyDetail?.author?.name || storyDetail?.author?.email}</span>
                    {" "}a créé cette story dans{" "}
                    <Badge variant="secondary" className="text-xs">{getStatusLabel(storyDetail?.status || "BACKLOG")}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{storyDetail?.createdAt && formatDate(storyDetail.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <StoryDetailSidebar
              projectId={projectId}
              displayStory={displayStory}
              status={storyDetail?.status}
              priority={storyDetail?.priority}
              assignee={storyDetail?.assignee}
              author={storyDetail?.author}
              dueDate={storyDetail?.dueDate}
              createdAt={storyDetail?.createdAt}
              labels={storyDetail?.labels ?? []}
              projectUsers={projectUsers}
              projectLabels={projectLabels}
              isAdmin={isAdmin}
              isArchived={storyDetail?.status === "ARCHIVED"}
              onAssign={handleAssignStory}
              onDueDateChange={handleDueDateChange}
              onToggleLabel={handleToggleLabel}
              onCreateAndToggleLabel={handleCreateAndToggleLabel}
              onDeleteLabel={handleDeleteLabel}
              onDuplicate={handleDuplicate}
              onArchive={() => setShowArchiveConfirm(true)}
              onRestore={() => setShowRestoreConfirm(true)}
            />
          </div>
        )}

        {/* Archive Confirmation */}
        <Dialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Archiver cette story ?</DialogTitle>
              <DialogDescription>
                La story <strong>{displayStory?.type}-{displayStory?.storyNumber}</strong> sera archivée. Vous pourrez la restaurer depuis l'onglet "Archivées".
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowArchiveConfirm(false)} disabled={isArchiving}>Annuler</Button>
              <Button variant="destructive" disabled={isArchiving} onClick={async () => {
                if (!story?.id) return;
                setIsArchiving(true);
                try {
                  const response = await fetch(`/api/projects/${projectId}/stories/${story.id}`, {
                    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "ARCHIVED" }),
                  });
                  if (response.ok) { setShowArchiveConfirm(false); onOpenChange(false); mutateStory(); }
                } catch { /* silently fail */ } finally { setIsArchiving(false); }
              }}>
                {isArchiving ? "Archivage..." : "Archiver"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Restore Confirmation */}
        <Dialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Restaurer cette story ?</DialogTitle>
              <DialogDescription>
                La story <strong>{displayStory?.type}-{displayStory?.storyNumber}</strong> sera restaurée dans le backlog.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowRestoreConfirm(false)} disabled={isRestoring}>Annuler</Button>
              <Button disabled={isRestoring} onClick={async () => {
                if (!story?.id) return;
                setIsRestoring(true);
                try {
                  const response = await fetch(`/api/projects/${projectId}/stories/${story.id}`, {
                    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "BACKLOG" }),
                  });
                  if (response.ok) { setShowRestoreConfirm(false); onOpenChange(false); mutateStory(); }
                } catch { /* silently fail */ } finally { setIsRestoring(false); }
              }}>
                {isRestoring ? "Restauration..." : "Restaurer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
