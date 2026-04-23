import { PrismaClient, UserRole } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const johnDoeEmail = 'john@doe.com';

  const user = await prisma.user.findUnique({
    where: { email: johnDoeEmail },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      bio: true,
      role: true,
      isAdmin: true,
      isFounder: true,
    },
  });

  if (!user) {
    console.error(`User ${johnDoeEmail} not found!`);
    return;
  }

  console.log(`\nCurrent status for ${user.name ?? 'Unknown User'}:`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Username: ${user.username || 'Not set'}`);
  console.log(`  Role: ${user.role}`);
  console.log(`  Is Admin: ${user.isAdmin}`);
  console.log(`  Is Founder: ${user.isFounder}`);
  console.log(`  Bio: ${user.bio || 'Not set'}`);

  const updated = await prisma.user.update({
    where: { email: johnDoeEmail },
    data: {
      role: UserRole.MODERATOR,
      isAdmin: false,
      isFounder: false,
      bio: '🛡️ Platform Moderator | Here to help guide discussions and ensure civil dialogue',
      name: 'John Doe (Platform Moderator)',
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      bio: true,
      role: true,
      isAdmin: true,
      isFounder: true,
    },
  });

  console.log(`\n✅ Updated ${updated.name}:`);
  console.log(`  Email: ${updated.email}`);
  console.log(`  Username: ${updated.username || 'Not set'}`);
  console.log(`  Role: ${updated.role}`);
  console.log(`  Is Admin: ${updated.isAdmin}`);
  console.log(`  Is Founder: ${updated.isFounder}`);
  console.log(`  Bio: ${updated.bio || 'Not set'}`);
  console.log(`\n✅ John Doe is now set to Moderator using the role field.`);
}

main()
  .catch((error) => {
    console.error('Error updating moderator account:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });