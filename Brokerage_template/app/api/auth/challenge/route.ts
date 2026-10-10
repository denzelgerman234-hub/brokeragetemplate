import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const target = 28 + Math.floor(Math.random() * 44);
  const answer = target;
  const challenge = await prisma.humanChallenge.create({
    data: {
      answer,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  return NextResponse.json({
    id: challenge.id,
    target,
  });
}
