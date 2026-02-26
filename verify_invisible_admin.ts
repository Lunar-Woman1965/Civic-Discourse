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
  
  console.log(`\n✅ Verifying invisible admin status for: ${user.name} (${user.email})\n`);
  
  // Get all groups and check membership
  const groups = await prisma.group.findMany({
    include: {
      members: {
        where: {
          userId: user.id
        }
      }
    }
  });
  
  console.log(`Total groups: ${groups.length}\n`);
  
  for (const group of groups) {
    const membership = group.members[0];
    
    if (!membership) {
      console.log(`❌ ${group.name}: NOT a member`);
      continue;
    }
    
    const statusIcon = membership.isHidden ? '🔒' : '👁️';
    const roleIcon = membership.role === 'admin' ? '👑' : membership.role === 'moderator' ? '🛡️' : '👤';
    
    console.log(`${statusIcon} ${roleIcon} ${group.name}`);
    console.log(`   Role: ${membership.role}`);
    console.log(`   Hidden: ${membership.isHidden ? 'YES (Invisible)' : 'NO (Visible)'}`);
    console.log(`   Joined: ${membership.joinedAt.toLocaleDateString()}`);
    console.log();
  }
  
  const hiddenCount = groups.filter((g: any) => g.members[0]?.isHidden).length;
  console.log(`\n✅ Summary: ${hiddenCount}/${groups.length} memberships are invisible`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
