
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { prisma } from '@/lib/db'
import GroupsGrid from '@/components/groups/groups-grid'

export default async function GroupsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  const groups = await prisma.group.findMany({
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          profileImage: true
        }
      },
      _count: {
        select: {
          members: true,
          posts: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <DashboardLayout user={user}>
      <GroupsGrid groups={groups} currentUser={user} />
    </DashboardLayout>
  )
}
