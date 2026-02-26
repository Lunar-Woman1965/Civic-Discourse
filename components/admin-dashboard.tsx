'use client'

import { useState } from 'react'
import { Shield, Users, AlertTriangle, Ban, Eye, CheckCircle, XCircle, ArrowLeft, Home, UserX, FileCheck, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import toast from 'react-hot-toast'
import Link from 'next/link'
import ViolationsList from './admin/violations-list'
import AdminStats from './admin/admin-stats'
import UserManagement from './admin/user-management'
import InactiveAccounts from './admin/inactive-accounts'
import ContentApprovalQueue from './admin/content-approval-queue'
import RetentionDashboard from './admin/retention-dashboard'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B7355] via-[#D4C5B0] to-[#6B8E23] py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-xl mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-[#6B8E23]" />
              <h1 className="text-3xl font-bold text-[#2C1810]">Admin Dashboard</h1>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center gap-2 border-[#6B8E23] text-[#6B8E23] hover:bg-[#6B8E23] hover:text-white transition-colors">
                <Home className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <p className="text-gray-600">
            Monitor user behavior, review violations, and maintain community standards
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#6B8E23] data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="retention" className="data-[state=active]:bg-[#6B8E23] data-[state=active]:text-white">
              Retention
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-[#6B8E23] data-[state=active]:text-white">
              User Management
            </TabsTrigger>
            <TabsTrigger value="inactive" className="data-[state=active]:bg-[#6B8E23] data-[state=active]:text-white">
              Inactive Accounts
            </TabsTrigger>
            <TabsTrigger value="approval" className="data-[state=active]:bg-[#6B8E23] data-[state=active]:text-white">
              Content Approval
            </TabsTrigger>
            <TabsTrigger value="violations" className="data-[state=active]:bg-[#6B8E23] data-[state=active]:text-white">
              Violations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminStats onNavigateToUsers={() => setActiveTab('users')} />
          </TabsContent>

          <TabsContent value="retention">
            <RetentionDashboard />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="inactive">
            <InactiveAccounts />
          </TabsContent>

          <TabsContent value="approval">
            <ContentApprovalQueue />
          </TabsContent>

          <TabsContent value="violations">
            <ViolationsList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
