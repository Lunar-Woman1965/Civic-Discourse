
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, MessageCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface GroupsSidebarProps {
  groups: any[]
}

export default function GroupsSidebar({ groups }: GroupsSidebarProps) {
  const getPoliticalFocusColor = (focus: string | null | undefined) => {
    switch (focus?.toLowerCase()) {
      case 'environmental': return 'bg-green-100 text-green-800'
      case 'economic': return 'bg-turquoise-100 text-turquoise-800'
      case 'constitutional': return 'bg-purple-100 text-purple-800'
      case 'social': return 'bg-pale-copper-100 text-pale-copper-800'
      case 'foreign': return 'bg-orange-100 text-orange-800'
      default: return 'bg-earth-brown-100 text-earth-brown-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Group CTA */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center">
            <Users className="h-5 w-5 mr-2 text-turquoise-600" />
            Political Groups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full mb-4" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Start your own discussion community
          </p>
        </CardContent>
      </Card>

      {/* Active Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Popular Groups</CardTitle>
          <p className="text-sm text-gray-600">Join discussions on trending topics</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {groups?.slice(0, 6)?.map((group, index) => (
              <motion.div
                key={group?.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={`/groups/${group?.id}`}>
                  <div className="p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                        {group?.name}
                      </h4>
                      {group?.politicalFocus && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ml-2 ${getPoliticalFocusColor(group.politicalFocus)}`}
                        >
                          {group.politicalFocus}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {group?.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {group?._count?.members ?? 0} members
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {group?._count?.posts ?? 0} posts
                        </span>
                      </div>
                      {!group?.isPrivate && (
                        <Badge variant="outline" className="text-xs">
                          Public
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            
            {groups?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No groups available</p>
                <p className="text-xs">Be the first to create one!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Community Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Groups</span>
              <span className="font-medium">{groups?.length ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Members</span>
              <span className="font-medium">
                {groups?.reduce((sum, group) => sum + (group?._count?.members ?? 0), 0) ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Discussions</span>
              <span className="font-medium">
                {groups?.reduce((sum, group) => sum + (group?._count?.posts ?? 0), 0) ?? 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
