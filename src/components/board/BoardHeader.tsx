import { ChevronDown, Filter, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function BoardHeader() {
  return (
    <div className="space-y-4">
      {/* Title Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Stories</h1>
          <Button variant="outline" size="sm" className="gap-1">
            <span>All Stories</span>
            <ChevronDown size={14} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <span>Workflow: Standard</span>
            <ChevronDown size={14} />
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Filter size={14} />
            <span>Filters</span>
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2">
            <input type="checkbox" className="h-4 w-4 rounded border-muted" />
            <span>Hide Sub-tasks</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Grid3X3 size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <List size={16} />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Badge variant="secondary" className="font-normal">
            7 Stories
          </Badge>
        </div>
      </div>
    </div>
  );
}
