import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendVerificationEmail } from './lib/resend';

const prisma = new PrismaClient();

async function resendVerification() {
  try {
    // Check both email variations
    const emails = ['yoni@kallay.com', 'yoni@kallay.net'];
    
    for (const email of emails) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          emailVerified: true,
          verificationToken: true,
          verificationTokenExpiry: true,
          isActive: true,
          isPermanentlyBanned: true
        }
      });

      if (user) {
        console.log(`\n✅ Found user: ${email}`);
        console.log('Current status:', {
          emailVerified: user.emailVerified,
          isActive: user.isActive,
          isPermanentlyBanned: user.isPermanentlyBanned,
          hasToken: !!user.verificationToken
        });

        if (user.isPermanentlyBanned) {
          console.log('❌ User is permanently banned - cannot send verification email');
          return;
        }

        if (user.emailVerified) {
          console.log('✅ Email already verified!');
          return;
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Update user with new token
        await prisma.user.update({
          where: { id: user.id },
          data: {
            verificationToken,
            verificationTokenExpiry
          }
        });

        console.log('\n📧 Sending verification email...');
        
        // Send verification email
        const firstName = email.split('@')[0]; // Extract first name from email
        const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;
        await sendVerificationEmail(email, firstName, verificationUrl);

        console.log('✅ Verification email sent successfully!');
        console.log(`Token expires: ${verificationTokenExpiry.toISOString()}`);
        console.log(`\nVerification link: ${verificationUrl}`);
        return;
      }
    }

    console.log('❌ User not found with either email address');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resendVerification();
