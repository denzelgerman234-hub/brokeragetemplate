import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { createNotification, notificationTypes } from "@/lib/services/notifications";

function accrued(stake: any) {
  const seconds = (Date.now() - new Date(stake.lastAccruedAt).getTime()) / 1000;
  return stake.principal * ((stake.baseApy + stake.bonusApy) / 100) * seconds / (365 * 24 * 3600);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const stakes = await prisma.stakingPosition.findMany({ where: { userId: user.id, status: "ACTIVE" } });
  return NextResponse.json(stakes.map((stake: any) => ({ ...stake, liveAccrued: stake.accrued + accrued(stake) })));
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { asset = "USD", amount, baseApy = 5 } = await request.json();
  if (!(Number(amount) > 0)) return NextResponse.json({ error: "Enter a valid staking amount." }, { status: 400 });
  const [account, member] = await Promise.all([
    prisma.account.findUnique({ where: { userId_type: { userId: user.id, type: "LIVE" } } }),
    prisma.user.findUnique({ where: { id: user.id }, include: { membershipPlan: true } }),
  ]);
  if (!account || account.balance < Number(amount)) return NextResponse.json({ error: "Your Live balance is not enough for this stake." }, { status: 400 });
  const stake = await prisma.$transaction(async (tx: any) => {
    await tx.account.update({ where: { id: account.id }, data: { balance: { decrement: Number(amount) }, equity: { decrement: Number(amount) } } });
    await tx.transaction.create({ data: { userId: user.id, type: "STAKING_PRINCIPAL", asset, amount: Number(amount), amountUsd: Number(amount), status: "COMPLETED", txHash: `stake-${Date.now()}` } });
    return tx.stakingPosition.create({ data: { userId: user.id, asset, principal: Number(amount), baseApy: Number(baseApy), bonusApy: member?.membershipPlan?.stakingApyBonus || 0 } });
  });
  return NextResponse.json({ ok: true, stake }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { id, action } = await request.json();
  const stake = await prisma.stakingPosition.findFirst({ where: { id, userId: user.id, status: "ACTIVE" } });
  if (!stake) return NextResponse.json({ error: "This staking position is unavailable." }, { status: 404 });
  const reward = stake.accrued + accrued(stake);
  if (action !== "CLAIM") return NextResponse.json({ error: "That staking action is unavailable." }, { status: 400 });

  await prisma.$transaction(async (tx: any) => {
    await tx.stakingPosition.update({ where: { id }, data: { accrued: 0, lastAccruedAt: new Date() } });
    await tx.account.update({ where: { userId_type: { userId: user.id, type: "LIVE" } }, data: { balance: { increment: reward }, equity: { increment: reward } } });
    await tx.transaction.create({ data: { userId: user.id, type: "STAKING_REWARD", asset: stake.asset, amount: reward, amountUsd: reward, status: "COMPLETED", txHash: `reward-${id}-${Date.now()}` } });
    await createNotification({
      recipientId: user.id,
      type: notificationTypes.stakingRewardClaimed,
      title: "Staking reward claimed",
      body: `${new Intl.NumberFormat("en", { maximumFractionDigits: 4 }).format(reward)} ${stake.asset} has been credited to your Live account.`,
      metadata: { stakingPositionId: id, reward, asset: stake.asset, href: "/dashboard/earn" },
    }, tx);
  });
  return NextResponse.json({ ok: true, reward });
}
