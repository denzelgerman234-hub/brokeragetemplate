import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const left = 6 + Math.floor(Math.random() * 14);
  const right = 2 + Math.floor(Math.random() * 9);
  const useAddition = Math.random() >= 0.5;
  const minuend = useAddition ? left : Math.max(left, right);
  const subtrahend = useAddition ? right : Math.min(left, right);
  const answer = useAddition ? left + right : minuend - subtrahend;
  const challenge = await prisma.humanChallenge.create({
    data: {
      answer,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  return NextResponse.json({
    id: challenge.id,
    question: useAddition ? `${left} + ${right}` : `${minuend} − ${subtrahend}`,
  });
}
