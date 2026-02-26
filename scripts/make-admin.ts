/**
 * Script to make a user an admin
 * Usage: yarn tsx scripts/make-admin.ts <email>
 */

import { prisma } from '../lib/db'

async function makeAdmin() {
  const email = process.argv[2]
  
  if (!email) {
    console.error('Please provide an email address')
    console.log('Usage: yarn tsx scripts/make-admin.ts <email>')
    process.exit(1)
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!user) {
      console.error(`User with email ${email} not found`)
      process.exit(1)
    }

    if (user.isAdmin) {
      console.log(`User ${email} is already an admin`)
      process.exit(0)
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isAdmin: true },
    })

    console.log(`✅ User ${email} is now an admin!`)
    console.log(`You can now access the admin dashboard at: /admin`)
  } catch (error) {
    console.error('Error making user admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()
