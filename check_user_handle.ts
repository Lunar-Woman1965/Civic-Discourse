import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserHandle() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'lmhansen26062@ymail.com' },
      select: {
        email: true,
        atprotoHandle: true,
        atprotoDid: true,
        atprotoBroadcastEnabled: true,
      },
    });

    console.log('\n🔍 Database Configuration:');
    console.log('=====================================');
    console.log('BtA Email:        ', user?.email);
    console.log('Stored Handle:    ', user?.atprotoHandle);
    console.log('Stored DID:       ', user?.atprotoDid);
    console.log('Broadcasting:     ', user?.atprotoBroadcastEnabled);
    console.log('=====================================\n');

    console.log('🔐 Authentication Details:');
    console.log('When you broadcast, the system sends to Bluesky:');
    console.log('   Identifier: ' + user?.atprotoHandle);
    console.log('   Password: [Your app password from Moon_Woman_Crest@outlook.com]\n');

    console.log('💡 Bluesky expects:');
    console.log('   Identifier: The handle from the Bluesky account');
    console.log('   Password: App password from that same account\n');

    console.log('❓ Possible Issues:');
    console.log('   1. Handle mismatch - Verify your Bluesky profile shows: @' + user?.atprotoHandle);
    console.log('   2. App password - Must be from Moon_Woman_Crest@outlook.com account');
    console.log('   3. Handle format - Bluesky might need "bridgingtheaisle.com" without "@"\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserHandle();
