import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        joinedAt: true,
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    console.log('\n=== Users in Production Database ===');
    console.log(`Total users: ${users.length}\n`);
    
    users.forEach((user: any, index: number) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.joinedAt.toISOString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
