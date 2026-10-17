import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { createNotification, notificationTypes } from "@/lib/services/notifications";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const requested = request.nextUrl.searchParams.get("accountType");
  const accountType = requested === "DEMO" || requested === "LIVE" ? requested : undefined;
  return NextResponse.json(
    await prisma.transaction.findMany({
      where: { userId: user.id, ...(accountType ? { accountType } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
  );
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (body.type !== "WITHDRAWAL" || !body.asset || !(Number(body.amount) > 0)) {
    return NextResponse.json({ error: "Invalid withdrawal request" }, { status: 400 });
  }

  const account = await prisma.account.findUnique({
    where: { userId_type: { userId: user.id, type: "LIVE" } },
  });
  if (!account || Number(body.amount) > account.balance - account.marginUsed) {
    return NextResponse.json({ error: "Amount exceeds available Live free margin" }, { status: 400 });
  }

  const destination = typeof body.txHash === "string" ? body.txHash.slice(0, 500) : "";
  const numAmount = Math.abs(Number(body.amount));
  const asset = String(body.asset);

  const transaction = await prisma.$transaction(async (tx: any) => {
    const createdTx = await tx.transaction.create({
      data: {
        userId: user.id,
        accountType: "LIVE",
        type: "WITHDRAWAL",
        asset,
        amount: -numAmount,
        amountUsd: -Math.abs(Number(body.amountUsd ?? body.amount)),
        txHash: destination || null,
        status: "PENDING",
      },
    });

    const paymentRequest = await tx.paymentRequest.create({
      data: {
        userId: user.id,
        kind: "WITHDRAWAL",
        method: asset === "USD" ? "Bank Wire" : `${asset} Crypto Transfer`,
        asset,
        amount: numAmount,
        reference: destination || "No destination specified",
        status: "PENDING",
      },
    });

    // Notify admins
    const admins = await tx.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    for (const admin of admins) {
      await createNotification({
        recipientId: admin.id,
        actorId: user.id,
        type: notificationTypes.paymentRequestSubmitted,
        title: "New withdrawal request",
        body: `${user.firstName} ${user.lastName} requested a withdrawal of $${numAmount.toLocaleString()} (${asset}). Destination: ${destination || "Not supplied"}`,
        metadata: { paymentRequestId: paymentRequest.id, transactionId: createdTx.id, userId: user.id, kind: "WITHDRAWAL", amount: numAmount, asset, href: "/admin/funding" },
      }, tx as any);
    }

    return createdTx;
  });

  return NextResponse.json(transaction, { status: 201 });
}