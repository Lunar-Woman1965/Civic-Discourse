
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { prisma } from '@/lib/db'
import FriendsContent from '@/components/friends/friends-content'

export default async function FriendsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  // Fetch pending requests (received)
  const pendingRequests = await prisma.friendship.findMany({
    where: {
      receiverId: user.id,
      status: 'pending'
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          username: true,
          displayNamePreference: true,
          email: true,
          profileImage: true,
          politicalLeaning: true,
          bio: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Fetch sent requests
  const sentRequests = await prisma.friendship.findMany({
    where: {
      requesterId: user.id,
      status: 'pending'
    },
    include: {
      receiver: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          username: true,
          displayNamePreference: true,
          email: true,
          profileImage: true,
          politicalLeaning: true,
          bio: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Fetch accepted friends
  const acceptedFriendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { requesterId: user.id, status: 'accepted' },
        { receiverId: user.id, status: 'accepted' }
      ]
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          username: true,
          displayNamePreference: true,
          email: true,
          profileImage: true,
          politicalLeaning: true,
          bio: true
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          username: true,
          displayNamePreference: true,
          email: true,
          profileImage: true,
          politicalLeaning: true,
          bio: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const friends = acceptedFriendships.map((friendship: any) => {
    const friend = friendship.requesterId === user.id 
      ? friendship.receiver 
      : friendship.requester
    return {
      ...friend,
      friendshipId: friendship.id
    }
  })

  // Get friend IDs for suggestions
  const friendIds = friends.map((f: any) => f.id)
  const allConnectionIds = [
    ...friendIds,
    ...pendingRequests.map((r: any) => r.requester.id),
    ...sentRequests.map((r: any) => r.receiver.id),
    user.id
  ]

  // Fetch suggested connections (users you're not connected with)
  const suggestions = await prisma.user.findMany({
    where: {
      id: {
        notIn: allConnectionIds
      }
    },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      username: true,
      displayNamePreference: true,
      email: true,
      profileImage: true,
      politicalLeaning: true,
      bio: true,
      civilityScore: true
    },
    take: 10,
    orderBy: {
      civilityScore: 'desc'
    }
  })

  return (
    <DashboardLayout user={user}>
      <FriendsContent
        pendingRequests={pendingRequests}
        sentRequests={sentRequests}
        friends={friends}
        suggestions={suggestions}
      />
    </DashboardLayout>
  )
}
