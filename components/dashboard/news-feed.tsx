'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Filter,
  Users,
  HeartHandshake
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

function SupportBTASidebarCard() {
  return (
    <Card className="border-creamy-tan-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-earth-brown-900">
          <HeartHandshake className="h-5 w-5 text-turquoise-600" />
          Support BTA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-earth-brown-700">
          Help this space stay independent. No big tech. No data mining. Just civic discourse.
        </p>

        <div className="mt-4">
          <Button asChild className="w-full bg-turquoise-600 hover:bg-turquoise-700">
            <Link href="/support">Support BTA</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function NewsFeed({
  initialPosts,
  currentUser,
  groups,
  highlightedPostId
}: NewsFeedProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [filter, setFilter] = useState('all')
  const [viewFilter, setViewFilter] = useState('all-views')
  const postRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

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

  const getPoliticalAlignment = (postAuthorLeaning: string | null) => {
    if (!postAuthorLeaning || !currentUser?.politicalLeaning) return 'other'

    const userLeaning = currentUser.politicalLeaning.toLowerCase()
    const authorLeaning = postAuthorLeaning.toLowerCase()

    if (userLeaning === authorLeaning) return 'similar'

    const leftLeanings = ['progressive', 'democratic-socialist', 'liberal']
    const rightLeanings = ['conservative', 'libertarian']
    const centerLeanings = ['centrist', 'independent']

    const userInLeft = leftLeanings.includes(userLeaning)
    const userInRight = rightLeanings.includes(userLeaning)
    const userInCenter = centerLeanings.includes(userLeaning)

    const authorInLeft = leftLeanings.includes(authorLeaning)
    const authorInRight = rightLeanings.includes(authorLeaning)
    const authorInCenter = centerLeanings.includes(authorLeaning)

    if (
      (userInLeft && authorInLeft) ||
      (userInRight && authorInRight) ||
      (userInCenter && authorInCenter)
    ) {
      return 'similar'
    }

    return 'different'
  }

  const filteredPosts =
    posts?.filter((post) => {
      let passesTopicFilter = true

      if (filter === 'friends') passesTopicFilter = post?.authorId !== currentUser?.id
      else if (filter === 'my-posts') passesTopicFilter = post?.authorId === currentUser?.id
      else if (filter !== 'all') passesTopicFilter = post?.politicalTags?.includes(filter)

      if (!passesTopicFilter) return false

      if (viewFilter === 'all-views') return true

      const alignment = getPoliticalAlignment(post?.author?.politicalLeaning)
      if (viewFilter === 'similar-views') return alignment === 'similar'
      if (viewFilter === 'different-views') return alignment === 'different'

      return true
    }) ?? []

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <div className="space-y-6 lg:col-span-3">
        <Card className="sticky top-0 z-10 border-2 border-turquoise-200 bg-white shadow-md">
          <CardContent className="pt-6">
            <div className="space-y-4">
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
                    <SelectItem value="friends">Friends&apos; Posts</SelectItem>
                    <SelectItem value="my-posts">My Posts</SelectItem>
                    <SelectItem value="environment">Environmental</SelectItem>
                    <SelectItem value="economy">Economic</SelectItem>
                    <SelectItem value="social">Social Issues</SelectItem>
                    <SelectItem value="foreign">Foreign Policy</SelectItem>
                    <SelectItem value="health">Healthcare</SelectItem>
                    <SelectItem value="reproductive-health">Reproductive Health</SelectItem>
                    <SelectItem value="veterans">Veterans&apos; Affairs</SelectItem>
                    <SelectItem value="homelessness">Homelessness</SelectItem>
                    <SelectItem value="food-security">Food Security</SelectItem>
                    <SelectItem value="employment">Employment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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

              {(viewFilter !== 'all-views' || filter !== 'all') && (
                <div className="flex items-center space-x-2 border-t pt-2 text-sm text-gray-600">
                  <span className="font-medium">Active filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {filter !== 'all' && (
                      <Badge
                        variant="secondary"
                        className="bg-turquoise-100 text-xs text-turquoise-800"
                      >
                        {filter === 'friends'
                          ? 'Friends'
                          : filter === 'my-posts'
                            ? 'My Posts'
                            : filter === 'food-security'
                              ? 'Food Security'
                              : filter === 'reproductive-health'
                                ? 'Reproductive Health'
                                : filter.charAt(0).toUpperCase() +
                                  filter.slice(1).replace('-', ' ')}
                      </Badge>
                    )}
                    {viewFilter !== 'all-views' && (
                      <Badge
                        variant="secondary"
                        className="bg-pale-copper-100 text-xs text-pale-copper-800"
                      >
                        {viewFilter === 'similar-views'
                          ? 'Similar Views'
                          : 'Different Views'}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <CreatePostForm
          currentUser={currentUser}
          onPostCreated={(newPost) => setPosts([newPost, ...posts])}
        />

        <div className="space-y-6">
          {filteredPosts?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">No posts yet</h3>
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
                className={
                  highlightedPostId === post?.id
                    ? 'rounded-lg ring-4 ring-creamy-tan-400'
                    : ''
                }
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

      <div className="space-y-6 lg:col-span-1">
        <SupportBTASidebarCard />
        <FederatedContentSidebar />
        <InternationalNewsSidebar />
        <RecommendationsSidebar currentUser={currentUser} />
        <TrendingSidebar />
        <GroupsSidebar groups={groups} />
      </div>
    </div>
  )
}