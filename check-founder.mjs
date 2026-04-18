import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const user = await p.user.findUnique({
  where: { email: 'lmhansen26062@ymail.com' },
  select: { isAdmin: true, isFounder: true }
});
console.log(user);
await p.$disconnect();
