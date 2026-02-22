"use client";

import { useEffect } from "react";
import { CheckSquare } from "lucide-react";
import { useMyWorkStore } from "@/stores/my-work";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function MyChecklists() {
  const { checklistItems, isLoading, fetchMyWork } = useMyWorkStore();

  useEffect(() => {
    fetchMyWork();
  }, [fetchMyWork]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Mes checklists</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-sm text-muted-foreground">
            Chargement...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (checklistItems.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Mes checklists</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <CheckSquare className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-sm font-medium">Aucun item de checklist actif</p>
          <p className="text-xs text-muted-foreground">
            Ajoutez des éléments de checklist à n&apos;importe quelle story.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Mes checklists</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-2 rounded-md border p-2.5"
          >
            <div
              className={cn(
                "mt-0.5 h-3.5 w-3.5 shrink-0 rounded-sm border",
                item.status === "IN_PROGRESS" && "border-primary bg-primary/20",
                item.status === "TODO" && "border-muted-foreground"
              )}
            />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm">{item.title}</p>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="text-xs font-normal">
                  {item.project}
                </Badge>
                <span className="truncate text-xs text-muted-foreground">
                  {item.story}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
