import { prisma } from "@meridian/db";

type NotificationType = "WELCOME" | "TRANSFER_SENT" | "TRANSFER_RECEIVED" | "ACCOUNT_FROZEN" | "ACCOUNT_UNFROZEN";

interface NotificationAction {
  actionLabel?: string;
  actionUrl?: string;
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  action?: NotificationAction
) {
  return prisma.notification.create({
    data: { userId, type, title, body, actionLabel: action?.actionLabel, actionUrl: action?.actionUrl },
  });
}
