

import { getCurrentUser } from '@/lib/session'
import { redirect, notFound } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { prisma } from '@/lib/db'
import GroupDetail from '@/components/groups/group-detail'

export default async function GroupPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  // First check if user is a member (including hidden members)
  const userMembership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: user.id,
        groupId: params.id
      }
    }
  })
  
  const isMember = !!userMembership

  const group = await prisma.group.findUnique({
    where: { id: params.id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          profileImage: true,
          politicalLeaning: true
        }
      },
      members: {
        where: {
          isHidden: false  // Only fetch visible members for display
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              politicalLeaning: true
            }
          }
        }
      },
      _count: {
        select: {
          members: true,
          posts: true
        }
      }
    }
  })

  if (!group) {
    notFound()
  }
  const isPublic = group.privacyLevel === 'PUBLIC'

  // Only fetch posts if user is a member or group is public
  let posts: any[] = []
  if (isMember || isPublic) {
    posts = await prisma.post.findMany({
      where: { groupId: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            politicalLeaning: true
          }
        },
        reactions: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profileImage: true
              }
            }
          }
        },
        _count: {
          select: {
            comments: true,
            reactions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Hide member details for private groups unless user is a member
  const membersToShow = (isMember || isPublic) ? group.members : []
  
  // If current user is a hidden member, add their membership to the list so they can see their admin status
  if (userMembership && userMembership.isHidden && !membersToShow.find((m: any) => m.userId === user.id)) {
    membersToShow.push({
      ...userMembership,
      user: {
        id: user.id,
        name: user.name,
        profileImage: user.profileImage,
        politicalLeaning: user.politicalLeaning
      }
    })
  }

  return (
    <DashboardLayout user={user}>
      <GroupDetail 
        group={{ ...group, posts, members: membersToShow }} 
        currentUser={user} 
        isMember={isMember} 
      />
    </DashboardLayout>
  )
}
