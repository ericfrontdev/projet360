import { prisma } from "@/lib/prisma";

/**
 * Ensures the user exists in the database with the correct Supabase UUID.
 *
 * Old Kimi-generated code created users with random Prisma UUIDs instead of
 * Supabase auth UUIDs. When such a user logs in, their email already exists in
 * the DB under a different UUID. This function detects the mismatch, migrates
 * all FK references to the Supabase UUID atomically, and returns the correct
 * user record.
 */
export async function ensureUserExists(
  userId: string,
  email: string,
  name?: string
) {
  // Fast path: correct Supabase UUID already exists
  const existingById = await prisma.user.findUnique({ where: { id: userId } });
  if (existingById) return existingById;

  // Slow path: email exists with a different UUID (legacy data from old version)
  const existingByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingByEmail) {
    const oldId = existingByEmail.id;
    // Migrate all FK references from the old UUID to the Supabase UUID
    await prisma.$transaction([
      prisma.projectMember.updateMany({ where: { userId: oldId }, data: { userId } }),
      prisma.project.updateMany({ where: { ownerId: oldId }, data: { ownerId: userId } }),
      prisma.story.updateMany({ where: { authorId: oldId }, data: { authorId: userId } }),
      prisma.story.updateMany({ where: { assigneeId: oldId }, data: { assigneeId: userId } }),
      prisma.task.updateMany({ where: { assigneeId: oldId }, data: { assigneeId: userId } }),
      prisma.comment.updateMany({ where: { authorId: oldId }, data: { authorId: userId } }),
      prisma.taskComment.updateMany({ where: { authorId: oldId }, data: { authorId: userId } }),
      prisma.notification.updateMany({ where: { userId: oldId }, data: { userId } }),
      prisma.invitation.updateMany({ where: { invitedById: oldId }, data: { invitedById: userId } }),
    ]);
    await prisma.user.delete({ where: { id: oldId } });
    return await prisma.user.create({
      data: { id: userId, email, name: name || existingByEmail.name || email.split("@")[0] },
    });
  }

  // User doesn't exist at all: create with Supabase UUID
  return await prisma.user.create({
    data: { id: userId, email, name: name || email.split("@")[0] },
  });
}
