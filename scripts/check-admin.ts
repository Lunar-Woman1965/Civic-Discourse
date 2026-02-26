import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: {
      isAdmin: true
    },
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true
    }
  });

  console.log('Current admin users:');
  console.log(admins);

  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true
    }
  });

  console.log('\nAll users:');
  console.log(allUsers);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
