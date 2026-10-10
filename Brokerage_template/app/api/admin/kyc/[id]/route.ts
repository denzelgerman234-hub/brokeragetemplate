import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type ReviewProps = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, { params }: ReviewProps) {
  const admin = await requireAdmin();
  const body = (await request.json().catch(() => null)) as { status?: string; notes?: string } | null;
  const status = body?.status === "APPROVED" ? "APPROVED" : body?.status === "REJECTED" ? "REJECTED" : null;

  if (!status) {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }

  const submission = await prisma.kycSubmission.update({
    where: { id: params.id },
    data: {
      status,
      notes: body?.notes ?? "",
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, submission });
}
