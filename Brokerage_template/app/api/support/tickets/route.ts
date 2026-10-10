import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { supportTicketSchema } from "@/lib/validation/support";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  const where = user.role === "ADMIN" ? {} : { userId: user.id };
  const tickets = await prisma.supportTicket.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } }, user: true },
  });

  return NextResponse.json({ tickets });
}

export async function POST(request: Request) {
  const user = await requireUser();
  const parsed = supportTicketSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: user.id,
      subject: parsed.data.subject,
      messages: {
        create: {
          senderId: user.id,
          body: parsed.data.message,
        },
      },
    },
    include: { messages: true },
  });

  return NextResponse.json({ ok: true, ticket });
}
