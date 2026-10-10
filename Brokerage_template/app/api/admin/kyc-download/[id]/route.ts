import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type DownloadProps = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: DownloadProps) {
  await requireAdmin();
  const submission = await prisma.kycSubmission.findUnique({ where: { id: params.id } });
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const file = await readFile(submission.documentPath);
  return new NextResponse(file, {
    headers: {
      "Content-Type": submission.mimeType,
      "Content-Disposition": `attachment; filename="${submission.originalName.replaceAll('"', "")}"`,
    },
  });
}
