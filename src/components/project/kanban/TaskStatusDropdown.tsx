"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "./types";
import { taskStatuses } from "./types";

interface TaskStatusDropdownProps {
  currentStatus: TaskStatus;
  onStatusChange: (status: TaskStatus) => void;
  size?: "sm" | "default";
}

export function TaskStatusDropdown({
  currentStatus,
  onStatusChange,
  size = "default",
}: TaskStatusDropdownProps) {
  const [open, setOpen] = useState(false);
  
  const currentStatusConfig = taskStatuses.find((s) => s.id === currentStatus);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={size === "sm" ? "sm" : "default"}
          className={cn(
            "h-auto gap-1.5 px-2 py-1 font-normal cursor-pointer",
            size === "sm" && "text-[10px] py-0.5 px-1.5 h-5"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className={cn(
              "rounded-full",
              size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2",
              currentStatusConfig?.color
            )} 
          />
          <span className={cn(size === "sm" && "hidden sm:inline")}>
            {currentStatusConfig?.title}
          </span>
          <ChevronDown className={cn("opacity-50", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44" onClick={(e) => e.stopPropagation()}>
        {taskStatuses.map((status) => (
          <DropdownMenuItem
            key={status.id}
            className="text-xs flex items-center gap-2 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(status.id);
              setOpen(false);
            }}
          >
            <div className={cn("w-2 h-2 rounded-full", status.color)} />
            <span>{status.title}</span>
            {currentStatus === status.id && (
              <Check className="h-3 w-3 ml-auto" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
