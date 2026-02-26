
'use client'

import { useState } from 'react'
import { Users, UserPlus, Clock, Check, X, Loader2, UserMinus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { politicalLeaningColors } from '@/lib/political-utils'
import { useRouter } from 'next/navigation'
import { getDisplayName, getAvatarFallback } from '@/lib/display-name-utils'

interface User {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  username: string | null
  displayNamePreference: string | null
  email: string
  profileImage: string | null
  politicalLeaning: string | null
  bio: string | null
  civilityScore?: number
}

interface FriendWithId extends User {
  friendshipId: string
}

interface FriendRequest {
  id: string
  requester: User
}

interface SentRequest {
  id: string
  receiver: User
}

interface FriendsContentProps {
  pendingRequests: FriendRequest[]
  sentRequests: SentRequest[]
  friends: FriendWithId[]
  suggestions: User[]
}

export default function FriendsContent({
  pendingRequests: initialPending,
  sentRequests: initialSent,
  friends: initialFriends,
  suggestions: initialSuggestions
}: FriendsContentProps) {
  const router = useRouter()
  const [pendingRequests, setPendingRequests] = useState(initialPending)
  const [sentRequests, setSentRequests] = useState(initialSent)
  const [friends, setFriends] = useState(initialFriends)
  const [suggestions, setSuggestions] = useState(initialSuggestions)
  const [loading, setLoading] = useState<string | null>(null)

  const getPoliticalColor = (leaning: string | null) => {
    if (!leaning) return 'bg-gray-100 text-gray-800'
    const colors = politicalLeaningColors[leaning]
    return colors ? `${colors.bg} ${colors.text}` : 'bg-gray-100 text-gray-800'
  }

  const acceptRequest = async (requestId: string) => {
    setLoading(`accept-${requestId}`)
    try {
      const response = await fetch(`/api/friends/${requestId}/accept`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Friend request accepted!')
        router.refresh()
      } else {
        toast.error('Failed to accept request')
      }
    } catch (error) {
      toast.error('Failed to accept request')
    } finally {
      setLoading(null)
    }
  }

  const declineRequest = async (requestId: string) => {
    setLoading(`decline-${requestId}`)
    try {
      const response = await fetch(`/api/friends/${requestId}/decline`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Friend request declined')
        setPendingRequests(prev => prev.filter(r => r.id !== requestId))
      } else {
        toast.error('Failed to decline request')
      }
    } catch (error) {
      toast.error('Failed to decline request')
    } finally {
      setLoading(null)
    }
  }

  const removeFriend = async (friendshipId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return

    setLoading(`remove-${friendshipId}`)
    try {
      const response = await fetch(`/api/friends/${friendshipId}/remove`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Friend removed')
        setFriends(prev => prev.filter(f => f.friendshipId !== friendshipId))
      } else {
        toast.error('Failed to remove friend')
      }
    } catch (error) {
      toast.error('Failed to remove friend')
    } finally {
      setLoading(null)
    }
  }

  const sendFriendRequest = async (receiverId: string) => {
    setLoading(`send-${receiverId}`)
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId })
      })

      if (response.ok) {
        toast.success('Friend request sent!')
        setSuggestions(prev => prev.filter(s => s.id !== receiverId))
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to send request')
      }
    } catch (error) {
      toast.error('Failed to send friend request')
    } finally {
      setLoading(null)
    }
  }

  const UserCard = ({ 
    user, 
    action 
  }: { 
    user: User
    action: React.ReactNode 
  }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-creamy-tan-200 hover:bg-creamy-tan-50">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.profileImage ?? undefined} />
        <AvatarFallback>
          {getAvatarFallback(user)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{getDisplayName(user, 'Anonymous')}</p>
          {user.politicalLeaning && (
            <Badge variant="secondary" className={getPoliticalColor(user.politicalLeaning)}>
              {user.politicalLeaning}
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-500">{user.email}</p>
        {user.bio && (
          <p className="text-xs text-gray-600 line-clamp-1 mt-1">{user.bio}</p>
        )}
      </div>
      {action}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Users className="h-8 w-8 text-turquoise-600" />
        <div>
          <h1 className="text-2xl font-bold text-earth-brown-900">Friends & Connections</h1>
          <p className="text-earth-brown-600">Connect with fellow political discussants</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests (Received) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-turquoise-600" />
              Pending Requests
              {pendingRequests.length > 0 && (
                <Badge className="ml-2 bg-turquoise-600">{pendingRequests.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <UserCard
                  key={request.id}
                  user={request.requester}
                  action={
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => acceptRequest(request.id)}
                        disabled={loading === `accept-${request.id}`}
                        className="bg-turquoise-600 hover:bg-turquoise-700"
                      >
                        {loading === `accept-${request.id}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => declineRequest(request.id)}
                        disabled={loading === `decline-${request.id}`}
                      >
                        {loading === `decline-${request.id}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  }
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No pending friend requests</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sent Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2 text-pale-copper-600" />
              Sent Requests
              {sentRequests.length > 0 && (
                <Badge className="ml-2 bg-pale-copper-600">{sentRequests.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sentRequests.length > 0 ? (
              sentRequests.map((request) => (
                <UserCard
                  key={request.id}
                  user={request.receiver}
                  action={
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                  }
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No sent requests</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Friends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-turquoise-600" />
            Your Friends
            {friends.length > 0 && (
              <Badge className="ml-2 bg-turquoise-600">{friends.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {friends.map((friend) => (
                <UserCard
                  key={friend.id}
                  user={friend}
                  action={
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFriend(friend.friendshipId)}
                      disabled={loading === `remove-${friend.friendshipId}`}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {loading === `remove-${friend.friendshipId}` ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <UserMinus className="h-3 w-3" />
                      )}
                    </Button>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No friends yet</p>
              <p className="text-xs">Start connecting with other members!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested Friends */}
      <Card>
        <CardHeader>
          <CardTitle>Suggested Connections</CardTitle>
          <p className="text-sm text-earth-brown-600">People you may know</p>
        </CardHeader>
        <CardContent>
          {suggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((suggestion) => (
                <UserCard
                  key={suggestion.id}
                  user={suggestion}
                  action={
                    <Button
                      size="sm"
                      onClick={() => sendFriendRequest(suggestion.id)}
                      disabled={loading === `send-${suggestion.id}`}
                      className="bg-turquoise-600 hover:bg-turquoise-700"
                    >
                      {loading === `send-${suggestion.id}` ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3 mr-1" />
                          Add
                        </>
                      )}
                    </Button>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No suggestions available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
