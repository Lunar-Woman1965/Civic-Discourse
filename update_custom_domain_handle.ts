import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCustomDomainHandle() {
  try {
    // Update Platform Founder with custom domain handle and Bluesky email
    const user = await prisma.user.update({
      where: { email: 'lmhansen26062@ymail.com' },
      data: {
        atprotoHandle: 'bridgingtheaisle.com',
        atprotoEmail: 'Moon_Woman_Crest@outlook.com',
        atprotoDid: 'did:plc:ks4ah2xjalkhtyl7lddwniyd',
        atprotoBroadcastEnabled: true,
      },
      select: {
        email: true,
        atprotoHandle: true,
        atprotoEmail: true,
        atprotoDid: true,
        atprotoBroadcastEnabled: true,
      },
    });

    console.log('\n✅ Successfully updated custom domain handle configuration:');
    console.log('=====================================');
    console.log('BtA Account:       ', user.email);
    console.log('Bluesky Handle:    ', user.atprotoHandle);
    console.log('Bluesky Email:     ', user.atprotoEmail);
    console.log('DID:               ', user.atprotoDid);
    console.log('Broadcasting:      ', user.atprotoBroadcastEnabled);
    console.log('=====================================\n');

    console.log('🔐 Authentication Method:');
    console.log('   The system will now use:', user.atprotoEmail);
    console.log('   This is the email address associated with your Bluesky account\n');

    console.log('📝 Next Steps:');
    console.log('   1. Generate a fresh app password from Moon_Woman_Crest@outlook.com');
    console.log('   2. Go to: https://bsky.app/settings/app-passwords');
    console.log('   3. Delete any old passwords and create a new one');
    console.log('   4. Test broadcasting with the new password\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCustomDomainHandle();
