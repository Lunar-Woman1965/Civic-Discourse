
'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, UserPlus, Check, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { politicalLeaningColors } from '@/lib/political-utils'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { getImageUrl } from '@/lib/utils'
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
  civilityScore: number
  friendshipStatus: string
  isPendingFrom: string | null
}

export default function UserSearchDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [sendingRequest, setSendingRequest] = useState<string | null>(null)

  useEffect(() => {
    if (query.length < 2) {
      setUsers([])
      return
    }

    const debounce = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(debounce)
  }, [query])

  const sendFriendRequest = async (receiverId: string) => {
    setSendingRequest(receiverId)
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId })
      })

      if (response.ok) {
        toast.success('Friend request sent!')
        setUsers(prev =>
          prev.map(u =>
            u.id === receiverId
              ? { ...u, friendshipStatus: 'pending', isPendingFrom: 'you' }
              : u
          )
        )
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to send request')
      }
    } catch (error) {
      toast.error('Failed to send friend request')
    } finally {
      setSendingRequest(null)
    }
  }

  const renderActionButton = (user: User) => {
    if (user.friendshipStatus === 'accepted') {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Check className="h-3 w-3 mr-1" />
          Friends
        </Badge>
      )
    }

    if (user.friendshipStatus === 'pending') {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          {user.isPendingFrom === 'you' ? 'Request Sent' : 'Request Received'}
        </Badge>
      )
    }

    return (
      <Button
        size="sm"
        onClick={() => sendFriendRequest(user.id)}
        disabled={sendingRequest === user.id}
      >
        {sendingRequest === user.id ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <>
            <UserPlus className="h-3 w-3 mr-1" />
            Add Friend
          </>
        )}
      </Button>
    )
  }

  const getPoliticalColor = (leaning: string | null) => {
    if (!leaning) return 'bg-gray-100 text-gray-800'
    const colors = politicalLeaningColors[leaning]
    return colors ? `${colors.bg} ${colors.text}` : 'bg-gray-100 text-gray-800'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[600px]">
        <DialogHeader>
          <DialogTitle>Search Users</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="overflow-y-auto max-h-[400px] space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : users.length === 0 && query.length >= 2 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No users found</p>
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-creamy-tan-200 hover:bg-creamy-tan-50 cursor-pointer"
                  onClick={() => {
                    router.push(`/profile/${user.id}`)
                    setOpen(false)
                  }}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={getImageUrl(user.profileImage)} />
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
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    {user.bio && (
                      <p className="text-xs text-gray-600 line-clamp-1 mt-1">{user.bio}</p>
                    )}
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    {renderActionButton(user)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
