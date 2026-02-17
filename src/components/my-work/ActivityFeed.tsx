"use client";

import { mockActivities, mockUser } from "@/lib/my-work/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ActivityFeed() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">
          My Activity Feed
        </CardTitle>
        <button className="text-muted-foreground hover:text-foreground">
          <span className="sr-only">Settings</span>
          ⚙️
        </button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-4 border-b pb-2 text-sm">
          <button className="border-b-2 border-primary pb-2 font-medium">
            All Activity
          </button>
          <button className="pb-2 text-muted-foreground hover:text-foreground">
            Comments
          </button>
          <button className="pb-2 text-muted-foreground hover:text-foreground">
            Mentions
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-medium text-muted-foreground">Today</div>

          {mockActivities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-medium text-white">
                {mockUser.avatar}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm leading-snug">
                  {activity.content.split(/(Sub-task \d+|test2|Créer le projet de base)/).map((part, i) =>
                    ["Sub-task 3", "Sub-task 2", "test2", "Créer le projet de base"].includes(part) ? (
                      <span key={i} className="font-medium">
                        {part}
                      </span>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
