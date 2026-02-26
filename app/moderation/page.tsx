
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, AlertTriangle, CheckCircle, Clock, BookOpen } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Moderation Center | Bridging the Aisle',
  description: 'Fairness, respect, and accountability matter here. Learn how Bridging the Aisle handles warnings, suspensions, and appeals—with real people, not algorithms.',
}

export default async function ModerationPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Moderation Center</h1>
              <p className="text-gray-600">Community guidelines and content moderation</p>
            </div>
          </div>
          <Button asChild variant="outline" className="flex items-center gap-2">
            <Link href="/community-standards">
              <BookOpen className="h-4 w-4" />
              View Community Standards
            </Link>
          </Button>
        </div>

        {/* Community Standards Banner */}
        <Card className="bg-gradient-to-r from-turquoise-50 to-blue-50 border-turquoise-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-turquoise-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-turquoise-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-earth-brown-900 mb-1">
                  Our Community Standards
                </h3>
                <p className="text-sm text-earth-brown-700 mb-3">
                  Built on Integrity, Accountability, and Respect—the foundation of meaningful dialogue.
                </p>
                <Button asChild size="sm">
                  <Link href="/community-standards">
                    Read Full Standards
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Community Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Community Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-medium text-green-900">Respectful Dialogue</h4>
                  <p className="text-sm text-green-700">Treat all community members with dignity and respect</p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-medium text-blue-900">Fact-Based Discussions</h4>
                  <p className="text-sm text-blue-700">Support your arguments with credible sources and evidence</p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-medium text-purple-900">Stay On Topic</h4>
                  <p className="text-sm text-purple-700">Keep discussions relevant and constructive</p>
                </div>
                
                <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <h4 className="font-medium text-orange-900">No Personal Attacks</h4>
                  <p className="text-sm text-orange-700">Focus on ideas and policies, not personalities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                Content Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No reports pending</p>
                <p className="text-xs">Keep up the great work maintaining civility!</p>
              </div>
            </CardContent>
          </Card>

          {/* Moderation History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-600" />
                Moderation History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No moderation actions</p>
                <p className="text-xs">You have a clean record!</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How to Report */}
        <Card>
          <CardHeader>
            <CardTitle>How to Report Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h4 className="font-medium mb-2">Identify</h4>
                <p className="text-sm text-gray-600">Find content that violates our guidelines</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium mb-2">Report</h4>
                <p className="text-sm text-gray-600">Click the flag icon to report the content</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium mb-2">Review</h4>
                <p className="text-sm text-gray-600">Our team will review and take appropriate action</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
