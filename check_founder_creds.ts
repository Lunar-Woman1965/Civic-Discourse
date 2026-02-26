import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const founder = await prisma.user.findFirst({
    where: { role: 'PLATFORM_FOUNDER' },
    select: {
      email: true,
      atprotoEmail: true,
      atprotoHandle: true,
      atprotoDid: true,
      role: true
    }
  });
  
  console.log('\n=== Platform Founder Bluesky Credentials ===');
  console.log('Email:', founder?.email || '(not set)');
  console.log('atprotoEmail:', founder?.atprotoEmail || '(not set)');
  console.log('atprotoHandle:', founder?.atprotoHandle || '(not set)');
  console.log('atprotoDid:', founder?.atprotoDid || '(not set)');
  console.log('role:', founder?.role || '(not set)');
  console.log('==========================================\n');
  
  await prisma.$disconnect();
}

main().catch(console.error);
