

'use client'

import { useState, useEffect } from 'react'
import { FileCheck, ThumbsUp, ThumbsDown, MessageSquare, FileText, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDisplayName } from '@/lib/display-name-utils'
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
import toast from 'react-hot-toast'
import { formatDistance } from 'date-fns'

interface Post {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    email: string
    name: string
    firstName: string | null
    lastName: string | null
    username: string | null
    displayNamePreference: string | null
    politicalLeaning: string
    restrictionLevel: string
  }
  _count: {
    comments: number
    reactions: number
  }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    email: string
    name: string
    firstName: string | null
    lastName: string | null
    username: string | null
    displayNamePreference: string | null
    politicalLeaning: string
    restrictionLevel: string
  }
  post: {
    id: string
    content: string
    author: {
      name: string
    }
  }
  _count: {
    reactions: number
  }
}

export default function ContentApprovalQueue() {
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [selectedContent, setSelectedContent] = useState<{ type: 'post' | 'comment', id: string, content: string } | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchPendingContent()
  }, [])

  const fetchPendingContent = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/content/pending')
      const data = await response.json()

      if (response.ok) {
        setPosts(data.posts)
        setComments(data.comments)
      } else {
        toast.error(data.error || 'Failed to fetch pending content')
      }
    } catch (error) {
      toast.error('Failed to fetch pending content')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = (type: 'post' | 'comment', id: string, content: string, action: 'approve' | 'reject') => {
    setSelectedContent({ type, id, content })
    setActionType(action)
    setActionDialogOpen(true)
  }

  const confirmAction = async () => {
    if (!selectedContent) return

    try {
      setProcessing(true)
      const endpoint = selectedContent.type === 'post' 
        ? '/api/admin/content/approve-post'
        : '/api/admin/content/approve-comment'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [selectedContent.type === 'post' ? 'postId' : 'commentId']: selectedContent.id,
          action: actionType
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        
        // Remove from list
        if (selectedContent.type === 'post') {
          setPosts(posts.filter(p => p.id !== selectedContent.id))
        } else {
          setComments(comments.filter(c => c.id !== selectedContent.id))
        }

        setActionDialogOpen(false)
        setSelectedContent(null)
      } else {
        toast.error(data.error || `Failed to ${actionType} ${selectedContent.type}`)
      }
    } catch (error) {
      toast.error(`Failed to ${actionType} ${selectedContent?.type}`)
      console.error(error)
    } finally {
      setProcessing(false)
    }
  }

  const getPoliticalColor = (identifier: string) => {
    const colors: Record<string, string> = {
      'Far Left': 'bg-blue-600',
      'Left': 'bg-blue-500',
      'Center-Left': 'bg-blue-400',
      'Center': 'bg-purple-500',
      'Center-Right': 'bg-red-400',
      'Right': 'bg-red-500',
      'Far Right': 'bg-red-600',
    }
    return colors[identifier] || 'bg-gray-400'
  }

  const totalPending = posts.length + comments.length

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">Loading pending content...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCheck className="h-6 w-6 text-[#6B8E23]" />
                <div>
                  <h2 className="text-2xl font-bold text-[#2C1810]">Content Approval Queue</h2>
                  <p className="text-sm text-gray-600 mt-1">Review and approve content from restricted users</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {totalPending} Pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        {totalPending === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
            <CardContent className="py-12 text-center">
              <FileCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No pending content to review</p>
              <p className="text-sm text-gray-500 mt-2">All content has been approved or rejected</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pending Posts */}
            {posts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#2C1810] flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Pending Posts ({posts.length})
                </h3>
                {posts.map((post) => (
                  <Card key={post.id} className="bg-white/90 backdrop-blur-sm shadow-lg">
                    <CardContent className="p-4 space-y-3">
                      {/* Author Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{getDisplayName(post.author)}</span>
                          <Badge className={`${getPoliticalColor(post.author.politicalLeaning)} text-white text-xs`}>
                            {post.author.politicalLeaning}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {post.author.restrictionLevel === 'approval_required' ? 'Needs Approval' : 'Restricted'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDistance(new Date(post.createdAt), new Date(), { addSuffix: true })}
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-sm text-gray-700 line-clamp-4">{post.content}</p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{post._count.comments} comments</span>
                        <span>{post._count.reactions} reactions</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleAction('post', post.id, post.content, 'approve')}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAction('post', post.id, post.content, 'reject')}
                          className="flex-1"
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pending Comments */}
            {comments.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#2C1810] flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Pending Comments ({comments.length})
                </h3>
                {comments.map((comment) => (
                  <Card key={comment.id} className="bg-white/90 backdrop-blur-sm shadow-lg">
                    <CardContent className="p-4 space-y-3">
                      {/* Author Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{getDisplayName(comment.author)}</span>
                          <Badge className={`${getPoliticalColor(comment.author.politicalLeaning)} text-white text-xs`}>
                            {comment.author.politicalLeaning}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {comment.author.restrictionLevel === 'approval_required' ? 'Needs Approval' : 'Restricted'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDistance(new Date(comment.createdAt), new Date(), { addSuffix: true })}
                        </div>
                      </div>

                      {/* Original Post Context */}
                      <div className="bg-gray-50 rounded p-2 text-xs text-gray-600">
                        <span className="font-medium">On post: </span>
                        <span className="line-clamp-1">{comment.post.content}</span>
                      </div>

                      {/* Comment Content */}
                      <p className="text-sm text-gray-700 line-clamp-3">{comment.content}</p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{comment._count.reactions} reactions</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleAction('comment', comment.id, comment.content, 'approve')}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAction('comment', comment.id, comment.content, 'reject')}
                          className="flex-1"
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} {selectedContent?.type === 'post' ? 'Post' : 'Comment'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve' ? (
                <>
                  This will make the content visible to all users and notify the author that their content was approved.
                </>
              ) : (
                <>
                  This will permanently delete the content and notify the author that it was rejected.
                  <br /><br />
                  <strong className="text-red-600">This action cannot be undone.</strong>
                </>
              )}
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                <strong>Content:</strong>
                <p className="mt-1 text-gray-700 line-clamp-3">{selectedContent?.content}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={processing}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {processing ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
