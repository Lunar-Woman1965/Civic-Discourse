
'use client'

import { useState, useEffect } from 'react'
import { UserX, Search, RotateCcw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getDisplayName } from '@/lib/display-name-utils'
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

interface InactiveUser {
  id: string
  email: string
  name: string
  firstName: string | null
  lastName: string | null
  username: string | null
  displayNamePreference: string | null
  joinedAt: string
  deletedAt: string | null
  isPermanentlyBanned: boolean
  daysRemaining: number | null
  canReactivate: boolean
}

export default function InactiveAccounts() {
  const [inactiveUsers, setInactiveUsers] = useState<InactiveUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<InactiveUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false)
  const [userToReactivate, setUserToReactivate] = useState<InactiveUser | null>(null)
  const [reactivating, setReactivating] = useState(false)

  useEffect(() => {
    fetchInactiveUsers()
  }, [])

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === '') {
      setFilteredUsers(inactiveUsers)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredUsers(
        inactiveUsers.filter(
          user =>
            user.email.toLowerCase().includes(query) ||
            user.name?.toLowerCase().includes(query) ||
            user.username?.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, inactiveUsers])

  const fetchInactiveUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users?status=inactive')
      const data = await response.json()

      if (response.ok) {
        setInactiveUsers(data.users || [])
        setFilteredUsers(data.users || [])
      } else {
        toast.error(data.error || 'Failed to fetch inactive users')
      }
    } catch (error) {
      toast.error('Failed to fetch inactive users')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleReactivateClick = (user: InactiveUser) => {
    setUserToReactivate(user)
    setReactivateDialogOpen(true)
  }

  const confirmReactivate = async () => {
    if (!userToReactivate) return

    setReactivating(true)
    try {
      const response = await fetch(`/api/admin/users/${userToReactivate.id}/reactivate`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Account reactivated successfully!')
        // Refresh the list
        await fetchInactiveUsers()
      } else {
        toast.error(data.error || 'Failed to reactivate account')
      }
    } catch (error) {
      toast.error('Failed to reactivate account')
      console.error(error)
    } finally {
      setReactivating(false)
      setReactivateDialogOpen(false)
      setUserToReactivate(null)
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">Loading inactive accounts...</p>
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
                <UserX className="h-6 w-6 text-orange-600" />
                Inactive Accounts
              </CardTitle>
              <CardDescription className="mt-2">
                Manage deactivated and deleted user accounts
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {inactiveUsers.length} Inactive
            </Badge>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by email, name, or username..."
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
              {searchQuery ? 'No inactive accounts found matching your search' : 'No inactive accounts'}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Deleted</TableHead>
                    <TableHead>Grace Period</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{getDisplayName(user)}</span>
                          <span className="text-sm text-gray-500">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.deletedAt ? (
                          <span className="text-sm text-gray-600">
                            {formatDistance(new Date(user.deletedAt), new Date(), { addSuffix: true })}
                          </span>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Legacy
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.daysRemaining !== null && user.daysRemaining > 0 ? (
                          <Badge variant="default" className="bg-blue-500">
                            {user.daysRemaining} days left
                          </Badge>
                        ) : user.daysRemaining !== null && user.daysRemaining <= 0 ? (
                          <Badge variant="destructive">
                            Expired
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            No limit
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {user.isPermanentlyBanned ? (
                          <Badge variant="destructive">
                            Banned
                          </Badge>
                        ) : user.canReactivate ? (
                          <Badge variant="default" className="bg-green-500">
                            Can Reactivate
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Cannot Reactivate
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={user.canReactivate ? "default" : "outline"}
                          onClick={() => handleReactivateClick(user)}
                          disabled={!user.canReactivate}
                          className="gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reactivate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reactivate Confirmation Dialog */}
      <AlertDialog open={reactivateDialogOpen} onOpenChange={setReactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivate Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reactivate the account for{' '}
              <strong>{userToReactivate?.email}</strong>?
              <br /><br />
              This will restore their access and make their profile visible again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reactivating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReactivate}
              disabled={reactivating}
              className="bg-green-600 hover:bg-green-700"
            >
              {reactivating ? 'Reactivating...' : 'Yes, Reactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
