import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "lmhansen26062@ymail.com";

  const user = await prisma.user.update({
    where: { email: email.toLowerCase().trim() },
    data: { isAdmin: true },
  });

  console.log(`✅ Successfully made ${user.email} (${user.name}) an admin!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());