import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function verifyAccount(email: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    });

    if (!user) {
      console.error(`❌ User with email ${normalizedEmail} not found`);
      return;
    }

    if (user.emailVerified) {
      console.log(`✅ User ${normalizedEmail} is already verified`);
      return;
    }

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    console.log(`✅ Successfully verified ${normalizedEmail}`);
    console.log("User can now sign in!");
  } catch (error) {
    console.error("Error verifying account:", error);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];

if (!email) {
  console.error("Usage: yarn tsx scripts/verify-test-account.ts <email>");
  process.exit(1);
}

verifyAccount(email);