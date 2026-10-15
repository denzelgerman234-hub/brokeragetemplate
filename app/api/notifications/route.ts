import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { toNotificationResponse, type NotificationRecord } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

const actorSelect = { id: true, firstName: true, lastName: true, role: true };

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");
  const requestedLimit = Number(url.searchParams.get("limit") ?? "25");
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 25;

  const results = await prisma.notification.findMany({
    where: { recipientId: user.id, dismissedAt: null },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { actor: { select: actorSelect } },
  });

  const hasMore = results.length > limit;
  const notifications = hasMore ? results.slice(0, limit) : results;
  return NextResponse.json({
    notifications: notifications.map((notification: NotificationRecord) => toNotificationResponse(notification)),
    nextCursor: hasMore ? notifications[notifications.length - 1]?.id ?? null : null,
  });
}
