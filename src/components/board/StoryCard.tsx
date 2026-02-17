import { Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StoryCardProps {
  title: string;
  subtasks?: number;
  assignee?: string;
  completedSubtasks?: number;
}

export function StoryCard({
  title,
  subtasks,
  assignee,
  completedSubtasks = 0,
}: StoryCardProps) {
  return (
    <Card className="cursor-pointer border transition-shadow hover:shadow-sm">
      <CardContent className="p-4">
        <h4 className="text-sm font-medium leading-snug">{title}</h4>

        {(subtasks !== undefined || assignee) && (
          <div className="mt-3 flex items-center gap-3">
            {subtasks !== undefined && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Layers size={14} />
                {completedSubtasks > 0 && (
                  <span className="text-primary font-medium">
                    {completedSubtasks}/
                  </span>
                )}
                <span>Sub-task {subtasks}</span>
              </div>
            )}

            {assignee && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {assignee.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
