"use client";

import { useState, useMemo, useEffect } from "react";
import { useKanbanStore } from "@/stores/kanban";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import { StoryDetailDialog } from "./StoryDetailDialog";
import { KanbanColumn } from "./kanban/KanbanColumn";
import { StoryCardOverlay } from "./kanban/StoryCardOverlay";
import type { Story, Task, ProjectUser } from "./kanban/types";
import { columns } from "./kanban/types";

interface BoardTabProps {
  stories: Story[];
  projectId: string;
  onStoryStatusChange?: (storyId: string, newStatus: string) => void;
  onStoryPriorityChange?: (storyId: string, newPriority: number) => void;
  onStoryAssigneeChange?: (storyId: string, assigneeId: string | null, assignee?: { name: string | null; email: string } | null) => void;
}

export function BoardTab({ 
  stories, 
  projectId, 
  onStoryStatusChange,
  onStoryPriorityChange,
  onStoryAssigneeChange,
}: BoardTabProps) {
  const setCurrentProjectId = useKanbanStore((state) => state.setCurrentProjectId);
  
  // Set projectId in store for child components
  useEffect(() => {
    setCurrentProjectId(projectId);
    return () => setCurrentProjectId(null);
  }, [projectId, setCurrentProjectId]);
  
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());
  const [storyTasks, setStoryTasks] = useState<Record<string, Task[]>>({});
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);

  // Fetch project users on mount
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch(`/api/projects/${projectId}/members`);
        if (response.ok) {
          const data = await response.json();
          setProjectUsers(data);
        }
      } catch (error) {
        console.error("Error fetching project users:", error);
      }
    }
    fetchUsers();
  }, [projectId]);

  // Preload all subtasks in background when component mounts
  useEffect(() => {
    async function preloadSubtasks() {
      // Only preload stories that have subtasks and haven't been loaded yet
      const storiesToLoad = stories.filter(
        (s) => s.subtasks > 0 && !storyTasks[s.id]
      );
      
      if (storiesToLoad.length === 0) return;

      // Load all subtasks in parallel
      await Promise.all(
        storiesToLoad.map(async (story) => {
          try {
            const response = await fetch(`/api/projects/${projectId}/stories/${story.id}`);
            if (response.ok) {
              const data = await response.json();
              setStoryTasks((prev) => ({ ...prev, [story.id]: data.tasks || [] }));
            }
          } catch (error) {
            console.error(`Error preloading tasks for story ${story.id}:`, error);
          }
        })
      );
    }

    preloadSubtasks();
  }, [projectId, stories]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor)
  );

  const activeStory = useMemo(
    () => stories.find((s) => s.id === activeId),
    [activeId, stories]
  );

  async function toggleSubtasks(storyId: string) {
    const isExpanded = expandedStories.has(storyId);
    
    if (isExpanded) {
      setExpandedStories((prev) => {
        const next = new Set(prev);
        next.delete(storyId);
        return next;
      });
    } else {
      if (!storyTasks[storyId]) {
        setLoadingTasks((prev) => new Set(prev).add(storyId));
        try {
          const response = await fetch(`/api/projects/${projectId}/stories/${storyId}`);
          if (response.ok) {
            const data = await response.json();
            setStoryTasks((prev) => ({ ...prev, [storyId]: data.tasks || [] }));
          }
        } catch (error) {
          console.error("Error fetching tasks:", error);
        } finally {
          setLoadingTasks((prev) => {
            const next = new Set(prev);
            next.delete(storyId);
            return next;
          });
        }
      }
      setExpandedStories((prev) => new Set(prev).add(storyId));
    }
  }

  async function handlePriorityChange(storyId: string, newPriority: number) {
    // Optimistic update
    onStoryPriorityChange?.(storyId, newPriority);
    
    try {
      const response = await fetch(`/api/projects/${projectId}/stories/${storyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (!response.ok) {
        console.error("Failed to update priority");
      }
    } catch (error) {
      console.error("Error updating priority:", error);
    }
  }

  async function handleAssigneeChange(storyId: string, assigneeId: string | null, assignSubtasks: boolean) {
    // Find assignee info from project users for optimistic update
    const user = assigneeId 
      ? projectUsers.find((u) => u.id === assigneeId) 
      : null;
    
    const assignee = user 
      ? { name: user.name, email: user.email }
      : null;
    
    // Optimistic update for story
    onStoryAssigneeChange?.(storyId, assigneeId, assignee);
    
    // If assignSubtasks is true and we have subtasks loaded, update them too
    if (assignSubtasks && storyTasks[storyId]?.length > 0) {
      const tasksToUpdate = storyTasks[storyId];
      
      // Optimistic update for all subtasks
      setStoryTasks((prev) => ({
        ...prev,
        [storyId]: prev[storyId]?.map((task) =>
          ({ ...task, assignee: assignee || null })
        ) || [],
      }));
      
      // Update all subtasks on the server
      try {
        await Promise.all(
          tasksToUpdate.map(async (task) => {
            await fetch(`/api/projects/${projectId}/stories/${storyId}/tasks/${task.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ assigneeId }),
            });
          })
        );
      } catch (error) {
        console.error("Error updating subtasks assignee:", error);
      }
    }
    
    try {
      const response = await fetch(`/api/projects/${projectId}/stories/${storyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignee: assigneeId }),
      });
      if (response.ok) {
        // Update with server response to ensure data consistency
        const updatedStory = await response.json();
        if (updatedStory.assignee) {
          onStoryAssigneeChange?.(storyId, assigneeId, updatedStory.assignee);
        }
      } else {
        console.error("Failed to update assignee");
      }
    } catch (error) {
      console.error("Error updating assignee:", error);
    }
  }

  async function handleTaskAssigneeChange(storyId: string, taskId: string, assigneeId: string | null, assignee?: { name: string | null; email: string } | null) {
    // Update local state
    setStoryTasks((prev) => ({
      ...prev,
      [storyId]: prev[storyId]?.map((task) =>
        task.id === taskId ? { ...task, assignee: assignee || null } : task
      ) || [],
    }));

    try {
      const response = await fetch(`/api/projects/${projectId}/stories/${storyId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigneeId }),
      });
      if (!response.ok) {
        console.error("Failed to update task assignee");
      }
    } catch (error) {
      console.error("Error updating task assignee:", error);
    }
  }

  async function handleTaskStatusChange(storyId: string, taskId: string, status: "TODO" | "DONE") {
    // Update local state
    setStoryTasks((prev) => ({
      ...prev,
      [storyId]: prev[storyId]?.map((task) =>
        task.id === taskId ? { ...task, status } : task
      ) || [],
    }));

    try {
      const response = await fetch(`/api/projects/${projectId}/stories/${storyId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        console.error("Failed to update task status");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeStory = stories.find((s) => s.id === active.id);
    if (!activeStory) return;

    const overId = over.id as string;
    const column = columns.find((c) => c.id === overId);
    
    if (column && activeStory.status !== column.id) {
      onStoryStatusChange?.(active.id as string, column.id);
      return;
    }

    const overStory = stories.find((s) => s.id === overId);
    if (overStory && activeStory.status !== overStory.status) {
      onStoryStatusChange?.(active.id as string, overStory.status);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active } = event;
    setActiveId(null);

    const story = stories.find((s) => s.id === active.id);
    if (!story) return;

    try {
      await fetch(`/api/projects/${projectId}/stories/${story.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: story.status }),
      });
    } catch (error) {
      console.error("Error moving story:", error);
    }
  }

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0.5" } },
    }),
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              stories={stories.filter((s) => s.status === column.id)}
              onStoryClick={setSelectedStory}
              expandedStories={expandedStories}
              storyTasks={storyTasks}
              loadingTasks={loadingTasks}
              onToggleSubtasks={toggleSubtasks}
              onPriorityChange={handlePriorityChange}
              onAssigneeChange={handleAssigneeChange}
              projectUsers={projectUsers}
              onTaskAssigneeChange={handleTaskAssigneeChange}
              onTaskStatusChange={handleTaskStatusChange}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeStory ? <StoryCardOverlay story={activeStory} /> : null}
        </DragOverlay>
      </DndContext>

      <StoryDetailDialog
        story={selectedStory}
        projectId={projectId}
        open={!!selectedStory}
        onOpenChange={(open) => !open && setSelectedStory(null)}
      />
    </>
  );
}
