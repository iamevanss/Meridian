import { Router } from "express";
import { prisma } from "@meridian/db";
import { requireAuth } from "../lib/auth";

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

notificationsRouter.get("/", async (req, res) => {
  const { userId } = (req as any).auth;
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unreadCount = await prisma.notification.count({ where: { userId, read: false } });
  res.json({ notifications, unreadCount });
});

notificationsRouter.post("/:id/read", async (req, res) => {
  const { userId } = (req as any).auth;
  const { id } = req.params;

  const notification = await prisma.notification.findFirst({ where: { id, userId } });
  if (!notification) return res.status(404).json({ error: "Notification not found" });

  await prisma.notification.update({ where: { id }, data: { read: true } });
  res.json({ success: true });
});

notificationsRouter.post("/read-all", async (req, res) => {
  const { userId } = (req as any).auth;
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  res.json({ success: true });
});
