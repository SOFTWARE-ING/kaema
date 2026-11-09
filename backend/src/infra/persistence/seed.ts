import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!process.env.DATABASE_URL || !email || !password || password.length < 12) {
  throw new Error("Définir DATABASE_URL, ADMIN_EMAIL et ADMIN_PASSWORD (12 caractères minimum) avant de créer le compte administrateur.");
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
try {
  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", passwordHash: await Bun.password.hash(password, { algorithm: "argon2id" }) },
    create: { name: "Administration KAEMA", email, passwordHash: await Bun.password.hash(password, { algorithm: "argon2id" }), role: "ADMIN" },
  });
  console.log(`Compte administrateur prêt : ${email}`);
} finally {
  await prisma.$disconnect();
}
