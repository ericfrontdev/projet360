import { KanbanBoard } from "@/components/board/KanbanBoard";
import { MainLayout } from "@/components/layout/MainLayout";
import { BoardHeader } from "@/components/board/BoardHeader";

export default function Home() {
  return (
    <MainLayout>
      <div className="h-full space-y-4">
        <BoardHeader />
        <KanbanBoard />
      </div>
    </MainLayout>
  );
}
