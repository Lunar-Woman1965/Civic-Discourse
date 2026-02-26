import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function checkEmailConfig() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'lmhansen26062@ymail.com' },
      select: {
        email: true,
        atprotoEmail: true,
        atprotoHandle: true,
        atprotoDid: true,
      },
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n📧 DATABASE CHECK (Real-Time)\n');
    console.log('Bluesky Email in DB:', user.atprotoEmail);
    console.log('Expected:', 'Moon_Woman_Crest@aol.com');
    
    if (user.atprotoEmail === 'Moon_Woman_Crest@aol.com') {
      console.log('\n✅ DATABASE IS CORRECT!');
      console.log('\n🔄 This means the issue is SESSION CACHING.');
      console.log('\n📋 SOLUTION:\n');
      console.log('1. Log out of Bridging the Aisle completely');
      console.log('2. Close all browser tabs');
      console.log('3. Clear browser cache (Ctrl+Shift+Delete)');
      console.log('4. Log back in with: lmhansen26062@ymail.com');
      console.log('5. Try broadcasting again');
      console.log('\nThe fresh login will fetch the correct email from the database.');
    } else {
      console.log('\n❌ DATABASE STILL HAS WRONG EMAIL!');
      console.log('Current DB value:', user.atprotoEmail);
      console.log('\nRunning update again...');
      
      const updated = await prisma.user.update({
        where: { email: 'lmhansen26062@ymail.com' },
        data: { atprotoEmail: 'Moon_Woman_Crest@aol.com' },
      });
      
      console.log('\n✅ Updated to:', updated.atprotoEmail);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmailConfig();
