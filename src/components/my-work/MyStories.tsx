"use client";

import { Layers } from "lucide-react";
import { mockStories } from "@/lib/my-work/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MyStories() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">My Stories</CardTitle>
        <select className="rounded-md border px-2 py-1 text-sm">
          <option>To-Do and In Progress</option>
          <option>All Stories</option>
        </select>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md bg-muted/50 px-3 py-2 text-sm font-medium">
          In Progress
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
            {mockStories.length}
          </span>
        </div>

        {mockStories.map((story) => (
          <div
            key={story.id}
            className="cursor-pointer rounded-md border p-3 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">{story.title}</h4>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Layers size={14} />
                  {story.completedSubtasks > 0 && (
                    <span className="text-primary font-medium">
                      {story.completedSubtasks}/
                    </span>
                  )}
                  <span>Sub-task {story.subtasks}</span>
                </div>
                <div className="flex gap-2">
                  {story.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs font-normal"
                    >
                      {tag}
                    </Badge>
                  ))}
                  <Badge
                    variant="outline"
                    className="bg-yellow-100 text-xs font-normal text-yellow-800"
                  >
                    {story.number}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
