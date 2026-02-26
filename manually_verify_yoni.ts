import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function manuallyVerify() {
  try {
    const email = 'yoni@kallay.net';
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`\n📧 Found user: ${email}`);
    console.log('Current verification status:', user.emailVerified);

    if (user.emailVerified) {
      console.log('✅ Email already verified!');
      return;
    }

    // Manually verify the email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null
      }
    });

    console.log('\n✅ Email manually verified successfully!');
    console.log('User can now log in at: https://bridgingtheaisle.com/auth/signin');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manuallyVerify();
