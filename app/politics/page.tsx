
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Vote, TrendingUp, Users, MessageCircle } from 'lucide-react'
import { prisma } from '@/lib/db'

export default async function PoliticsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  // Get trending topics and discussions
  const trendingPosts = await prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          politicalLeaning: true
        }
      },
      _count: {
        select: {
          comments: true,
          reactions: true
        }
      }
    },
    orderBy: [
      { civilityScore: 'desc' },
      { createdAt: 'desc' }
    ],
    take: 10
  })

  const politicalLeaderboard = [
    { leaning: 'Liberal', count: 45, color: 'bg-blue-100 text-blue-800' },
    { leaning: 'Conservative', count: 38, color: 'bg-red-100 text-red-800' },
    { leaning: 'Centrist', count: 52, color: 'bg-purple-100 text-purple-800' },
    { leaning: 'Libertarian', count: 23, color: 'bg-yellow-100 text-yellow-800' },
    { leaning: 'Progressive', count: 31, color: 'bg-green-100 text-green-800' },
  ]

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Vote className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Political Hub</h1>
            <p className="text-gray-600">Explore trending political discussions and diverse perspectives</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trending Discussions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                  Trending Political Discussions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendingPosts?.map((post: any) => (
                    <div key={post?.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{post?.author?.name}</span>
                          {post?.author?.politicalLeaning && (
                            <Badge variant="secondary" className="text-xs">
                              {post.author.politicalLeaning}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="flex items-center">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {post?._count?.comments ?? 0}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {post?._count?.reactions ?? 0}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-900 mb-2 line-clamp-3">
                        {post?.content}
                      </p>
                      {post?.politicalTags?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.politicalTags.slice(0, 3).map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {trendingPosts?.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No trending discussions yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Political Spectrum */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-indigo-600" />
                  Community Spectrum
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {politicalLeaderboard?.map((item) => (
                    <div key={item.leaning} className="flex items-center justify-between">
                      <Badge className={item.color}>
                        {item.leaning}
                      </Badge>
                      <span className="text-sm font-medium">{item.count} members</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Posts</span>
                    <span className="font-medium">{trendingPosts?.length ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fact-Checked Posts</span>
                    <span className="font-medium text-green-600">
                      {trendingPosts?.filter((p: any) => p?.isFactChecked)?.length ?? 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
