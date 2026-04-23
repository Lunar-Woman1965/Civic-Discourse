import { PrismaClient, UserRole } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function assignAdminRoles() {
  console.log("🔧 Assigning admin roles...\n");

  const founderEmail = "lmhansen26062@ymail.com".toLowerCase().trim();
  const moderatorEmail = "john@doe.com".toLowerCase().trim();

  try {
    const founder = await prisma.user.update({
      where: { email: founderEmail },
      data: {
        role: UserRole.PLATFORM_FOUNDER,
        isAdmin: true,
        name: "Platform Founder",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isAdmin: true,
      },
    });

    console.log("✅ Updated Platform Founder:");
    console.log(`   Email: ${founder.email}`);
    console.log(`   Name: ${founder.name}`);
    console.log(`   Role: ${founder.role}`);
    console.log(`   Is Admin: ${founder.isAdmin}\n`);

    const moderator = await prisma.user.update({
      where: { email: moderatorEmail },
      data: {
        role: UserRole.MODERATOR,
        isAdmin: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isAdmin: true,
      },
    });

    console.log("✅ Updated Moderator:");
    console.log(`   Email: ${moderator.email}`);
    console.log(`   Name: ${moderator.name}`);
    console.log(`   Role: ${moderator.role}`);
    console.log(`   Is Admin: ${moderator.isAdmin}\n`);

    const updatedUsers = await prisma.user.updateMany({
      where: {
        email: {
          notIn: [founderEmail, moderatorEmail],
        },
      },
      data: {
        role: UserRole.USER,
      },
    });

    console.log(`✅ Updated ${updatedUsers.count} regular users to USER role\n`);
    console.log("✨ Role assignment completed successfully!");
  } catch (error) {
    console.error("❌ Error assigning roles:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

assignAdminRoles();