import { prisma } from "@meridian/db";

type NotificationType = "TRANSFER_SENT" | "TRANSFER_RECEIVED" | "ACCOUNT_FROZEN" | "ACCOUNT_UNFROZEN";

export async function createNotification(userId: string, type: NotificationType, title: string, body: string) {
  return prisma.notification.create({ data: { userId, type, title, body } });
}
