import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@admin.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const existing = await prisma.adminUser.findUnique({ where: { email } });

  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.adminUser.create({
      data: { email, passwordHash }
    });
    console.log(`[seed] Admin criado: ${email}`);
  } else {
    console.log(`[seed] Admin já existe: ${email}`);
  }

  // garante settings singleton
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 }
  });

  console.log("[seed] Settings ok");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });