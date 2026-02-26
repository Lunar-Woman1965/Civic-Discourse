import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkConnectionStatus() {
  console.log('\n🔍 Checking Bluesky connection status...\n');
  
  const broadcaster = await prisma.user.findUnique({
    where: { email: 'bta-social.sharing@bridgingtheaisle.com' },
    select: {
      id: true,
      email: true,
      username: true,
      atprotoHandle: true,
      atprotoDid: true,
      blueskyConnectedAt: true,
      blueskyTokenExpiry: true,
      blueskyEncryptedToken: true,
      blueskyEncryptedRefreshToken: true,
    },
  });

  if (!broadcaster) {
    console.log('❌ Broadcaster account not found');
    return;
  }

  console.log('✅ Broadcaster Account Found:');
  console.log(`   Email: ${broadcaster.email}`);
  console.log(`   Username: ${broadcaster.username}`);
  console.log(`   AT Protocol Handle: ${broadcaster.atprotoHandle || 'NOT SET'}`);
  console.log(`   AT Protocol DID: ${broadcaster.atprotoDid || 'NOT SET'}`);
  console.log(`   Connected At: ${broadcaster.blueskyConnectedAt || 'NOT CONNECTED'}`);
  console.log(`   Token Expiry: ${broadcaster.blueskyTokenExpiry || 'NO TOKEN'}`);
  console.log(`   Has Access Token: ${!!broadcaster.blueskyEncryptedToken}`);
  console.log(`   Has Refresh Token: ${!!broadcaster.blueskyEncryptedRefreshToken}`);
  
  if (broadcaster.blueskyTokenExpiry) {
    const now = new Date();
    const expiry = new Date(broadcaster.blueskyTokenExpiry);
    const isExpired = now > expiry;
    console.log(`   Token Status: ${isExpired ? '⚠️ EXPIRED' : '✅ VALID'}`);
  }
  
  await prisma.$disconnect();
}

checkConnectionStatus();
