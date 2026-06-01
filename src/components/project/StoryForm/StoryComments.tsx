"use client";

import { useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { MentionTextarea, extractMentions } from "@/components/ui/mention-textarea";

interface Author {
  id: string;
  name: string | null;
  email: string;
  avatarUrl?: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
}

interface ProjectUser {
  id: string;
  name: string | null;
  email: string;
  avatarUrl?: string | null;
}

interface StoryCommentsProps {
  comments: Comment[];
  isLoading: boolean;
  projectUsers: ProjectUser[];
  currentUserName: string | null;
  currentUserAvatarUrl: string | null;
  onSubmit: (content: string, mentions: string[]) => Promise<void>;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function StoryComments({
  comments,
  isLoading,
  projectUsers,
  currentUserName,
  currentUserAvatarUrl,
  onSubmit,
}: StoryCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    try {
      const mentions = extractMentions(trimmed, projectUsers);
      await onSubmit(trimmed, mentions);
      setNewComment("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Commentaires
        <span className="text-muted-foreground">({comments.length})</span>
      </h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-2">Aucun commentaire</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <UserAvatar name={comment.author.name} email={comment.author.email} avatarUrl={comment.author.avatarUrl} size="md" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{comment.author.name || comment.author.email}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-start gap-3 pt-2">
        <UserAvatar name={currentUserName} avatarUrl={currentUserAvatarUrl} size="md" />
        <div className="flex-1">
          <MentionTextarea
            placeholder="Ajouter un commentaire... Utilisez @ pour mentionner"
            value={newComment}
            onChange={setNewComment}
            users={projectUsers}
          />
          <div className="flex justify-end mt-2">
            <Button size="sm" className="text-xs" onClick={handleSubmit} disabled={isSubmitting || !newComment.trim()}>
              {isSubmitting ? (
                <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Envoi...</>
              ) : "Commenter"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
