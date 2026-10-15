import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { accountSnapshot } from "@/lib/services/ledger";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  const [accounts, positions, stakes, transactions] = await Promise.all([
    accountSnapshot(user.id),
    prisma.position.findMany({ where: { userId: user.id, status: "OPEN" }, orderBy: { openedAt: "desc" } }),
    prisma.stakingPosition.findMany({ where: { userId: user.id, status: "ACTIVE" }, orderBy: { startedAt: "desc" } }),
    prisma.transaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  return NextResponse.json({ accounts, positions, stakes, transactions });
}
