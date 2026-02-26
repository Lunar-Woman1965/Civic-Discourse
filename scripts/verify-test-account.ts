
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function verifyAccount(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      return;
    }

    if (user.emailVerified) {
      console.log(`✅ User ${email} is already verified`);
      return;
    }

    // Manually verify the user
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    console.log(`✅ Successfully verified ${email}`);
    console.log(`User can now sign in!`);
  } catch (error) {
    console.error('Error verifying account:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Usage: yarn tsx scripts/verify-test-account.ts <email>');
  process.exit(1);
}

verifyAccount(email);
