import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateHandle() {
  try {
    // Update to use email as the auth identifier instead of handle
    const user = await prisma.user.update({
      where: { email: 'lmhansen26062@ymail.com' },
      data: {
        // Store the Bluesky email for authentication
        // We'll keep atprotoHandle for display purposes
        atprotoHandle: 'bridgingtheaisle.com',
      },
      select: {
        email: true,
        atprotoHandle: true,
        atprotoDid: true,
      },
    });

    console.log('\n✅ Configuration confirmed:');
    console.log('=====================================');
    console.log('BtA Account:      ', user.email);
    console.log('Bluesky Handle:   ', user.atprotoHandle);
    console.log('DID:              ', user.atprotoDid);
    console.log('=====================================\n');

    console.log('💡 Authentication Options:');
    console.log('   Bluesky accepts either:');
    console.log('   1. Handle: bridgingtheaisle.com');
    console.log('   2. Email:  Moon_Woman_Crest@outlook.com\n');

    console.log('🔧 Next Steps:');
    console.log('   We can modify the authentication to try:');
    console.log('   - Using your Bluesky email instead of handle');
    console.log('   - This might resolve the auth issue\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateHandle();
