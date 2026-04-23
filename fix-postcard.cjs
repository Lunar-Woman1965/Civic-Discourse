const fs = require('fs');

const content = `'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
import { getImageUrl } from '@/lib/utils'
import { getDisplayName, getAvatarFallback } from '@/lib/display-name-utils'
import { QuoteDisplay } from './quote-display'
import { MentionTextarea } from './mention-textarea'
import { Quote as QuoteIcon } from 'lucide-react'
import BlueskyControls from './bluesky-controls'

interface PostCardProps {
  post: any
  currentUser: any
  onDelete?: (postId: string) => void
  isHighlighted?: boolean
}

export default function PostCard({ post, currentUser, onDelete, isHighlighted }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [reactions, setReactions] = useState(post?.reactions ?? [])
  const [comments, setComments] = useState(post?.comments ?? [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editContent, setEditContent] = useState(post?.content ?? '')
  const [isEditing, setIsEditing] = useState(false)
  const [currentPost, setCurrentPost] = useState(post)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentText, setEditCommentText] = useState('')
  const [isEditingComment, setIsEditingComment] = useState(false)
  const [quotedText, setQuotedText] = useState(null)
  const [quotedAuthorId, setQuotedAuthorId] = useState(null)
  const [replyingToCommentId, setReplyingToCommentId] = useState(null)

  useEffect(() => {
    if (isHighlighted) {
      setShowComments(true)
    }
  }, [isHighlighted])

  const reactionTypes = [
    { type: 'like', icon: ThumbsUp, label: 'Like', color: 'text-green-500' },
    { type: 'dislike', icon: ThumbsDown, label: 'Dislike', color: 'text-red-500' },
    { type: 'care', icon: HeartHandshake, label: 'Care/Support', color: 'text-pink-500' },
    { type: 'mad', icon: Frown, label: 'Mad', color: 'text-orange-500' },
    { type: 'angry', icon: Flame, label: 'Angry', color: 'text-red-600' },
    { type: 'horrified', icon: Skull, label: 'Horrified', color: 'text-gray-700' }
  ]

  const handleReaction = async (reactionType) => {
    try {
      const response = await fetch('/api/posts/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post?.id, type: reactionType })
      })
      if (response.ok) {
        const existingReaction = reactions?.find((r) => r?.userId === currentUser?.id && r?.postId === post?.id)
        if (existingReaction) {
          if (existingReaction.type === reactionType) {
            setReactions(reactions?.filter((r) => r?.id !== existingReaction.id))
          } else {
            setReactions(reactions?.map((r) => r?.id === existingReaction.id ? { ...r, type: reactionType } : r))
          }
        } else {
          setReactions([...reactions, { id: Date.now().toString(), type: reactionType, userId: currentUser?.id, postId: post?.id, user: { id: currentUser?.id, name: currentUser?.name } }])
        }
        toast.success('Reaction added!')
      }
    } catch (error) {
      toast.error('Failed to react')
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText?.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/posts/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post?.id, content: commentText, parentId: replyingToCommentId, quotedText, quotedAuthorId })
      })
      if (response.ok) {
        const newComment = await response.json()
        setComments([newComment, ...comments])
        setCommentText('')
        setQuotedText(null)
        setQuotedAuthorId(null)
        setReplyingToCommentId(null)
        toast.success('Comment posted!')
      }
    } catch (error) {
      toast.error('Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuotePost = () => {
    const selection = window.getSelection()
    const selectedText = selection?.toString().trim()
    if (selectedText && selectedText.length > 0) {
      setQuotedText(selectedText)
      setQuotedAuthorId(currentPost?.authorId)
    } else {
      setQuotedText((currentPost?.content || '').substring(0, 200))
      setQuotedAuthorId(currentPost?.authorId)
    }
    setShowComments(true)
  }

  const handleQuoteComment = (comment) => {
    const selection = window.getSelection()
    const selectedText = selection?.toString().trim()
    if (selectedText && selectedText.length > 0) {
      setQuotedText(selectedText)
    } else {
      setQuotedText((comment?.content || '').substring(0, 200))
    }
    setQuotedAuthorId(comment?.authorId)
    setReplyingToCommentId(comment?.id)
    setShowComments(true)
  }

  const clearQuote = () => {
    setQuotedText(null)
    setQuotedAuthorId(null)
    setReplyingToCommentId(null)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(\`/api/posts/\${post?.id}/delete\`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('Post deleted successfully!')
        setShowDeleteDialog(false)
        if (onDelete) onDelete(post?.id)
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete post')
      }
    } catch (error) {
      toast.error('Failed to delete post')
    } finally {
      setIsDeleting(false)
    }
  }
                  {canDeletePost && (
                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600 focus:text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />Delete Post
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {currentPost?.quotedText && (
          <QuoteDisplay quotedText={currentPost.quotedText} quotedAuthor={currentPost.quotedAuthor} />
        )}
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-900 whitespace-pre-wrap">{currentPost?.content}</p>
        </div>
        {currentPost?.imageUrl && (
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <Image src={currentPost.imageUrl} alt="Post image" fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
          </div>
        )}
        {currentPost?.sourceCitation && (
          <div className="p-3 bg-turquoise-50 rounded-lg border-l-4 border-turquoise-500">
            <div className="flex items-center space-x-2">
              <ExternalLink className="h-4 w-4 text-turquoise-600" />
              <span className="text-sm font-medium text-turquoise-900">Source:</span>
            </div>
            <a href={currentPost.sourceCitation} target="_blank" rel="noopener noreferrer" className="text-sm text-turquoise-700 hover:underline break-all">
              {currentPost.sourceCitation}
            </a>
          </div>
        )}
        {currentPost?.politicalTags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {currentPost.politicalTags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">#{tag}</Badge>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t">
          <TooltipProvider>
            <div className="flex items-center space-x-2">
              {reactionTypes?.map((reaction) => {
                const Icon = reaction.icon
                const count = reactions?.filter((r) => r?.type === reaction.type)?.length ?? 0
                const isActive = userReaction?.type === reaction.type
                return (
                  <Tooltip key={reaction.type}>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => handleReaction(reaction.type)} className={\`flex items-center space-x-1 \${isActive ? reaction.color : 'text-gray-600 hover:text-gray-900'}\`}>
                        <Icon className="h-4 w-4" />
                        {count > 0 && <span className="text-xs">{count}</span>}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{reaction.label}</p></TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </TooltipProvider>
          <div className="flex items-center space-x-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-xs">{post?._count?.comments ?? 0}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Comment</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleQuotePost} className="flex items-center space-x-1">
                  <QuoteIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Quote & Reply</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm"><Flag className="h-4 w-4" /></Button>
              </TooltipTrigger>
              <TooltipContent><p>Report</p></TooltipContent>
            </Tooltip>
          </div>
        </div>

        {currentUser && (
          <div className="border-t pt-3 mt-3">
            <BlueskyControls
              postId={currentPost?.id}
              postAuthorId={currentPost?.authorId}
              currentUserId={currentUser?.id}
              postContent={currentPost?.content || ''}
              atprotoUri={currentPost?.atprotoUri}
              atprotoBroadcastedAt={currentPost?.atprotoBroadcastedAt}
              atprotoSyncedAt={currentPost?.atprotoSyncedAt}
              atprotoLikeCount={currentPost?.atprotoLikeCount}
              atprotoRepostCount={currentPost?.atprotoRepostCount}
              atprotoReplyCount={currentPost?.atprotoReplyCount}
              atprotoEngagementSyncedAt={currentPost?.atprotoEngagementSyncedAt}
              onBroadcastSuccess={() => window.location.reload()}
              onSyncSuccess={() => window.location.reload()}
            />
          </div>
        )}

        {showComments && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }} className="border-t pt-4 space-y-4">
            <form onSubmit={handleComment} className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={getImageUrl(currentUser?.profileImage) || getImageUrl(currentUser?.image)} />
                <AvatarFallback>{getAvatarFallback(currentUser)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                {quotedText && (
                  <div className="relative">
                    <QuoteDisplay quotedText={quotedText} quotedAuthor={quotedAuthorId === currentPost?.authorId ? currentPost?.author : comments?.find((c) => c?.authorId === quotedAuthorId)?.author} />
                    <Button type="button" variant="ghost" size="sm" onClick={clearQuote} className="absolute top-2 right-2">Clear</Button>
                  </div>
                )}
                <MentionTextarea placeholder="Share your thoughts respectfully... (use @ to mention someone)" value={commentText} onChange={setCommentText} className="min-h-[60px] resize-none" minRows={2} />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={!commentText?.trim() || isSubmitting}>
                    {isSubmitting ? 'Posting...' : 'Comment'}
                  </Button>
                </div>
              </div>
            </form>

            <div className="space-y-4">
              {comments?.map((comment) => {
                const isEditingThisComment = editingCommentId === comment?.id
                const canEditComment = comment?.authorId === currentUser?.id
                return (
                  <div key={comment?.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      {comment?.isAnonymous ? (
                        <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">?</AvatarFallback>
                      ) : (
                        <>
                          <AvatarImage src={getImageUrl(comment?.author?.profileImage)} />
                          <AvatarFallback>{getAvatarFallback(comment?.author)}</AvatarFallback>
                        </>
                      )}
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
                                {comment?.author?.isAdmin && (
                                  <>
                                    {comment?.author?.isFounder ? (
                                      <Badge variant="secondary" className="text-xs font-semibold border" style={{ background: 'linear-gradient(135deg, #CFD8DD, #D5D7EA, #CFD3D6)', color: '#8FA1B5', borderColor: '#CFD3D6' }}>
                                        Founder
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="text-xs font-semibold bg-blue-100 text-blue-800 border-blue-200">
                                        ���️ Moderator
                                      </Badge>
                                    )}
                                  </>
                                )}
                                {comment?.author?.politicalLeaning && (
                                  <Badge variant="secondary" className={\`text-xs \${getPoliticalIdentifierColor(comment.author.politicalLeaning)}\`}>
                                    {getPoliticalIdentifierLabel(comment.author.politicalLeaning)}
                                  </Badge>
                                )}
                                {comment?.isFromBluesky && (
                                  <Badge variant="outline" className="text-xs bg-sky-50 text-sky-700 border-sky-300">
                                    {comment?.atprotoAuthorHandle ? \`@\${comment.atprotoAuthorHandle} (Bluesky)\` : 'From Bluesky'}
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                          {canEditComment && !isEditingThisComment && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => { setEditingCommentId(comment?.id); setEditCommentText(comment?.content ?? '') }} className="h-6 px-2">
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Edit comment</p></TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        {isEditingThisComment ? (
                          <div className="space-y-2">
                            <Textarea value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} className="min-h-[60px] resize-none text-sm" />
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" size="sm" onClick={() => { setEditingCommentId(null); setEditCommentText('') }} disabled={isEditingComment}>Cancel</Button>
                              <Button size="sm" onClick={() => handleEditComment(comment?.id)} disabled={!editCommentText?.trim() || isEditingComment}>
                                {isEditingComment ? 'Saving...' : 'Save'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {comment?.quotedText && (
                              <div className="mb-2">
                                <QuoteDisplay quotedText={comment.quotedText} quotedAuthor={comment.quotedAuthor} />
                              </div>
                            )}
                            <p className="text-sm text-gray-900">{comment?.content}</p>
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment?.createdAt ?? new Date()))} ago
                          {comment?.editedAt && <span className="text-xs text-gray-400 ml-2">(edited)</span>}
                        </span>
                        <TooltipProvider>
                          <div className="flex items-center space-x-2">
                            {reactionTypes?.slice(0, 3)?.map((reaction) => {
                              const Icon = reaction.icon
                              return (
                                <Tooltip key={reaction.type}>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 px-2"><Icon className="h-3 w-3" /></Button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>{reaction.label}</p></TooltipContent>
                                </Tooltip>
                              )
                            })}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => handleQuoteComment(comment)}>
                                  <QuoteIcon className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Quote & Reply</p></TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-3 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Enjoying the conversation?{' '}
                <a href="/support" className="hover:underline font-medium" style={{ color: '#8FA1B5' }}>
                  Support BTA →
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </CardContent>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>Make changes to your post. Remember to maintain civil and respectful discourse.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder="What's on your mind?" className="min-h-[150px] resize-none" />
            <p className="text-xs text-gray-500">Changes will be reviewed by our content moderation system to ensure compliance with community standards.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditContent(currentPost?.content ?? '') }} disabled={isEditing}>Cancel</Button>
            <Button onClick={handleEdit} disabled={!editContent?.trim() || isEditing}>{isEditing ? 'Saving...' : 'Save Changes'}</Button>
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
