
import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Starting seed...')

  // Create admin test user
  const hashedPassword = await bcrypt.hash('johndoe123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      bio: 'Administrator and platform moderator',
      politicalLeaning: 'centrist',
      isVerified: true,
      civilityScore: 9.5,
    },
  })

  // Create some sample groups
  const groups = [
    {
      name: 'Climate Change Discussion',
      description: 'A place for respectful discussion about climate change policies and solutions.',
      politicalFocus: 'Environmental',
      civilityRules: 'Please cite sources and maintain respectful dialogue.',
      creatorId: adminUser.id,
    },
    {
      name: 'Economic Policy Debates',
      description: 'Discussing fiscal policy, taxation, and economic systems.',
      politicalFocus: 'Economic',
      civilityRules: 'Focus on policies, not personalities. Back up claims with data.',
      creatorId: adminUser.id,
    },
    {
      name: 'Constitutional Rights',
      description: 'Discussions about constitutional law and civil liberties.',
      politicalFocus: 'Constitutional',
      civilityRules: 'Cite legal precedents and maintain civil discourse.',
      creatorId: adminUser.id,
    },
  ]

  for (const groupData of groups) {
    // Check if group already exists
    const existingGroup = await prisma.group.findFirst({
      where: { name: groupData.name }
    })

    const group = existingGroup || await prisma.group.create({
      data: groupData,
    })

    // Check if membership already exists
    const existingMembership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: adminUser.id,
          groupId: group.id,
        },
      },
    })

    if (!existingMembership) {
      await prisma.groupMember.create({
        data: {
          userId: adminUser.id,
          groupId: group.id,
          role: 'admin',
        },
      })
    }
  }

  // Create some sample posts
  const posts = [
    {
      content: 'Welcome to our political discussion platform! This is a space for civil, fact-based political discourse. Please remember to cite your sources and maintain respectful dialogue.',
      politicalTags: ['announcement', 'community'],
      authorId: adminUser.id,
      isFactChecked: true,
      civilityScore: 9.0,
    },
    {
      content: 'What are your thoughts on renewable energy policies? I believe we need a balanced approach that considers both environmental impact and economic feasibility.',
      politicalTags: ['environment', 'energy', 'policy'],
      authorId: adminUser.id,
      sourceCitation: 'https://www.iea.org/reports/renewable-energy-market-update-june-2023',
      isFactChecked: true,
      civilityScore: 8.5,
    },
  ]

  for (const postData of posts) {
    await prisma.post.create({
      data: postData,
    })
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
