
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Database, Cookie, Eye, Lock, FileText, Mail } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Bridging the Aisle',
  description: 'Bridging the Aisle protects your privacy with honesty and care. No data selling, no tracking—just real conversation and respect for your information.',
}

export default async function PrivacyPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-blue-100 p-4 rounded-full">
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-earth-brown-900 mb-2">Privacy Policy</h1>
            <p className="text-lg text-earth-brown-600 max-w-2xl mx-auto">
              Your privacy matters—and so does your trust.
            </p>
          </div>
        </div>

        {/* Introduction */}
        <Card className="border-2 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-earth-brown-700 leading-relaxed text-center text-lg">
              Bridging the Aisle exists to make honest conversation possible, not to harvest personal data. 
              We collect only what's needed to keep this space safe, functional, and fair.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold text-earth-brown-900 mb-1">Account Details</h4>
                <p className="text-sm text-earth-brown-700">Username, email address, and password (encrypted).</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-turquoise-500">
                <h4 className="font-semibold text-earth-brown-900 mb-1">Activity Data</h4>
                <p className="text-sm text-earth-brown-700">Posts, comments, reports, and moderation actions (for transparency and enforcement).</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-olive-500">
                <h4 className="font-semibold text-earth-brown-900 mb-1">Technical Info</h4>
                <p className="text-sm text-earth-brown-700">IP address, device/browser type, basic logs (for security and abuse prevention).</p>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mt-4">
              <p className="font-semibold text-green-900 text-center">
                We do not sell, trade, or rent your personal data—ever.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-turquoise-100 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-turquoise-600" />
              </div>
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="bg-turquoise-100 rounded-full p-1 mt-0.5">
                  <div className="w-2 h-2 bg-turquoise-600 rounded-full" />
                </div>
                <span className="text-earth-brown-700">Verify accounts and manage participation</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-turquoise-100 rounded-full p-1 mt-0.5">
                  <div className="w-2 h-2 bg-turquoise-600 rounded-full" />
                </div>
                <span className="text-earth-brown-700">Investigate reports or rule violations</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-turquoise-100 rounded-full p-1 mt-0.5">
                  <div className="w-2 h-2 bg-turquoise-600 rounded-full" />
                </div>
                <span className="text-earth-brown-700">Send essential account or policy notices (no spam)</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-turquoise-100 rounded-full p-1 mt-0.5">
                  <div className="w-2 h-2 bg-turquoise-600 rounded-full" />
                </div>
                <span className="text-earth-brown-700">Maintain site performance and prevent misuse</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Cookies & Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Cookie className="h-6 w-6 text-orange-600" />
              </div>
              Cookies & Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-earth-brown-700 leading-relaxed">
              We use minimal cookies to remember logins and preferences; no ad trackers, no behavioral profiling. 
              You can clear cookies in your browser anytime.
            </p>
          </CardContent>
        </Card>

        {/* Who Can See Your Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              Who Can See Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-earth-brown-700 leading-relaxed">
              Limited access for authorized moderators/admins to do their jobs. We only share data when 
              legally required (e.g., a lawful court order).
            </p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-earth-brown-700 mb-3">You can:</p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-0.5">
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                </div>
                <span className="text-earth-brown-700">Request a copy of your data</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-0.5">
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                </div>
                <span className="text-earth-brown-700">Ask us to delete your account and related info</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-0.5">
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                </div>
                <span className="text-earth-brown-700">Update or correct your details</span>
              </li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-earth-brown-700">
                  Send requests to{' '}
                  <a href="mailto:privacyBTA@outlook.com" className="text-blue-600 hover:underline font-medium">
                    privacyBTA@outlook.com
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Database className="h-6 w-6 text-indigo-600" />
              </div>
              Data Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-earth-brown-700 leading-relaxed">
              We keep account and content data only as long as necessary for transparency and enforcement. 
              When you delete your account, it's removed from public view immediately and purged from our 
              systems within 30 days.
            </p>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-earth-brown-700 leading-relaxed">
              We use encryption and access controls to protect your info; still, no system is perfect. 
              Use strong passwords; don't share personal details publicly.
            </p>
          </CardContent>
        </Card>

        {/* Updates to This Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Updates to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-earth-brown-700 leading-relaxed">
              If we make major changes, we'll update this page and notify you in-app or by email. 
              Continued use of Bridging the Aisle means you accept the revised policy.
            </p>
          </CardContent>
        </Card>

        {/* Questions or Concerns */}
        <Card className="bg-blue-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-blue-600" />
              Questions or Concerns?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-earth-brown-700 leading-relaxed mb-4">
              We take privacy seriously. Email{' '}
              <a href="mailto:privacyBTA@outlook.com" className="text-blue-600 hover:underline font-medium">
                privacyBTA@outlook.com
              </a>{' '}
              and a human will respond.
            </p>
          </CardContent>
        </Card>

        {/* Closing Statement */}
        <Card className="bg-gradient-to-r from-turquoise-50 to-blue-50 border-2 border-turquoise-200">
          <CardContent className="pt-6 text-center">
            <p className="text-xl font-semibold text-earth-brown-900 mb-2">
              We built Bridging the Aisle for conversation, not collection.
            </p>
            <p className="text-earth-brown-700">
              Your words matter here; your personal information stays yours.
            </p>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex justify-center gap-4 pt-4 pb-8">
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/community-standards">Community Standards</Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
