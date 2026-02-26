
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, MessageCircle, Plus, Search, Globe, Eye, EyeOff, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getImageUrl } from '@/lib/utils'

interface GroupsGridProps {
  groups: any[]
  currentUser: any
}

export default function GroupsGrid({ groups, currentUser }: GroupsGridProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null)
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    politicalFocus: '',
    privacyLevel: 'PUBLIC'
  })

  const filteredGroups = groups?.filter(group =>
    group?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group?.politicalFocus?.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? []

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newGroup.name?.trim() || !newGroup.description?.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup)
      })

      if (response.ok) {
        const createdGroup = await response.json()
        toast.success('Group created successfully!')
        setIsCreateDialogOpen(false)
        setNewGroup({ name: '', description: '', politicalFocus: '', privacyLevel: 'PUBLIC' })
        // Navigate to the new group page
        router.push(`/groups/${createdGroup.id}`)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to create group')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const handleJoinGroup = async (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    setJoiningGroupId(groupId)
    
    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Joined group successfully!')
        router.push(`/groups/${groupId}`)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to join group')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setJoiningGroupId(null)
    }
  }

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

  const getPrivacyInfo = (level: string | null | undefined) => {
    switch (level) {
      case 'PUBLIC':
        return { icon: Globe, label: 'Public', color: 'bg-green-100 text-green-700 border-green-200' }
      case 'PRIVATE_DISCOVERABLE':
        return { icon: Eye, label: 'Private', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
      case 'PRIVATE_HIDDEN':
        return { icon: EyeOff, label: 'Hidden', color: 'bg-red-100 text-red-700 border-red-200' }
      default:
        return { icon: Globe, label: 'Public', color: 'bg-green-100 text-green-700 border-green-200' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Political Groups</h1>
            <p className="text-gray-600">Join discussions on specific political topics</p>
          </div>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  placeholder="Enter group name..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  placeholder="Describe your group..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="politicalFocus">Political Focus</Label>
                <Select value={newGroup.politicalFocus} onValueChange={(value) => setNewGroup({...newGroup, politicalFocus: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select focus area..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Environmental">Environmental</SelectItem>
                    <SelectItem value="Economic">Economic</SelectItem>
                    <SelectItem value="Constitutional">Constitutional</SelectItem>
                    <SelectItem value="Social">Social Issues</SelectItem>
                    <SelectItem value="Foreign">Foreign Policy</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="privacyLevel">Privacy Level</Label>
                <Select value={newGroup.privacyLevel} onValueChange={(value) => setNewGroup({...newGroup, privacyLevel: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select privacy level..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public - Anyone can find and join</SelectItem>
                    <SelectItem value="PRIVATE_DISCOVERABLE">Private (Discoverable) - Visible in search, admin approval needed</SelectItem>
                    <SelectItem value="PRIVATE_HIDDEN">Private (Hidden) - Not visible in search, invitation only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Group</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups?.map((group, index) => (
          <motion.div
            key={group?.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card 
              className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => router.push(`/groups/${group?.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 mb-2">{group?.name}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      {group?.politicalFocus && (
                        <Badge className={`text-xs ${getPoliticalFocusColor(group.politicalFocus)}`}>
                          {group.politicalFocus}
                        </Badge>
                      )}
                      {(() => {
                        const privacyInfo = getPrivacyInfo(group?.privacyLevel)
                        const PrivacyIcon = privacyInfo.icon
                        return (
                          <Badge variant="outline" className={`text-xs ${privacyInfo.color}`}>
                            <PrivacyIcon className="h-3 w-3 mr-1" />
                            {privacyInfo.label}
                          </Badge>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {group?.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {group?._count?.members ?? 0}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {group?._count?.posts ?? 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={getImageUrl(group?.creator?.profileImage)} />
                      <AvatarFallback className="text-xs">
                        {group?.creator?.name?.[0]?.toUpperCase() ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={(e) => handleJoinGroup(group?.id, e)}
                  disabled={joiningGroupId === group?.id}
                >
                  {joiningGroupId === group?.id ? 'Joining...' : 'Join Group'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        
        {filteredGroups?.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No groups found</p>
            <p className="text-sm">Try adjusting your search or create a new group</p>
          </div>
        )}
      </div>
    </div>
  )
}
