
import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Users, Shield, MessageSquare, FileText, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How It Works - Guide to Civil Political Discourse | Bridging the Aisle',
  description: 'Learn how Bridging the Aisle works: create an account, join groups, engage in discussions with Democrats and Republicans, cite sources, and participate in moderated civil discourse on climate, healthcare, economy, and more.',
  openGraph: {
    title: 'How Bridging the Aisle Works',
    description: 'Step-by-step guide to engaging in civil political discussions',
    type: 'website',
  },
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-creamy-tan-50">
      {/* Header */}
      <header className="bg-white border-b border-earth-brown-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link href="/" className="text-2xl font-bold text-earth-brown-800">
            CivilPolitics
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-earth-brown-900 mb-4">
            How Bridging the Aisle Works
          </h1>
          <p className="text-xl text-earth-brown-700">
            A step-by-step guide to engaging in respectful political discourse
          </p>
        </div>

        {/* Step 1 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-turquoise-100 rounded-lg text-turquoise-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-earth-brown-800 mb-3">
                Step 1: Create Your Account
              </h2>
              <p className="text-earth-brown-700 mb-4">
                Sign up with your email and create a secure account. You'll identify your political views (Progressive, Liberal, Moderate, Conservative, Libertarian, or Independent) to help foster transparent discussions. Your email is never shared publicly.
              </p>
              <div className="bg-creamy-tan-50 rounded p-4">
                <p className="text-sm text-earth-brown-600">
                  <strong>Privacy Note:</strong> Your political affiliation is optional and can be changed at any time in your profile settings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-turquoise-100 rounded-lg text-turquoise-600">
              <Users className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-earth-brown-800 mb-3">
                Step 2: Join Groups & Connect with Others
              </h2>
              <p className="text-earth-brown-700 mb-4">
                Explore topic-based groups focused on issues that matter to you:
              </p>
              <ul className="list-disc pl-6 text-earth-brown-700 space-y-2 mb-4">
                <li>Climate Change & Environmental Policy</li>
                <li>Healthcare Reform</li>
                <li>Economic Policy & Taxes</li>
                <li>Immigration & Border Security</li>
                <li>Education & Student Debt</li>
                <li>Veterans Affairs</li>
                <li>And many more...</li>
              </ul>
              <p className="text-earth-brown-700">
                Groups can be public (open to all), private (require approval), or hidden (invitation-only). Connect with friends and follow users whose perspectives you find valuable.
              </p>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-turquoise-100 rounded-lg text-turquoise-600">
              <MessageSquare className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-earth-brown-800 mb-3">
                Step 3: Create Posts & Engage in Discussions
              </h2>
              <p className="text-earth-brown-700 mb-4">
                Share your thoughts on political issues through posts. You can:
              </p>
              <ul className="list-disc pl-6 text-earth-brown-700 space-y-2 mb-4">
                <li>Write posts of any length (no character limits)</li>
                <li>Tag posts with relevant topics (#climate-change, #healthcare, etc.)</li>
                <li>Choose political viewpoints your post addresses</li>
                <li>React to others' posts with various reactions</li>
                <li>Comment on posts to join the conversation</li>
              </ul>
              <div className="bg-creamy-tan-50 rounded p-4">
                <p className="text-sm text-earth-brown-600">
                  <strong>Tip:</strong> Use our filter system to view posts from specific political perspectives or topics to broaden your understanding.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-turquoise-100 rounded-lg text-turquoise-600">
              <FileText className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-earth-brown-800 mb-3">
                Step 4: Cite Your Sources
              </h2>
              <p className="text-earth-brown-700 mb-4">
                When sharing news or making factual claims, include a source citation (URL). We encourage citing credible sources from diverse perspectives to ensure discussions are grounded in facts.
              </p>
              <div className="bg-amber-50 rounded p-4 border border-amber-200">
                <p className="text-sm text-amber-900">
                  <strong>Source Policy:</strong> Only one link per post is clickable to prevent spam. Choose your most authoritative source. This helps maintain quality discourse.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 5 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-turquoise-100 rounded-lg text-turquoise-600">
              <Shield className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-earth-brown-800 mb-3">
                Step 5: Follow Community Standards
              </h2>
              <p className="text-earth-brown-700 mb-4">
                Our Community Standards ensure respectful dialogue:
              </p>
              <ul className="list-disc pl-6 text-earth-brown-700 space-y-2 mb-4">
                <li><strong>Stay Civil:</strong> No personal attacks, harassment, or hate speech</li>
                <li><strong>Source Your Claims:</strong> Back up assertions with credible sources</li>
                <li><strong>Focus on Ideas:</strong> Debate policies and ideas, not people</li>
                <li><strong>Respect Privacy:</strong> Don't share others' personal information</li>
                <li><strong>Report Violations:</strong> Help us maintain standards by reporting inappropriate content</li>
              </ul>
              <p className="text-earth-brown-700">
                Violations result in warnings, temporary bans, or permanent removal depending on severity. All moderation decisions can be appealed.
              </p>
            </div>
          </div>
        </div>

        {/* Step 6 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-turquoise-100 rounded-lg text-turquoise-600">
              <Globe className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-earth-brown-800 mb-3">
                Step 6: Explore Global Perspectives
              </h2>
              <p className="text-earth-brown-700 mb-4">
                Use our international news sidebar to access reputable news outlets from around the world. Understanding how other countries report on global issues can provide valuable context for domestic political discussions.
              </p>
              <p className="text-earth-brown-700">
                The sidebar includes outlets from Europe, Asia, Middle East, Africa, Latin America, and Oceania, helping you develop a well-rounded view of international events and their impact on U.S. politics.
              </p>
            </div>
          </div>
        </div>

        {/* Key Features Summary */}
        <div className="bg-gradient-to-br from-turquoise-50 to-creamy-tan-100 rounded-lg p-8 mb-8 border border-turquoise-200">
          <h2 className="text-2xl font-semibold text-earth-brown-800 mb-6">
            Key Features That Make Us Different
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-turquoise-700 mb-2">Trending Topics</h3>
              <p className="text-sm text-earth-brown-700">
                See what political issues are being discussed most actively on the platform
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-turquoise-700 mb-2">Recommendations</h3>
              <p className="text-sm text-earth-brown-700">
                Discover users with diverse perspectives to broaden your political understanding
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-turquoise-700 mb-2">Notifications</h3>
              <p className="text-sm text-earth-brown-700">
                Stay updated on replies, reactions, friend requests, and group activity
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-turquoise-700 mb-2">Moderation Tools</h3>
              <p className="text-sm text-earth-brown-700">
                Report violations and trust our moderation team to maintain civil discourse
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-3xl font-bold text-earth-brown-800 mb-4">
            Ready to Bridge the Aisle?
          </h2>
          <p className="text-lg text-earth-brown-700 mb-6">
            Join thousands of Democrats, Republicans, and Independents in meaningful political discourse
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-turquoise-600 hover:bg-turquoise-700 text-white">
                Create Free Account
              </Button>
            </Link>
            <Link href="/faq">
              <Button size="lg" variant="outline" className="border-turquoise-600 text-turquoise-700 hover:bg-turquoise-50">
                Read FAQ
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-earth-brown-200 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center text-sm text-earth-brown-600">
            <p>© 2025 CivilPolitics. Built for respectful political dialogue.</p>
            <div className="flex gap-6">
              <Link href="/community-standards/public" className="hover:text-turquoise-600">
                Community Standards
              </Link>
              <Link href="/privacy/public" className="hover:text-turquoise-600">
                Privacy Policy
              </Link>
              <Link href="/about" className="hover:text-turquoise-600">
                About
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
