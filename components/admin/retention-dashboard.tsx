'use client'

import { useState, useEffect } from 'react'
import { Users, TrendingUp, Activity, Calendar, ArrowUpRight, ArrowDownRight, UserCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface RetentionData {
  dau: number
  wau: number
  mau: number
  totalUsers: number
  verifiedUsers: number
  unverifiedUsers: number
  signupFunnel: {
    verifiedAndNeverReturned: number
    verifiedAndReturnedOnce: number
    verifiedAndActive: number
    returnRateAfterVerification: number
    avgDaysToReturn: number
  }
  cohorts: Array<{
    month: string
    totalUsers: number
    activeInLast7Days: number
    activeInLast30Days: number
    retention7Day: number
    retention30Day: number
  }>
  engagementDistribution: Array<{
    segment: string
    user_count: bigint
  }>
  activityTrends: Array<{
    date: string
    activeUsers: number
  }>
  stickinessRatio: number
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']

export default function RetentionDashboard() {
  const [data, setData] = useState<RetentionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRetentionData()
  }, [])

  const fetchRetentionData = async () => {
    try {
      const res = await fetch('/api/admin/retention')
      if (res.ok) {
        const retentionData = await res.json()
        setData(retentionData)
      }
    } catch (error) {
      console.error('Error fetching retention data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading retention data...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-xl">
        <p className="text-gray-600">Failed to load retention data</p>
      </div>
    )
  }

  // Prepare engagement distribution data for chart
  const engagementChartData = data.engagementDistribution.map((item) => ({
    segment: item.segment.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    users: Number(item.user_count),
  }))

  return (
    <div className="space-y-6">
      {/* === KEY METRIC: Signup → Verification → Return === */}
      <Card className="bg-gradient-to-r from-[#6B8E23] to-[#8B7355] text-white shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <UserCheck className="h-6 w-6" />
            User Return After Verification (Your Key Metric)
          </CardTitle>
          <CardDescription className="text-white/80">
            Tracking whether users come back after signing up and verifying their email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white/80 text-sm mb-1">Never Returned</div>
              <div className="text-3xl font-bold">{data.signupFunnel.verifiedAndNeverReturned}</div>
              <div className="text-white/60 text-xs mt-1">
                {data.verifiedUsers > 0
                  ? Math.round((data.signupFunnel.verifiedAndNeverReturned / data.verifiedUsers) * 100)
                  : 0}% of verified users
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white/80 text-sm mb-1">Returned Once</div>
              <div className="text-3xl font-bold">{data.signupFunnel.verifiedAndReturnedOnce}</div>
              <div className="text-white/60 text-xs mt-1">
                {data.verifiedUsers > 0
                  ? Math.round((data.signupFunnel.verifiedAndReturnedOnce / data.verifiedUsers) * 100)
                  : 0}% of verified users
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white/80 text-sm mb-1">Active Users (Multiple Logins)</div>
              <div className="text-3xl font-bold">{data.signupFunnel.verifiedAndActive}</div>
              <div className="text-white/60 text-xs mt-1">
                {data.verifiedUsers > 0
                  ? Math.round((data.signupFunnel.verifiedAndActive / data.verifiedUsers) * 100)
                  : 0}% of verified users
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white/80 text-sm mb-1">Overall Return Rate</div>
              <div className="text-4xl font-bold">{data.signupFunnel.returnRateAfterVerification}%</div>
              <div className="text-white/60 text-xs mt-1">
                Of verified users who logged in at least once
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white/80 text-sm mb-1">Avg. Days to Return</div>
              <div className="text-4xl font-bold">{data.signupFunnel.avgDaysToReturn}</div>
              <div className="text-white/60 text-xs mt-1">
                Time between verification and first return
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DAU/WAU/MAU Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
            <Activity className="h-4 w-4 text-[#6B8E23]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2C1810]">{data.dau}</div>
            <p className="text-xs text-gray-600 mt-1">
              {data.totalUsers > 0 ? Math.round((data.dau / data.totalUsers) * 100) : 0}% of total users
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Active Users</CardTitle>
            <Calendar className="h-4 w-4 text-[#6B8E23]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2C1810]">{data.wau}</div>
            <p className="text-xs text-gray-600 mt-1">
              {data.totalUsers > 0 ? Math.round((data.wau / data.totalUsers) * 100) : 0}% of total users
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Active Users</CardTitle>
            <Users className="h-4 w-4 text-[#6B8E23]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2C1810]">{data.mau}</div>
            <p className="text-xs text-gray-600 mt-1">
              {data.totalUsers > 0 ? Math.round((data.mau / data.totalUsers) * 100) : 0}% of total users
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stickiness Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#6B8E23]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2C1810]">{data.stickinessRatio}</div>
            <p className="text-xs text-gray-600 mt-1">DAU/WAU (higher is better)</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Trends Chart */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle>Daily Active Users (Last 30 Days)</CardTitle>
          <CardDescription>User activity trend over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.activityTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="activeUsers"
                stroke="#6B8E23"
                strokeWidth={2}
                name="Active Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cohort Retention Table */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle>Cohort Retention Analysis</CardTitle>
          <CardDescription>Retention rates by signup month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Month</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Users</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Active (7d)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Active (30d)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">7-Day Retention</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">30-Day Retention</th>
                </tr>
              </thead>
              <tbody>
                {data.cohorts.map((cohort, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{cohort.month}</td>
                    <td className="text-right py-3 px-4 text-gray-700">{cohort.totalUsers}</td>
                    <td className="text-right py-3 px-4 text-gray-700">{cohort.activeInLast7Days}</td>
                    <td className="text-right py-3 px-4 text-gray-700">{cohort.activeInLast30Days}</td>
                    <td className="text-right py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          cohort.retention7Day >= 50
                            ? 'bg-green-100 text-green-800'
                            : cohort.retention7Day >= 25
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {cohort.retention7Day}%
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          cohort.retention30Day >= 50
                            ? 'bg-green-100 text-green-800'
                            : cohort.retention30Day >= 25
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {cohort.retention30Day}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Distribution */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle>User Engagement Distribution (Last 30 Days)</CardTitle>
          <CardDescription>How active are your users?</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="segment" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#6B8E23" name="Number of Users" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Never Active:</strong> No activity in last 30 days</p>
            <p><strong>One Time:</strong> 1 activity</p>
            <p><strong>Casual:</strong> 2-5 activities</p>
            <p><strong>Regular:</strong> 6-20 activities</p>
            <p><strong>Power User:</strong> 20+ activities</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
