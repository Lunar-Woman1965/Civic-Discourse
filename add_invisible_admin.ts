import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const userEmail = 'lmhansen26062@ymail.com';
  
  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: userEmail }
  });
  
  if (!user) {
    console.error(`User ${userEmail} not found!`);
    return;
  }
  
  console.log(`Found user: ${user.name} (${user.email})\n`);
  
  // Find all groups
  const groups = await prisma.group.findMany();
  
  console.log(`Found ${groups.length} groups\n`);
  
  // Add user as hidden admin to each group
  for (const group of groups) {
    console.log(`Processing group: ${group.name}`);
    
    // Check if membership already exists
    const existingMembership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId: group.id
        }
      }
    });
    
    if (existingMembership) {
      // Update existing membership to hidden admin
      await prisma.groupMember.update({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId: group.id
          }
        },
        data: {
          role: 'admin',
          isHidden: true
        }
      });
      console.log(`  ✓ Updated existing membership to hidden admin`);
    } else {
      // Create new hidden admin membership
      await prisma.groupMember.create({
        data: {
          userId: user.id,
          groupId: group.id,
          role: 'admin',
          isHidden: true
        }
      });
      console.log(`  ✓ Created new hidden admin membership`);
    }
  }
  
  console.log(`\n✅ Successfully added ${user.name} as invisible admin to all ${groups.length} groups!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
