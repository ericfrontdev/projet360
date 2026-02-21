import { prisma } from "./prisma";
import { NotificationType } from "@prisma/client";

interface CreateNotificationProps {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  data,
}: CreateNotificationProps) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data || {},
      },
    });
    return { success: true, notification };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error };
  }
}

export async function notifyProjectInvitation(
  userId: string,
  projectName: string,
  invitedByName: string | null
) {
  return createNotification({
    userId,
    type: "PROJECT_INVITATION",
    title: "Invitation à un projet",
    message: `${invitedByName || "Quelqu'un"} vous a invité à rejoindre le projet "${projectName}"`,
    data: { projectName },
  });
}

export async function notifyProjectAdded(
  userId: string,
  projectName: string,
  addedByName: string | null
) {
  return createNotification({
    userId,
    type: "PROJECT_ADDED",
    title: "Ajouté à un projet",
    message: `${addedByName || "Quelqu'un"} vous a ajouté au projet "${projectName}"`,
    data: { projectName },
  });
}
