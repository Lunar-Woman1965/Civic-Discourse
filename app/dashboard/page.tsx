import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import NewsFeed from '@/components/dashboard/news-feed'
import { prisma } from '@/lib/db'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { postId?: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin')
  }

  const userDetails = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      isAdmin: true,
      isFounder: true,
      role: true,
    },
  })

  const posts = await prisma.post.findMany({
    where: {
      groupId: null,
      ...(userDetails?.isAdmin
        ? {}
        : {
            OR: [{ isApproved: true }, { authorId: user.id }],
          }),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          username: true,
          displayNamePreference: true,
          profileImage: true,
          politicalLeaning: true,
          civilityScore: true,
          role: true,
          isFounder: true,
          isAdmin: true,
        },
      },
      reactions: {
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      },
      comments: {
        where: {
          ...(userDetails?.isAdmin
            ? {}
            : {
                OR: [{ isApproved: true }, { authorId: user.id }],
              }),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              username: true,
              displayNamePreference: true,
              profileImage: true,
              politicalLeaning: true,
              civilityScore: true,
              role: true,
              isFounder: true,
              isAdmin: true,
            },
          },
          reactions: {
            include: {
              user: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      _count: {
        select: {
          comments: true,
          reactions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const groups = await prisma.group.findMany({
    include: {
      _count: {
        select: { members: true, posts: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return (
    <DashboardLayout user={user}>
      <NewsFeed
        initialPosts={posts}
        currentUser={user}
        groups={groups}
        highlightedPostId={searchParams.postId}
      />
    </DashboardLayout>
  )
}