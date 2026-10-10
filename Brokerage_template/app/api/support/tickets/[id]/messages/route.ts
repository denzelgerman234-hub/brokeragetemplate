import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { supportMessageSchema } from "@/lib/validation/support";

export const dynamic = "force-dynamic";

type MessageProps = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: MessageProps) {
  const user = await requireUser();
  const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id } });
  if (!ticket || (ticket.userId !== user.id && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = supportMessageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const message = await prisma.supportMessage.create({
    data: {
      ticketId: ticket.id,
      senderId: user.id,
      body: parsed.data.message,
    },
  });
  await prisma.supportTicket.update({ where: { id: ticket.id }, data: { updatedAt: new Date() } });

  return NextResponse.json({ ok: true, message });
}
