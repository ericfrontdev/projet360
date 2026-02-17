import { notFound } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProjectPageClient } from "@/components/project/ProjectPageClient";
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
      <ProjectPageClient
        project={{ id: project.id, name: project.name, description: project.description }}
        stories={formattedStories}
      />
    </MainLayout>
  );
}
