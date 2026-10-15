import { NextResponse } from "next/server";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { createSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";
import { createNotification, notificationTypes } from "@/lib/services/notifications";
import { registerSchema } from "@/lib/validation/auth";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const brand = getBrandConfig();
  const phone = parsePhoneNumberFromString(parsed.data.phone);
  if (!phone?.isValid()) {
    return NextResponse.json({ ok: false, errors: { phone: ["Enter a valid phone number including the selected dial code."] } }, { status: 400 });
  }
  if (brand.verification.defaultMethod === "captchaPuzzle") {
    const challenge = await prisma.humanChallenge.findUnique({ where: { id: parsed.data.challengeId } });
    if (!challenge) {
      return NextResponse.json({ ok: false, errors: { challengeAnswer: ["This verification question is no longer available. Refresh the page and solve the new question."] } }, { status: 400 });
    }
    if (challenge.usedAt || challenge.expiresAt < new Date()) {
      return NextResponse.json({ ok: false, errors: { challengeAnswer: ["This verification question has expired. Refresh the page and solve the new question."] } }, { status: 400 });
    }
    if (challenge.answer !== parsed.data.challengeAnswer) {
      return NextResponse.json({ ok: false, errors: { challengeAnswer: ["That math answer is not correct. Please check it and try again."] } }, { status: 400 });
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
      phone: phone.number,
      country: parsed.data.country,
      countryCode: parsed.data.countryCode,
      accountCurrency: parsed.data.accountCurrency,
      localCurrency: parsed.data.localCurrency ?? "USD",
      displayCurrency: parsed.data.displayCurrency,
      preferredLanguage: parsed.data.preferredLanguage,
      dateOfBirth: parsed.data.dateOfBirth,
      passwordHash: await hashPassword(parsed.data.password),
      humanVerifiedAt: brand.verification.defaultMethod === "captchaPuzzle" ? new Date() : null,
      emailVerifiedAt: brand.verification.emailVerificationEnabled ? null : new Date(),
      accounts: { create: [{ type: "LIVE", currency: "USD", balance: 0, equity: 0 }, { type: "DEMO", currency: "USD", balance: 100000, equity: 100000 }] },
    },
  });

  await createNotification({
    recipientId: user.id,
    type: notificationTypes.welcome,
    title: "Welcome to your trading workspace",
    body: "Your Live account is ready and your Demo account has been created.",
    metadata: { href: "/dashboard" },
  });

  await createSession(user.id);

  return NextResponse.json({ ok: true });
}
