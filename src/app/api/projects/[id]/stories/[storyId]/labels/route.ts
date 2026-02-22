import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { validateBody } from "@/lib/schemas";

const toggleLabelSchema = z.object({
  labelId: z.string().uuid("ID de label invalide"),
});

// POST /api/projects/[id]/stories/[storyId]/labels — toggle label on story
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; storyId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId, storyId } = await params;

  const { data, response } = await validateBody(request, toggleLabelSchema);
  if (response) return response;

  try {
    const story = await prisma.story.findFirst({
      where: {
        id: storyId,
        projectId,
        project: {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      },
      include: { labels: { select: { id: true } } },
    });

    if (!story) return NextResponse.json({ error: "Story non trouvée" }, { status: 404 });

    const label = await prisma.label.findFirst({
      where: { id: data.labelId, projectId },
    });

    if (!label) return NextResponse.json({ error: "Label non trouvé" }, { status: 404 });

    const isConnected = story.labels.some((l) => l.id === data.labelId);

    const updated = await prisma.story.update({
      where: { id: storyId },
      data: {
        labels: isConnected
          ? { disconnect: { id: data.labelId } }
          : { connect: { id: data.labelId } },
      },
      include: { labels: true },
    });

    return NextResponse.json(updated.labels);
  } catch {
    return NextResponse.json({ error: "Échec de la mise à jour des labels" }, { status: 500 });
  }
}
