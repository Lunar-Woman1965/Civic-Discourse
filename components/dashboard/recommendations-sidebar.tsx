
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, UsersRound, Loader2, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getPoliticalIdentifierColor, getPoliticalIdentifierLabel } from '@/lib/political-utils'
import toast from 'react-hot-toast'
import { getImageUrl } from '@/lib/utils'
import { getDisplayName, getAvatarFallback } from '@/lib/display-name-utils'

interface RecommendationsSidebarProps {
  currentUser: any
}

export default function RecommendationsSidebar({ currentUser }: RecommendationsSidebarProps) {
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sendingRequest, setSendingRequest] = useState<string | null>(null)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations')
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data)
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendFriendRequest = async (userId: string) => {
    setSendingRequest(userId)
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: userId })
      })

      if (response.ok) {
        toast.success('Friend request sent!')
        // Remove from recommendations
        setRecommendations((prev: any) => ({
          ...prev,
          users: prev?.users?.filter((u: any) => u.id !== userId) ?? []
        }))
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to send friend request')
      }
    } catch (error) {
      toast.error('Failed to send friend request')
    } finally {
      setSendingRequest(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!recommendations || (recommendations.users?.length === 0 && recommendations.groups?.length === 0)) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Recommended Users */}
      {recommendations.users?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-turquoise-600" />
              People You Might Know
            </CardTitle>
            <p className="text-xs text-gray-500">Based on your political interests</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.users?.slice(0, 5).map((user: any) => (
              <div key={user.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                <Avatar className="h-10 w-10 cursor-pointer" onClick={() => router.push(`/profile?id=${user.id}`)}>
                  <AvatarImage src={getImageUrl(user.profileImage)} />
                  <AvatarFallback>
                    {getAvatarFallback(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-turquoise-600"
                    onClick={() => router.push(`/profile?id=${user.id}`)}
                  >
                    {getDisplayName(user)}
                  </p>
                  {user.politicalLeaning && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs mt-1 ${getPoliticalIdentifierColor(user.politicalLeaning)}`}
                    >
                      {getPoliticalIdentifierLabel(user.politicalLeaning)}
                    </Badge>
                  )}
                  {user.reason && (
                    <p className="text-xs text-gray-500 mt-1">{user.reason}</p>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 h-7 text-xs"
                    onClick={() => sendFriendRequest(user.id)}
                    disabled={sendingRequest === user.id}
                  >
                    {sendingRequest === user.id ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <UserPlus className="h-3 w-3 mr-1" />
                    )}
                    Add Friend
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommended Groups */}
      {recommendations.groups?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <UsersRound className="h-4 w-4 text-turquoise-600" />
              Suggested Groups
            </CardTitle>
            <p className="text-xs text-gray-500">Groups matching your interests</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.groups?.slice(0, 5).map((group: any) => (
              <div key={group.id} className="pb-3 border-b last:border-0 last:pb-0">
                <div 
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => router.push(`/groups/${group.id}`)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900">{group.name}</h4>
                    {group.privacyLevel && (
                      <Badge variant="outline" className="text-xs">
                        {group.privacyLevel}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {group.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {group._count?.members ?? 0} members
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
