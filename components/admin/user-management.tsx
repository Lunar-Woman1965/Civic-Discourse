
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Users, Search, Trash2, Shield, Ban, Calendar, UserX, Eye, FileCheck, Crown, Mail, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getDisplayName } from '@/lib/display-name-utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

interface User {
  id: string
  email: string
  name: string
  firstName: string | null
  lastName: string | null
  username: string | null
  displayNamePreference: string | null
  politicalIdentifier: string
  joinedAt: string
  isAdmin: boolean
  role: string
  isBanned: boolean
  isActive: boolean
  emailVerified: Date | null
  hasVerificationToken: boolean
  verificationTokenExpired: boolean
  restrictionLevel: string
  postsCount: number
  commentsCount: number
  friendRequestsCount: number
}

export default function UserManagement() {
  const { data: session } = useSession() || {}
  const currentUserRole = session?.user?.role
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [userToBan, setUserToBan] = useState<User | null>(null)
  const [banning, setBanning] = useState(false)
  const [updatingRestrictions, setUpdatingRestrictions] = useState<Record<string, boolean>>({})
  const [resendingVerification, setResendingVerification] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === '') {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredUsers(
        users.filter(
          user =>
            user.email.toLowerCase().includes(query) ||
            user.name.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users)
        setFilteredUsers(data.users)
      } else {
        toast.error(data.error || 'Failed to fetch users')
      }
    } catch (error) {
      toast.error('Failed to fetch users')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestrictionChange = async (userId: string, restrictionLevel: string) => {
    try {
      setUpdatingRestrictions(prev => ({ ...prev, [userId]: true }))
      
      const response = await fetch(`/api/admin/users/${userId}/restrict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restrictionLevel })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'User restriction updated')
        // Update the user in the list
        setUsers(users.map(u => 
          u.id === userId ? { ...u, restrictionLevel } : u
        ))
      } else {
        toast.error(data.error || 'Failed to update restriction')
      }
    } catch (error) {
      toast.error('Failed to update restriction')
      console.error(error)
    } finally {
      setUpdatingRestrictions(prev => ({ ...prev, [userId]: false }))
    }
  }

  const handleBanClick = (user: User) => {
    setUserToBan(user)
    setBanDialogOpen(true)
  }

  const handleBanConfirm = async () => {
    if (!userToBan) return

    try {
      setBanning(true)
      const response = await fetch(`/api/admin/users/${userToBan.id}/ban`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('User permanently banned')
        // Update the user in the list
        setUsers(users.map(u => 
          u.id === userToBan.id ? { ...u, isBanned: true } : u
        ))
        setBanDialogOpen(false)
        setUserToBan(null)
      } else {
        toast.error(data.error || 'Failed to ban user')
      }
    } catch (error) {
      toast.error('Failed to ban user')
      console.error(error)
    } finally {
      setBanning(false)
    }
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('User permanently deleted from database')
        setUsers(users.filter(u => u.id !== userToDelete.id))
        setDeleteDialogOpen(false)
        setUserToDelete(null)
      } else {
        toast.error(data.error || 'Failed to delete user')
      }
    } catch (error) {
      toast.error('Failed to delete user')
      console.error(error)
    } finally {
      setDeleting(false)
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

  const getRoleBadge = (role: string) => {
    if (role === 'PLATFORM_FOUNDER') {
      return (
        <Badge className="bg-amber-100 text-amber-900 flex items-center gap-1 w-fit">
          <Crown className="h-3 w-3" />
          Platform Founder
        </Badge>
      )
    } else if (role === 'MODERATOR') {
      return (
        <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1 w-fit">
          <Shield className="h-3 w-3" />
          Moderator
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="w-fit">
        User
      </Badge>
    )
  }

  const canManageUser = (targetUser: User) => {
    // Platform Founder can manage everyone
    if (currentUserRole === 'PLATFORM_FOUNDER') {
      return true
    }
    // Moderators can only manage regular users
    if (currentUserRole === 'MODERATOR') {
      return targetUser.role === 'USER'
    }
    return false
  }

  const handleResendVerification = async (user: User) => {
    try {
      setResendingVerification(prev => ({ ...prev, [user.id]: true }))
      
      const response = await fetch(`/api/admin/users/${user.id}/resend-verification`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Verification email sent to ${data.email}`)
        // Refresh the user list to update token status
        fetchUsers()
      } else {
        toast.error(data.error || 'Failed to send verification email')
      }
    } catch (error) {
      toast.error('Failed to send verification email')
      console.error(error)
    } finally {
      setResendingVerification(prev => ({ ...prev, [user.id]: false }))
    }
  }

  const getStatusBadge = (user: User) => {
    // Priority: Banned > Inactive > Unverified > Verified
    if (user.isBanned) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
          <Ban className="h-3 w-3" />
          Banned
        </Badge>
      )
    }

    if (!user.isActive) {
      return (
        <Badge className="bg-gray-500 text-white flex items-center gap-1 w-fit">
          <UserX className="h-3 w-3" />
          Inactive
        </Badge>
      )
    }

    if (!user.emailVerified) {
      return (
        <Badge className="bg-yellow-500 text-white flex items-center gap-1 w-fit">
          <AlertTriangle className="h-3 w-3" />
          Unverified
        </Badge>
      )
    }

    return (
      <Badge className="bg-green-500 text-white flex items-center gap-1 w-fit">
        <CheckCircle className="h-3 w-3" />
        Verified
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">Loading users...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl text-[#2C1810]">
                <Users className="h-6 w-6 text-[#6B8E23]" />
                User Management
              </CardTitle>
              <CardDescription className="mt-2">
                View and manage all registered users
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {users.length} Total Users
            </Badge>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No users found matching your search' : 'No users yet'}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Political View</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-center">Posts</TableHead>
                    <TableHead className="text-center">Comments</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Restrictions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{getDisplayName(user)}</span>
                          </div>
                          <span className="text-sm text-gray-500">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getPoliticalColor(user.politicalIdentifier)} text-white`}>
                          {user.politicalIdentifier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {formatDistance(new Date(user.joinedAt), new Date(), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{user.postsCount}</TableCell>
                      <TableCell className="text-center">{user.commentsCount}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-2">
                          {getStatusBadge(user)}
                          {!user.emailVerified && user.isActive && !user.isBanned && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleResendVerification(user)}
                                    disabled={resendingVerification[user.id]}
                                    className="h-7 text-xs"
                                  >
                                    <Mail className="h-3 w-3 mr-1" />
                                    {resendingVerification[user.id] ? 'Sending...' : 'Resend'}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Resend verification email</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {canManageUser(user) && !user.isBanned ? (
                          <Select
                            value={user.restrictionLevel || 'none'}
                            onValueChange={(value) => handleRestrictionChange(user.id, value)}
                            disabled={updatingRestrictions[user.id]}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-green-600" />
                                  <span>No Restrictions</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="read_only">
                                <div className="flex items-center gap-2">
                                  <Eye className="h-4 w-4 text-orange-600" />
                                  <span>Read-Only</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="approval_required">
                                <div className="flex items-center gap-2">
                                  <FileCheck className="h-4 w-4 text-blue-600" />
                                  <span>Approval Required</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {canManageUser(user) ? (
                          <TooltipProvider>
                            <div className="flex items-center justify-end gap-2">
                              {!user.isBanned && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleBanClick(user)}
                                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                    >
                                      <UserX className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Permanently ban user (keeps account in database)</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(user)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Permanently delete user from database (cannot be undone)</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipProvider>
                        ) : (
                          <span className="text-sm text-gray-500">
                            {user.role === 'PLATFORM_FOUNDER' && 'Protected'}
                            {user.role === 'MODERATOR' && currentUserRole === 'MODERATOR' && 'No Permission'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ban Confirmation Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Ban User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently ban <strong>{userToBan && getDisplayName(userToBan)}</strong> ({userToBan?.email})?
              <br /><br />
              This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Prevent them from logging in</strong></li>
                <li><strong>Keep their account in the database</strong> (posts and comments remain)</li>
                <li><strong>Mark their status as "Permanently Banned"</strong></li>
                <li>They cannot reactivate their account</li>
              </ul>
              <br />
              <strong className="text-orange-600">To completely remove the account from the database, use the Delete action instead.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={banning}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBanConfirm}
              disabled={banning}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {banning ? 'Banning...' : 'Permanently Ban User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete User from Database?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to <strong className="text-red-600">permanently delete</strong> <strong>{userToDelete && getDisplayName(userToDelete)}</strong> ({userToDelete?.email}) <strong className="text-red-600">from the database</strong>?
              <br /><br />
              This will permanently remove from the database:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Their profile and account information</li>
                <li>All their posts ({userToDelete?.postsCount})</li>
                <li>All their comments ({userToDelete?.commentsCount})</li>
                <li>All their friendships and friend requests</li>
              </ul>
              <br />
              <strong className="text-red-600">This action cannot be undone. The account and all data will be permanently erased.</strong>
              <br /><br />
              <strong>Note:</strong> To ban a user but keep their data, use the Ban action instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting...' : 'Permanently Delete from Database'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
