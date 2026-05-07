const fs = require('fs');

const content = `'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { RoleBadge } from '@/components/role-badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  HeartHandshake,
  Frown,
  Flame,
  Skull,
  ExternalLink,
  MoreHorizontal,
  Flag,
  Trash2,
  Edit2,
  Pin
} from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { getPoliticalIdentifierColor, getPoliticalIdentifierLabel } from '@/lib/political-utils'
import { getImageUrl } from '@/lib/image-utils'
import { useRouter } from 'next/navigation'

interface PostCardProps {
  post: any
  currentUser?: any
  showCommunity?: boolean
  onPostUpdated?: () => void
  onPostDeleted?: () => void
}

const reactionIcons = {
  LIKE: ThumbsUp,
  DISLIKE: ThumbsDown,
  RESPECT: HeartHandshake,
  CONCERNED: Frown,
  ANGRY: Flame,
  RIP: Skull,
}

const reactionLabels = {
  LIKE: 'Like',
  DISLIKE: 'Dislike',
  RESPECT: 'Respect',
  CONCERNED: 'Concerned',
  ANGRY: 'Angry',
  RIP: 'RIP',
}

const reactionColors = {
  LIKE: 'text-blue-600 hover:bg-blue-50',
  DISLIKE: 'text-gray-600 hover:bg-gray-50',
  RESPECT: 'text-green-600 hover:bg-green-50',
  CONCERNED: 'text-yellow-600 hover:bg-yellow-50',
  ANGRY: 'text-red-600 hover:bg-red-50',
  RIP: 'text-purple-600 hover:bg-purple-50',
}

export function PostCard({ post, currentUser, showCommunity = true, onPostUpdated, onPostDeleted }: PostCardProps) {
  const router = useRouter()
  const [comments, setComments] = useState(post.comments || [])
  const [newComment, setNewComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [reactions, setReactions] = useState(post.reactions || [])
  const [userReaction, setUserReaction] = useState(
    post.reactions?.find((r: any) => r.userId === currentUser?.id)?.type || null
  )
  const [showReactionMenu, setShowReactionMenu] = useState(false)
  const [showFlagDialog, setShowFlagDialog] = useState(false)
  const [flagReason, setFlagReason] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const getDisplayName = (user: any) => {
    if (!user) return 'Unknown User'
    return user.pseudonym || user.name || 'Anonymous User'
  }

  const canDeletePost = currentUser && (
    currentUser.id === post.authorId ||
    currentUser.isAdmin ||
    currentUser.role === 'PLATFORM_FOUNDER' ||
    currentUser.role === 'MODERATOR'
  )

  const getReactionCounts = () => {
    const counts: Record<string, number> = {}
    reactions.forEach((reaction: any) => {
      counts[reaction.type] = (counts[reaction.type] || 0) + 1
    })
    return counts
  }

  const handleReaction = async (type: string) => {
    if (!currentUser) {
      toast.error('Please sign in to react')
      return
    }

    try {
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, type }),
      })

      if (!response.ok) throw new Error('Failed to react')

      const data = await response.json()
      
      if (userReaction === type) {
        setUserReaction(null)
        setReactions(reactions.filter((r: any) => !(r.userId === currentUser.id && r.type === type)))
      } else {
        setUserReaction(type)
        const filteredReactions = reactions.filter((r: any) => r.userId !== currentUser.id)
        setReactions([...filteredReactions, data.reaction])
      }
      
      setShowReactionMenu(false)
    } catch (error) {
      toast.error('Failed to react')
    }
  }

  const handleComment = async () => {
    if (!currentUser) {
      toast.error('Please sign in to comment')
      return
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment')
      return
    }

    setIsSubmittingComment(true)

    try {
      const response = await fetch(\`/api/posts/\${post.id}/comments\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      })

      if (!response.ok) throw new Error('Failed to comment')

      const comment = await response.json()
      setComments([...comments, comment])
      setNewComment('')
      toast.success('Comment added')
    } catch (error) {
      toast.error('Failed to add comment')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleFlag = async () => {
    if (!currentUser) {
      toast.error('Please sign in to flag content')
      return
    }

    if (!flagReason.trim()) {
      toast.error('Please provide a reason')
      return
    }

    try {
      const response = await fetch('/api/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, reason: flagReason.trim() }),
      })

      if (!response.ok) throw new Error('Failed to flag')

      toast.success('Post flagged for review')
      setShowFlagDialog(false)
      setFlagReason('')
    } catch (error) {
      toast.error('Failed to flag post')
    }
  }

  const handleDelete = async () => {
    if (!canDeletePost) return

    setIsDeleting(true)

    try {
      const response = await fetch(\`/api/posts/\${post.id}\`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete post')

      toast.success('Post deleted')
      onPostDeleted?.()
    } catch (error) {
      toast.error('Failed to delete post')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const reactionCounts = getReactionCounts()

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.isAnonymous ? undefined : post.author?.image} />
              <AvatarFallback>
                {post.isAnonymous ? '?' : getDisplayName(post.author).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                {post.isAnonymous ? (
                  <>
                    <span className="font-semibold italic text-gray-600">Anonymous</span>
                    <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-600">
                      Anonymous
                    </Badge>
                  </>
                ) : (
                  <>
                    <span className="font-semibold">{getDisplayName(post.author)}</span>
                    <RoleBadge
                      role={post.author?.role}
                      isFounder={post.author?.isFounder}
                      isAdmin={post.author?.isAdmin}
                    />
                    {post.author?.politicalLeaning && (
                      <Badge
                        variant="secondary"
                        className={\`text-xs \${getPoliticalIdentifierColor(post.author.politicalLeaning)}\`}
                      >
                        {getPoliticalIdentifierLabel(post.author.politicalLeaning)}
                      </Badge>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                {showCommunity && post.community && (
                  <>
                    <span>•</span>
                    <span>in {post.community.name}</span>
                  </>
                )}
                {post.isPinned && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1 text-blue-600">
                      <Pin className="h-3 w-3" />
                      <span>Pinned</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {post.sourceUrl && (
                <DropdownMenuItem asChild>
                  <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Source
                  </a>
                </DropdownMenuItem>
              )}
              {currentUser && (
                <DropdownMenuItem onClick={() => setShowFlagDialog(true)}>
                  <Flag className="h-4 w-4 mr-2" />
                  Flag Post
                </DropdownMenuItem>
              )}
              {canDeletePost && (
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {post.title && (
            <h3 className="font-semibold text-lg leading-tight">{post.title}</h3>
          )}
          
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          {post.imageUrl && (
            <div className="relative rounded-lg overflow-hidden">
              <Image
                src={getImageUrl(post.imageUrl)}
                alt="Post image"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {post.sourceUrl && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">View source</span>
              </a>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReactionMenu(!showReactionMenu)}
                    className={userReaction ? reactionColors[userReaction as keyof typeof reactionColors] : ''}
                  >
                    {userReaction ? (
                      <>
                        {(() => {
                          const Icon = reactionIcons[userReaction as keyof typeof reactionIcons]
                          return <Icon className="h-4 w-4 mr-1" />
                        })()}
                        {reactionLabels[userReaction as keyof typeof reactionLabels]}
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        React
                      </>
                    )}
                  </Button>

                  {showReactionMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-lg p-2 flex space-x-1 z-10"
                    >
                      {Object.entries(reactionIcons).map(([type, Icon]) => (
                        <Tooltip key={type}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReaction(type)}
                              className={\`h-8 w-8 p-0 \${reactionColors[type as keyof typeof reactionColors]}\`}
                            >
                              <Icon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {reactionLabels[type as keyof typeof reactionLabels]}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </motion.div>
                  )}
                </div>
              </TooltipProvider>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                {comments.length}
              </Button>
            </div>

            {Object.entries(reactionCounts).length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {Object.entries(reactionCounts).map(([type, count]) => {
                  const Icon = reactionIcons[type as keyof typeof reactionIcons]
                  return (
                    <div key={type} className="flex items-center space-x-1">
                      <Icon className="h-3 w-3" />
                      <span>{count as number}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {showComments && (
            <div className="space-y-4 pt-4 border-t">
              {currentUser && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleComment}
                      disabled={isSubmittingComment || !newComment.trim()}
                      size="sm"
                    >
                      {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {comments.map((comment: any) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.isAnonymous ? undefined : comment.author?.image} />
                      <AvatarFallback className="text-xs">
                        {comment.isAnonymous ? '?' : getDisplayName(comment.author).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            {comment?.isAnonymous ? (
                              <>
                                <span className="font-medium text-sm italic text-gray-600">Anonymous</span>
                                <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-600">Anonymous</Badge>
                              </>
                            ) : (
                              <>
                                <span className="font-medium text-sm">{getDisplayName(comment?.author)}</span>
                                <RoleBadge
                                  role={comment?.author?.role}
                                  isFounder={comment?.author?.isFounder}
                                  isAdmin={comment?.author?.isAdmin}
                                />
                                {comment?.author?.politicalLeaning && (
                                  <Badge variant="secondary" className={\`text-xs \${getPoliticalIdentifierColor(comment.author.politicalLeaning)}\`}>
                                    {getPoliticalIdentifierLabel(comment.author.politicalLeaning)}
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {comments.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Post</DialogTitle>
            <DialogDescription>
              Please provide a reason for flagging this post. Our moderators will review it.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for flagging..."
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFlagDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleFlag} disabled={!flagReason.trim()}>
              Submit Flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this post? This action cannot be undone. All comments and reactions will also be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? 'Deleting...' : 'Delete Post'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
`;

fs.writeFileSync('components/dashboard/post-card.tsx', content, 'utf8');
console.log('Done! Lines written:', content.split('\n').length);