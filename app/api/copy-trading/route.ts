import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

async function authenticated() {
  const user = await getCurrentUser();
  return user?.status === "ACTIVE" ? user : null;
}

export async function GET() {
  const user = await authenticated();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.copySubscription.findMany({ where: { userId: user.id, status: { not: "REVOKED" } }, orderBy: { startedAt: "desc" } }));
}

export async function POST(request: NextRequest) {
  const user = await authenticated();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body.providerId || !body.providerName || !Number.isFinite(Number(body.amount)) || Number(body.amount) <= 0) return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  const subscription = await prisma.copySubscription.create({ data: { userId: user.id, providerId: body.providerId, providerName: body.providerName, providerHandle: body.providerHandle ?? "", allocatedAmount: Number(body.amount), maxDrawdown: Number(body.maxDrawdown ?? 15) } });
  return NextResponse.json(subscription, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const user = await authenticated();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = await request.json();
  if (!id || !["ACTIVE", "PAUSED"].includes(status)) return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  const result = await prisma.copySubscription.updateMany({ where: { id, userId: user.id }, data: { status } });
  if (!result.count) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const user = await authenticated();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.copySubscription.updateMany({ where: { id, userId: user.id }, data: { status: "REVOKED", closedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
