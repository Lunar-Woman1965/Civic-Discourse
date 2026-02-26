
'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Hash, Users, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface TrendingTopic {
  tag: string
  count: number
  engagement: number
  score: number
}

interface ActiveGroup {
  id: string
  name: string
  description: string
  coverImage: string | null
  politicalFocus: string | null
  _count: {
    posts: number
    members: number
  }
}

interface TrendingData {
  trendingTopics: TrendingTopic[]
  activeGroups: ActiveGroup[]
}

export default function TrendingSidebar() {
  const [data, setData] = useState<TrendingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch('/api/trending')
        if (response.ok) {
          const trendingData = await response.json()
          setData(trendingData)
        }
      } catch (error) {
        console.error('Failed to fetch trending data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="h-5 w-5 mr-2 text-turquoise-600" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data?.trendingTopics && data.trendingTopics.length > 0 ? (
            data.trendingTopics.slice(0, 7).map((topic) => (
              <div
                key={topic.tag}
                className="flex items-center justify-between p-2 rounded hover:bg-creamy-tan-50 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-turquoise-600" />
                  <span className="text-sm font-medium">{topic.tag}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {topic.count} posts
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No trending topics yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Active Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Users className="h-5 w-5 mr-2 text-turquoise-600" />
            Active Groups
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data?.activeGroups && data.activeGroups.length > 0 ? (
            data.activeGroups.map((group) => (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <div className="p-2 rounded hover:bg-creamy-tan-50 cursor-pointer border border-creamy-tan-200">
                  <div className="flex items-center gap-2">
                    {group.coverImage && (
                      <div className="w-10 h-10 rounded bg-gray-200 flex-shrink-0 overflow-hidden relative">
                        <img
                          src={group.coverImage}
                          alt={group.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{group.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{group._count.members} members</span>
                        <span>•</span>
                        <span>{group._count.posts} posts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No active groups yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
