import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

const uploadRoot = join(process.cwd(), "uploads");

export async function saveKycDocument(file: File, userId: string) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const folder = join(uploadRoot, "kyc", userId);
  const storedName = `${Date.now()}-${randomBytes(8).toString("hex")}-${safeName}`;
  const path = join(folder, storedName);

  await mkdir(folder, { recursive: true });
  await writeFile(path, bytes);

  return {
    path,
    originalName: file.name,
    mimeType: file.type || "application/octet-stream",
  };
}
