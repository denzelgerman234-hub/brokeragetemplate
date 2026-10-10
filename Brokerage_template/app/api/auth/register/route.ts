import { NextResponse } from "next/server";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { createSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validation/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const brand = getBrandConfig();
  if (brand.verification.defaultMethod === "captchaPuzzle") {
    const challenge = await prisma.humanChallenge.findUnique({ where: { id: parsed.data.challengeId } });
    if (!challenge || challenge.usedAt || challenge.expiresAt < new Date() || challenge.answer !== parsed.data.challengeAnswer) {
      return NextResponse.json({ ok: false, errors: { challengeAnswer: ["Complete the verification puzzle."] } }, { status: 400 });
    }
    await prisma.humanChallenge.update({ where: { id: challenge.id }, data: { usedAt: new Date() } });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ ok: false, errors: { email: ["An account already exists for this email."] } }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email.toLowerCase(),
      passwordHash: await hashPassword(parsed.data.password),
      humanVerifiedAt: brand.verification.defaultMethod === "captchaPuzzle" ? new Date() : null,
      emailVerifiedAt: brand.verification.emailVerificationEnabled ? null : new Date(),
    },
  });

  await createSession(user.id);

  return NextResponse.json({ ok: true });
}
