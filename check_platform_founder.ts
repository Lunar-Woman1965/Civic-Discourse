import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Platform Founder Bluesky Configuration ===\n');
  
  const platformFounder = await prisma.user.findFirst({
    where: { role: 'PLATFORM_FOUNDER' },
    select: {
      email: true,
      atprotoEmail: true,
      atprotoHandle: true,
      atprotoDid: true,
      atprotoBroadcastEnabled: true
    }
  });
  
  if (!platformFounder) {
    console.error('❌ No Platform Founder user found!');
    return;
  }
  
  console.log('BtA Email:', platformFounder.email);
  console.log('Bluesky Email:', platformFounder.atprotoEmail || '(not set)');
  console.log('Bluesky Handle:', platformFounder.atprotoHandle || '(not set)');
  console.log('Bluesky DID:', platformFounder.atprotoDid || '(not set)');
  console.log('Broadcasting Enabled:', platformFounder.atprotoBroadcastEnabled);
  
  console.log('\n--- Authentication Priority ---');
  const identifier = platformFounder.atprotoEmail || platformFounder.atprotoHandle;
  console.log('Will authenticate with:', identifier || '(NO IDENTIFIER AVAILABLE!)');
  
  if (!identifier) {
    console.error('\n❌ ERROR: No Bluesky identifier configured!');
    console.error('Please set either atprotoEmail or atprotoHandle for the Platform Founder.');
  }
  
  await prisma.$disconnect();
}

main();
