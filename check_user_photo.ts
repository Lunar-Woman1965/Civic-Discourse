import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkUserPhoto() {
  const user = await prisma.user.findUnique({
    where: { email: 'bta-social.sharing@bridgingtheaisle.com' },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      profileImage: true,
      useAvatar: true,
      avatarStyle: true,
      avatarSeed: true,
    },
  });

  console.log('\n👤 User Photo Status:\n');
  console.log(JSON.stringify(user, null, 2));
  
  await prisma.$disconnect();
}

checkUserPhoto();
