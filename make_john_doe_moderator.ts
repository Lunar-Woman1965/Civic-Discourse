import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const johnDoeEmail = 'john@doe.com';
  
  // Find John Doe
  const user = await prisma.user.findUnique({
    where: { email: johnDoeEmail },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      bio: true,
      isAdmin: true
    }
  });
  
  if (!user) {
    console.error(`User ${johnDoeEmail} not found!`);
    return;
  }
  
  console.log(`\nCurrent status for ${user.name}:`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Username: ${user.username || 'Not set'}`);
  console.log(`  Is Admin: ${user.isAdmin}`);
  console.log(`  Bio: ${user.bio || 'Not set'}`);
  
  // Update to Platform Moderator
  const updated = await prisma.user.update({
    where: { email: johnDoeEmail },
    data: {
      isAdmin: true,
      bio: '🛡️ Platform Moderator | Here to help guide discussions and ensure civil dialogue | This is an official admin account',
      name: 'John Doe (Platform Moderator)'
    }
  });
  
  console.log(`\n✅ Updated ${updated.name}:`);
  console.log(`  Is Admin: ${updated.isAdmin}`);
  console.log(`  Bio: ${updated.bio}`);
  console.log(`\n✅ John Doe is now clearly identified as a Platform Moderator!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
