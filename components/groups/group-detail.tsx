
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, 
  MessageCircle, 
  ArrowLeft, 
  UserPlus, 
  UserMinus, 
  Send, 
  Shield,
  UserX,
  MoreVertical,
  Lock,
  Globe,
  Eye,
  EyeOff,
  Star,
  Ban,
  Check
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import PostCard from '@/components/dashboard/post-card'
import { getPoliticalIdentifierColor, getPoliticalIdentifierLabel } from '@/lib/political-utils'
import { getImageUrl } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface GroupDetailProps {
  group: any
  currentUser: any
  isMember: boolean
}

export default function GroupDetail({ group, currentUser, isMember: initialIsMember }: GroupDetailProps) {
  const router = useRouter()
  const [isMember, setIsMember] = useState(initialIsMember)
  const [isLoading, setIsLoading] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [isPostingPost, setIsPostingPost] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  // Check if current user is admin or creator
  const currentUserMembership = group.members?.find((m: any) => m.user.id === currentUser.id)
  const isAdmin = currentUserMembership?.role === 'admin' || currentUserMembership?.role === 'moderator'
  const isCreator = group.creatorId === currentUser.id
  
  // Filter out hidden members (invisible admins)
  const visibleMembers = group.members?.filter((m: any) => !m.isHidden) || []

  const getPoliticalFocusColor = (focus: string | null | undefined) => {
    switch (focus?.toLowerCase()) {
      case 'environmental': return 'bg-green-100 text-green-800'
      case 'economic': return 'bg-blue-100 text-blue-800'
      case 'constitutional': return 'bg-purple-100 text-purple-800'
      case 'social': return 'bg-pink-100 text-pink-800'
      case 'foreign': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPrivacyLevelInfo = (level: string | null | undefined) => {
    switch (level) {
      case 'PUBLIC':
        return { icon: Globe, label: 'Public', color: 'bg-green-100 text-green-800' }
      case 'PRIVATE_DISCOVERABLE':
        return { icon: Eye, label: 'Private (Discoverable)', color: 'bg-yellow-100 text-yellow-800' }
      case 'PRIVATE_HIDDEN':
        return { icon: EyeOff, label: 'Private (Hidden)', color: 'bg-red-100 text-red-800' }
      default:
        return { icon: Globe, label: 'Public', color: 'bg-green-100 text-green-800' }
    }
  }

  const handleJoinLeave = async () => {
    setIsLoading(true)
    try {
      const endpoint = isMember ? 'leave' : 'join'
      const response = await fetch(`/api/groups/${group.id}/${endpoint}`, {
        method: 'POST'
      })

      if (response.ok) {
        setIsMember(!isMember)
        toast.success(isMember ? 'Left group successfully' : 'Joined group successfully!')
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Action failed')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPostContent.trim()) {
      toast.error('Please write something')
      return
    }

    // Check if user is restricted
    if (currentUserMembership?.restricted) {
      toast.error('You are currently restricted from posting in this group')
      return
    }

    setIsPostingPost(true)
    try {
      const formData = new FormData()
      formData.append('content', newPostContent)
      formData.append('groupId', group.id)

      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        toast.success('Post created!')
        setNewPostContent('')
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to create post')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsPostingPost(false)
    }
  }

  const handleRemoveMember = async () => {
    if (!memberToRemove) return

    setIsRemoving(true)
    try {
      const response = await fetch(`/api/groups/${group.id}/remove-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: memberToRemove })
      })

      if (response.ok) {
        toast.success('Member removed successfully')
        setMemberToRemove(null)
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to remove member')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsRemoving(false)
    }
  }

  const handleToggleRestriction = async (userId: string, currentlyRestricted: boolean) => {
    try {
      const response = await fetch(`/api/groups/${group.id}/toggle-restriction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          restricted: !currentlyRestricted 
        })
      })

      if (response.ok) {
        toast.success(currentlyRestricted ? 'Restrictions removed' : 'Member restricted')
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update restriction')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/groups')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
          {(isAdmin || isCreator) && (
            <div className="flex items-center gap-2 mt-1">
              <Shield className="h-4 w-4 text-earth-brown" />
              <span className="text-sm text-earth-brown font-medium">Admin View</span>
            </div>
          )}
        </div>
        <Button onClick={handleJoinLeave} disabled={isLoading}>
          {isMember ? (
            <>
              <UserMinus className="h-4 w-4 mr-2" />
              Leave Group
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Join Group
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post (only for members) */}
          {isMember && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create Post</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <Textarea
                    placeholder="Share your thoughts with the group..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isPostingPost}>
                      <Send className="h-4 w-4 mr-2" />
                      {isPostingPost ? 'Posting...' : 'Post'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Posts */}
          <div className="space-y-4">
            {group.posts?.length > 0 ? (
              group.posts.map((post: any, index: number) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <PostCard post={post} currentUser={currentUser} />
                </motion.div>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  {!isMember && group.privacyLevel !== 'PUBLIC' ? (
                    <>
                      <Lock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Private Content</p>
                      <p className="text-sm">
                        Posts in this group are private. <br />
                        Join the group to see discussions and participate.
                      </p>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">No posts yet</p>
                      <p className="text-sm">
                        Be the first to start a discussion!
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Group Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About Group</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">{group.description}</p>
              </div>

              <Separator />

              {/* Privacy Level */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Privacy</p>
                {(() => {
                  const privacyInfo = getPrivacyLevelInfo(group.privacyLevel)
                  const PrivacyIcon = privacyInfo.icon
                  return (
                    <Badge className={privacyInfo.color}>
                      <PrivacyIcon className="h-3 w-3 mr-1" />
                      {privacyInfo.label}
                    </Badge>
                  )
                })()}
              </div>

              {group.politicalFocus && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Political Focus</p>
                  <Badge className={getPoliticalFocusColor(group.politicalFocus)}>
                    {group.politicalFocus}
                  </Badge>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  Members
                </span>
                <span className="font-medium">{group._count?.members ?? 0}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-600">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Posts
                </span>
                <span className="font-medium">{group._count?.posts ?? 0}</span>
              </div>

              {group.civilityRules && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Group Rules</p>
                    <p className="text-sm text-gray-600">{group.civilityRules}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Members ({isMember || group.privacyLevel === 'PUBLIC' ? visibleMembers.length : group._count?.members ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isMember && group.privacyLevel !== 'PUBLIC' ? (
                <div className="py-8 text-center text-gray-500">
                  <Lock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    Member list is private. <br />
                    Join the group to see members.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleMembers.slice(0, 20).map((member: any) => {
                  const isMemberCreator = member.user.id === group.creatorId
                  const canManage = (isAdmin || isCreator) && 
                                   !isMemberCreator && 
                                   member.user.id !== currentUser.id

                  return (
                    <div key={member.id} className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getImageUrl(member.user?.profileImage)} />
                        <AvatarFallback className="text-xs">
                          {member.user?.name?.[0]?.toUpperCase() ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.user?.name}
                          </p>
                          {isMemberCreator && (
                            <Badge variant="secondary" className="text-xs flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-200">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              Creator
                            </Badge>
                          )}
                          {member.role === 'admin' && (
                            <Badge variant="secondary" className="text-xs">Admin</Badge>
                          )}
                          {member.role === 'moderator' && (
                            <Badge variant="secondary" className="text-xs">Mod</Badge>
                          )}
                          {member.restricted && (
                            <Badge variant="destructive" className="text-xs flex items-center gap-1">
                              <Ban className="h-3 w-3" />
                              Restricted
                            </Badge>
                          )}
                        </div>
                        {member.user?.politicalLeaning && (
                          <Badge className={`text-xs ${getPoliticalIdentifierColor(member.user.politicalLeaning)}`} variant="outline">
                            {getPoliticalIdentifierLabel(member.user.politicalLeaning)}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Admin Controls */}
                      {canManage && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleToggleRestriction(member.user.id, member.restricted)}
                            >
                              {member.restricted ? (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Remove Restriction
                                </>
                              ) : (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Restrict Member
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setMemberToRemove(member.user.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  )
                  })}
                  {visibleMembers.length > 20 && (
                    <p className="text-xs text-gray-500 text-center">
                      + {visibleMembers.length - 20} more members
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the group? They will need to rejoin to participate again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
