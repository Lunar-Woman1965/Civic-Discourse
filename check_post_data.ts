import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkPostData() {
  // Get the most recent post from any user to see what author data is included
  const post = await prisma.post.findFirst({
    where: { authorId: 'cmjw7buni0000u2un1o8ho1qm' },
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          useAvatar: true,
          politicalLeaning: true,
        },
      },
    },
  });

  console.log('\n📝 Post Data with Author Info:\n');
  if (post) {
    console.log('Post ID:', post.id);
    console.log('Author Data:', JSON.stringify(post.author, null, 2));
  } else {
    console.log('No posts found for this user');
  }
  
  await prisma.$disconnect();
}

checkPostData();
