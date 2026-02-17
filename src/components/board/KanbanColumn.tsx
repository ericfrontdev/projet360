import { Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoryCard } from "./StoryCard";

interface Story {
  id: string;
  title: string;
  subtasks?: number;
  completedSubtasks?: number;
  assignee?: string;
}

interface KanbanColumnProps {
  title: string;
  stories: Story[];
  count: number;
}

export function KanbanColumn({ title, stories, count }: KanbanColumnProps) {
  return (
    <div className="flex min-w-[280px] flex-1 flex-col rounded-lg bg-muted/30">
      {/* Column Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
            {count}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Plus size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal size={16} />
          </Button>
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1 space-y-2 p-3 pt-0">
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            title={story.title}
            subtasks={story.subtasks}
            completedSubtasks={story.completedSubtasks}
            assignee={story.assignee}
          />
        ))}
      </div>
    </div>
  );
}
