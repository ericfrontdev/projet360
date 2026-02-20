import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// GET /api/projects/[id]/stories/[storyId] - Get story details with subtasks
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; storyId: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId, storyId } = await params;

  try {
    // Verify project exists and user has access (owner or member)
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projet non trouvé" },
        { status: 404 }
      );
    }

    // Get story with tasks, author and assignee
    const story = await prisma.story.findFirst({
      where: { id: storyId, projectId },
      include: {
        tasks: {
          select: { 
            id: true, 
            taskNumber: true, 
            title: true, 
            status: true,
            assignee: {
              select: { id: true, name: true, email: true },
            },
            comments: {
              select: {
                id: true,
                content: true,
                createdAt: true,
                author: {
                  select: { id: true, name: true, email: true },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { taskNumber: "asc" },
        },
        author: {
          select: { name: true, email: true },
        },
        assignee: {
          select: { name: true, email: true },
        },
      },
    });

    if (!story) {
      return NextResponse.json(
        { error: "Story non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error("Error fetching story:", error);
    return NextResponse.json(
      { error: "Échec de la récupération de la story" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id]/stories/[storyId] - Update story
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; storyId: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId, storyId } = await params;

  try {
    const body = await request.json();
    const { title, description, status, priority, assignee } = body;

    // Verify project exists and user has access (owner or member)
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projet non trouvé" },
        { status: 404 }
      );
    }

    // Verify story exists and belongs to project
    const existingStory = await prisma.story.findFirst({
      where: { id: storyId, projectId },
    });

    if (!existingStory) {
      return NextResponse.json(
        { error: "Story non trouvée" },
        { status: 404 }
      );
    }

    const story = await prisma.story.update({
      where: { id: storyId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(assignee !== undefined && { assigneeId: assignee || null }),
      },
      include: {
        assignee: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(story);
  } catch (error: any) {
    console.error("Error updating story:", error);
    console.error("Error message:", error?.message);
    console.error("Error code:", error?.code);
    return NextResponse.json(
      { error: "Échec de la mise à jour de la story", details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/stories/[storyId] - Delete story
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; storyId: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId, storyId } = await params;

  try {
    // Verify project exists and user has access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: user.id }, { members: { some: { id: user.id } } }],
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projet non trouvé" },
        { status: 404 }
      );
    }

    // Verify story exists and belongs to project
    const existingStory = await prisma.story.findFirst({
      where: { id: storyId, projectId },
    });

    if (!existingStory) {
      return NextResponse.json(
        { error: "Story non trouvée" },
        { status: 404 }
      );
    }

    await prisma.story.delete({
      where: { id: storyId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting story:", error);
    return NextResponse.json(
      { error: "Échec de la suppression de la story" },
      { status: 500 }
    );
  }
}
