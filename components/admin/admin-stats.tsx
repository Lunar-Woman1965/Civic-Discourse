'use client'

import { useState, useEffect } from 'react'
import { Users, FileText, MessageSquare, AlertTriangle, Ban, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Stats {
  totalUsers: number
  totalPosts: number
  totalComments: number
  totalViolations: number
  pendingViolations: number
  activeSuspensions: number
  permanentBans: number
  violationsLast7Days: number
  violationsLast30Days: number
  violationsByType: Array<{ type: string; count: number }>
  recentUsers: Array<{
    id: string
    name: string | null
    email: string
    joinedAt: string
    violationCount: number
  }>
}

interface AdminStatsProps {
  onNavigateToUsers: () => void
}

export default function AdminStats({ onNavigateToUsers }: AdminStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading statistics...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-xl">
        <p className="text-gray-600">Failed to load statistics</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-[#6B8E23]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2C1810]">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pendingViolations}</div>
            <p className="text-xs text-gray-600 mt-1">Need review</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suspensions</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.activeSuspensions}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permanent Bans</CardTitle>
            <Ban className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.permanentBans}</div>
          </CardContent>
        </Card>
      </div>

      {/* Content Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-lg">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2C1810]">{stats.totalPosts}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-lg">Total Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2C1810]">{stats.totalComments}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-lg">Total Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.totalViolations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Violation Trends */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle>Violation Trends</CardTitle>
          <CardDescription>Recent violation activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last 7 Days</span>
              <span className="text-2xl font-bold text-[#2C1810]">{stats.violationsLast7Days}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last 30 Days</span>
              <span className="text-2xl font-bold text-[#2C1810]">{stats.violationsLast30Days}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Violations by Type */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle>Violations by Type</CardTitle>
          <CardDescription>Breakdown of violation categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.violationsByType.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <span className="text-gray-700 capitalize">
                  {item.type?.replace(/_/g, ' ') || 'Unknown'}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6B8E23]"
                      style={{
                        width: `${(item.count / stats.totalViolations) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-[#2C1810] w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Users */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent New Users</CardTitle>
              <CardDescription>Latest users to join the platform</CardDescription>
            </div>
            <Button 
              onClick={onNavigateToUsers}
              variant="outline"
              className="flex items-center gap-2 border-[#6B8E23] text-[#6B8E23] hover:bg-[#6B8E23] hover:text-white transition-colors"
            >
              View All Users
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-[#2C1810]">{user.name || 'Unnamed User'}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500">
                    Joined {new Date(user.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  {user.violationCount > 0 ? (
                    <span className="text-red-600 font-semibold">
                      {user.violationCount} violation{user.violationCount > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-[#6B8E23]">Clean record</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
