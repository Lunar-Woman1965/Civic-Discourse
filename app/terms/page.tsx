
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Flag, Shield } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Terms of Service - Bridging the Aisle',
  description: 'Terms of Service and eligibility requirements for Bridging the Aisle platform',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-creamy-tan-50 to-creamy-tan-200">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-turquoise-100 p-4 rounded-full">
              <FileText className="h-12 w-12 text-turquoise-600" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-earth-brown-900 mb-2">Terms of Service</h1>
            <p className="text-lg text-earth-brown-600 max-w-2xl mx-auto">
              Terms and eligibility requirements for participating in Bridging the Aisle
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="border-2 border-turquoise-200">
          <CardContent className="pt-6 space-y-8">
            {/* Eligibility Requirements Section */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <Flag className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-earth-brown-900 mb-3">Eligibility Requirements</h2>
                  <div className="space-y-4 text-earth-brown-700 leading-relaxed">
                    <p>
                      Participation on Bridging the Aisle is limited to individuals who are U.S. citizens. 
                      Because BtA is designed for U.S. civic and policy discussions, only U.S. citizens are 
                      permitted to create accounts, post, vote, or engage in platform activities.
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                      <p className="font-semibold text-blue-900 mb-2">Verification Process</p>
                      <p className="text-blue-800">
                        Verification of citizenship may be requested. Any submitted documentation must be 
                        redacted, is reviewed briefly for confirmation, and is deleted immediately. BtA does 
                        not store or retain citizenship documents or identifying numbers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Requirements Section */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-turquoise-100 p-2 rounded-lg flex-shrink-0">
                  <Shield className="h-6 w-6 text-turquoise-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-earth-brown-900 mb-3">Account Requirements</h2>
                  <div className="space-y-3 text-earth-brown-700">
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li>You must be at least 18 years old to create an account</li>
                      <li>You must provide accurate and truthful information</li>
                      <li>You are responsible for maintaining the security of your account</li>
                      <li>One person, one account - multiple accounts are not permitted</li>
                      <li>Accounts may be suspended or terminated for violations of our policies</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* User Conduct Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-earth-brown-900">User Conduct</h2>
              <div className="text-earth-brown-700 space-y-3">
                <p>
                  By using Bridging the Aisle, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Follow our <Link href="/community-standards/public" className="text-turquoise-600 hover:underline font-medium">Community Standards</Link></li>
                  <li>Respect the <Link href="/privacy/public" className="text-turquoise-600 hover:underline font-medium">Privacy Policy</Link></li>
                  <li>Engage in civil, fact-based discourse</li>
                  <li>Not impersonate others or misrepresent your identity</li>
                  <li>Not use the platform for spam, harassment, or illegal activities</li>
                </ul>
              </div>
            </div>

            {/* Content Policy Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-earth-brown-900">Content Policy</h2>
              <div className="text-earth-brown-700 space-y-3">
                <p>
                  All content you post on Bridging the Aisle:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Must comply with applicable laws and regulations</li>
                  <li>Should be relevant to political and civic discussions</li>
                  <li>Will be subject to moderation for policy violations</li>
                  <li>May be removed if it violates our standards</li>
                  <li>You retain ownership of your content, but grant us license to display it</li>
                </ul>
              </div>
            </div>

            {/* Privacy and Data Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-earth-brown-900">Privacy and Data</h2>
              <div className="text-earth-brown-700 space-y-3">
                <p>
                  Your privacy is important to us. Please review our{' '}
                  <Link href="/privacy/public" className="text-turquoise-600 hover:underline font-medium">
                    Privacy Policy
                  </Link>{' '}
                  for details on how we collect, use, and protect your information.
                </p>
                <p>
                  Key points:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>We collect only necessary information for platform operation</li>
                  <li>Your data is never sold to third parties</li>
                  <li>You can export or delete your data at any time</li>
                  <li>Citizenship verification documents are never stored</li>
                </ul>
              </div>
            </div>

            {/* Termination Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-earth-brown-900">Account Termination</h2>
              <div className="text-earth-brown-700 space-y-3">
                <p>
                  We reserve the right to suspend or terminate accounts that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Violate these Terms of Service</li>
                  <li>Breach our Community Standards</li>
                  <li>Engage in harmful or illegal activities</li>
                  <li>Provide false information about eligibility</li>
                </ul>
                <p>
                  You may deactivate your account at any time from your account settings. Deactivated 
                  accounts can be reactivated within 30 days. After 30 days, accounts may be permanently 
                  deleted.
                </p>
              </div>
            </div>

            {/* Changes to Terms Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-earth-brown-900">Changes to These Terms</h2>
              <div className="text-earth-brown-700 space-y-3">
                <p>
                  We may update these Terms of Service from time to time. Significant changes will be 
                  communicated through the platform. Your continued use of Bridging the Aisle after 
                  changes are posted constitutes acceptance of the updated terms.
                </p>
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-earth-brown-900">Contact</h2>
              <div className="text-earth-brown-700">
                <p>
                  If you have questions about these Terms of Service, please contact us at{' '}
                  <a href="mailto:support@bridgingtheaisle.com" className="text-turquoise-600 hover:underline font-medium">
                    support@bridgingtheaisle.com
                  </a>
                </p>
              </div>
            </div>

            {/* Last Updated */}
            <div className="pt-6 border-t border-earth-brown-200">
              <p className="text-sm text-earth-brown-500 text-center">
                Last updated: November 15, 2025
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
