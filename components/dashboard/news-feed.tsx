
'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  MessageCircle, 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  Brain, 
  HandHeart, 
  Image as ImageIcon,
  Send,
  Filter,
  Users
} from 'lucide-react'
import { motion } from 'framer-motion'
import PostCard from './post-card'
import CreatePostForm from './create-post-form'
import GroupsSidebar from './groups-sidebar'
import TrendingSidebar from '@/components/TrendingSidebar'
import RecommendationsSidebar from './recommendations-sidebar'
import InternationalNewsSidebar from './international-news-sidebar'
import { FederatedContentSidebar } from './federated-content-sidebar'

interface NewsFeedProps {
  initialPosts: any[]
  currentUser: any
  groups: any[]
  highlightedPostId?: string
}

export default function NewsFeed({ initialPosts, currentUser, groups, highlightedPostId }: NewsFeedProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [filter, setFilter] = useState('all')
  const [viewFilter, setViewFilter] = useState('all-views')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const postRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Scroll to highlighted post when component mounts
  useEffect(() => {
    if (highlightedPostId && postRefs.current[highlightedPostId]) {
      setTimeout(() => {
        postRefs.current[highlightedPostId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }, 300)
    }
  }, [highlightedPostId])

  // Determine if a post is from a similar or different political leaning
  const getPoliticalAlignment = (postAuthorLeaning: string | null) => {
    if (!postAuthorLeaning || !currentUser?.politicalLeaning) return 'other'
    
    const userLeaning = currentUser.politicalLeaning.toLowerCase()
    const authorLeaning = postAuthorLeaning.toLowerCase()
    
    if (userLeaning === authorLeaning) return 'similar'
    
    // Group similar leanings
    const leftLeanings = ['progressive', 'democratic-socialist', 'liberal']
    const rightLeanings = ['conservative', 'libertarian']
    const centerLeanings = ['centrist', 'independent']
    
    const userInLeft = leftLeanings.includes(userLeaning)
    const userInRight = rightLeanings.includes(userLeaning)
    const userInCenter = centerLeanings.includes(userLeaning)
    
    const authorInLeft = leftLeanings.includes(authorLeaning)
    const authorInRight = rightLeanings.includes(authorLeaning)
    const authorInCenter = centerLeanings.includes(authorLeaning)
    
    if ((userInLeft && authorInLeft) || (userInRight && authorInRight) || (userInCenter && authorInCenter)) {
      return 'similar'
    }
    
    return 'different'
  }

  const filteredPosts = posts?.filter(post => {
    // First apply topic filter
    let passesTopicFilter = true
    if (filter === 'friends') passesTopicFilter = post?.authorId !== currentUser?.id
    else if (filter === 'my-posts') passesTopicFilter = post?.authorId === currentUser?.id
    else if (filter !== 'all') passesTopicFilter = post?.politicalTags?.includes(filter)
    
    if (!passesTopicFilter) return false
    
    // Then apply political view filter
    if (viewFilter === 'all-views') return true
    
    const alignment = getPoliticalAlignment(post?.author?.politicalLeaning)
    if (viewFilter === 'similar-views') return alignment === 'similar'
    if (viewFilter === 'different-views') return alignment === 'different'
    
    return true
  }) ?? []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Feed */}
      <div className="lg:col-span-3 space-y-6">
        {/* Pinned Filters Card - Top of Page */}
        <Card className="sticky top-0 z-10 shadow-md bg-white border-2 border-turquoise-200">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Topic Filter */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Filter className="h-5 w-5 text-turquoise-600" />
                  <span className="text-sm font-medium">Topic Filter:</span>
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Posts</SelectItem>
                    <SelectItem value="friends">Friends' Posts</SelectItem>
                    <SelectItem value="my-posts">My Posts</SelectItem>
                    <SelectItem value="environment">Environmental</SelectItem>
                    <SelectItem value="economy">Economic</SelectItem>
                    <SelectItem value="social">Social Issues</SelectItem>
                    <SelectItem value="foreign">Foreign Policy</SelectItem>
                    <SelectItem value="health">Healthcare</SelectItem>
                    <SelectItem value="reproductive-health">Reproductive Health</SelectItem>
                    <SelectItem value="veterans">Veterans' Affairs</SelectItem>
                    <SelectItem value="homelessness">Homelessness</SelectItem>
                    <SelectItem value="food-security">Food Security</SelectItem>
                    <SelectItem value="employment">Employment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Political View Filter */}
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center space-x-4">
                  <Users className="h-5 w-5 text-turquoise-600" />
                  <span className="text-sm font-medium">Political Views:</span>
                </div>
                <Select value={viewFilter} onValueChange={setViewFilter}>
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-views">All Views</SelectItem>
                    <SelectItem value="similar-views">Similar Views</SelectItem>
                    <SelectItem value="different-views">Different Views</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters Display */}
              {(viewFilter !== 'all-views' || filter !== 'all') && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 pt-2 border-t">
                  <span className="font-medium">Active filters:</span>
                  <div className="flex gap-2 flex-wrap">
                    {filter !== 'all' && (
                      <Badge variant="secondary" className="text-xs bg-turquoise-100 text-turquoise-800">
                        {filter === 'friends' ? 'Friends' : 
                         filter === 'my-posts' ? 'My Posts' : 
                         filter === 'food-security' ? 'Food Security' :
                         filter === 'reproductive-health' ? 'Reproductive Health' :
                         filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
                      </Badge>
                    )}
                    {viewFilter !== 'all-views' && (
                      <Badge variant="secondary" className="text-xs bg-pale-copper-100 text-pale-copper-800">
                        {viewFilter === 'similar-views' ? 'Similar Views' : 'Different Views'}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Post Form */}
        <CreatePostForm 
          currentUser={currentUser} 
          onPostCreated={(newPost) => setPosts([newPost, ...posts])}
        />

        {/* Posts Feed */}
        <div className="space-y-6">
          {filteredPosts?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500">Be the first to start a discussion!</p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts?.map((post, index) => (
              <motion.div
                key={post?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                ref={(el) => {
                  if (post?.id) {
                    postRefs.current[post.id] = el
                  }
                }}
                className={highlightedPostId === post?.id ? 'ring-4 ring-creamy-tan-400 rounded-lg' : ''}
              >
                <PostCard 
                  post={post} 
                  currentUser={currentUser} 
                  isHighlighted={post?.id === highlightedPostId}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <FederatedContentSidebar />
        <InternationalNewsSidebar />
        <RecommendationsSidebar currentUser={currentUser} />
        <TrendingSidebar />
        <GroupsSidebar groups={groups} />
      </div>
    </div>
  )
}
