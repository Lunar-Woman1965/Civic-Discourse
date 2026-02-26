
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function assignAdminRoles() {
  console.log('🔧 Assigning admin roles...\n');

  try {
    // Update Platform Founder
    const founder = await prisma.user.update({
      where: { email: 'lmhansen26062@ymail.com' },
      data: {
        role: 'PLATFORM_FOUNDER',
        isAdmin: true,
        name: 'Platform Founder'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isAdmin: true
      }
    });
    console.log('✅ Updated Platform Founder:');
    console.log(`   Email: ${founder.email}`);
    console.log(`   Name: ${founder.name}`);
    console.log(`   Role: ${founder.role}`);
    console.log(`   Is Admin: ${founder.isAdmin}\n`);

    // Update Moderator
    const moderator = await prisma.user.update({
      where: { email: 'john@doe.com' },
      data: {
        role: 'MODERATOR',
        isAdmin: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isAdmin: true
      }
    });
    console.log('✅ Updated Moderator:');
    console.log(`   Email: ${moderator.email}`);
    console.log(`   Name: ${moderator.name}`);
    console.log(`   Role: ${moderator.role}`);
    console.log(`   Is Admin: ${moderator.isAdmin}\n`);

    // Set all other users to USER role
    const updatedUsers = await prisma.user.updateMany({
      where: {
        email: {
          notIn: ['lmhansen26062@ymail.com', 'john@doe.com']
        }
      },
      data: {
        role: 'USER'
      }
    });
    console.log(`✅ Updated ${updatedUsers.count} regular users to USER role\n`);

    console.log('✨ Role assignment completed successfully!');
  } catch (error) {
    console.error('❌ Error assigning roles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

assignAdminRoles();
