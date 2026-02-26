import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function updateBlueskyEmail() {
  try {
    const result = await prisma.user.update({
      where: { email: 'lmhansen26062@ymail.com' },
      data: {
        atprotoEmail: 'moon_crest_woman@aol.com',
      },
      select: {
        email: true,
        atprotoEmail: true,
        atprotoHandle: true,
        atprotoDid: true,
        atprotoBroadcastEnabled: true,
      },
    });

    console.log('\n✅ CORRECTED TO AOL.COM (FROM SCREENSHOT)\n');
    console.log('Updated Configuration:');
    console.log('  BtA Email:', result.email);
    console.log('  Bluesky Email:', result.atprotoEmail);
    console.log('  Bluesky Handle:', result.atprotoHandle);
    console.log('  Bluesky DID:', result.atprotoDid);
    console.log('  Broadcasting:', result.atprotoBroadcastEnabled ? 'Enabled' : 'Disabled');
    console.log('\n✅ This matches your Bluesky screenshot!');
    console.log('\n🔑 Next Steps:');
    console.log('1. Log out of BtA');
    console.log('2. Clear browser cache');
    console.log('3. Log back into BtA');
    console.log('4. Generate app password from: moon_crest_woman@aol.com');
    console.log('5. Try broadcasting\n');

  } catch (error) {
    console.error('❌ Error updating email:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateBlueskyEmail();
