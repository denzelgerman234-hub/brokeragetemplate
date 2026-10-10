import { createRequire } from "node:module";
import argon2 from "argon2";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("ADMIN_EMAIL and ADMIN_PASSWORD are not set; skipped admin seed.");
    return;
  }

  await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      email: email.toLowerCase(),
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      status: "ACTIVE",
      passwordHash: await argon2.hash(password),
      humanVerifiedAt: new Date(),
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`Seeded admin user: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
