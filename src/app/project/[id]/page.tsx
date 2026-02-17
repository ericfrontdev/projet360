import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DescriptionTab } from "@/components/project/DescriptionTab";
import { BacklogTab } from "@/components/project/BacklogTab";
import { BoardTab } from "@/components/project/BoardTab";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const project = await prisma.project.findFirst({
    where: { id, ownerId: user.id },
    include: {
      stories: {
        include: {
          tasks: {
            select: { id: true, status: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const formattedStories = project.stories.map((story) => ({
    id: story.id,
    title: story.title,
    status: story.status,
    subtasks: story.tasks.length,
    completedSubtasks: story.tasks.filter((t) => t.status === "DONE").length,
  }));

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <Button className="gap-2">
            <Plus size={16} />
            Create Story
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="backlog">Backlog</TabsTrigger>
            <TabsTrigger value="board">Board</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <DescriptionTab
              project={{ name: project.name, description: project.description }}
              stories={formattedStories}
            />
          </TabsContent>

          <TabsContent value="backlog" className="mt-6">
            <BacklogTab stories={formattedStories} />
          </TabsContent>

          <TabsContent value="board" className="mt-6">
            <BoardTab stories={formattedStories} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
