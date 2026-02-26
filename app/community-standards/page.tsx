
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Scale, Flag } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community Standards | Bridging the Aisle',
  description: 'Bridging the Aisle is built on integrity, accountability, and respect. These community standards keep conversation real, civil, and worth showing up for.',
}

export default async function CommunityStandardsPage() {
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
            <div className="bg-turquoise-100 p-4 rounded-full">
              <Scale className="h-12 w-12 text-turquoise-600" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-earth-brown-900 mb-2">Community Standards</h1>
            <p className="text-lg text-earth-brown-600 max-w-2xl mx-auto">
              Bridging the Aisle was built for real conversation—grounded, respectful, and honest.
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="border-2 border-turquoise-200">
          <CardContent className="pt-6 space-y-8">
            {/* Introduction */}
            <div className="prose prose-lg max-w-none">
              <p className="text-earth-brown-700 leading-relaxed">
                These standards aren't about control; they're about keeping discussion worth having. 
                Integrity, accountability, and respect are the backbone of this space. Without them, 
                the bridge collapses.
              </p>
            </div>

            {/* Integrity */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-earth-brown-900 mb-2">Integrity</h2>
                  <p className="text-earth-brown-700 leading-relaxed">
                    This space only works if people can trust what's said. That means owning your 
                    words, correcting your mistakes, and showing up with consistency—not convenience.
                  </p>
                </div>
              </div>
            </div>

            {/* Accountability */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-olive-100 p-2 rounded-lg flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-olive-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-earth-brown-900 mb-2">Accountability</h2>
                  <p className="text-earth-brown-700 leading-relaxed">
                    Words have impact. If you cross a line, own it. If you make a mistake, correct 
                    it. We're all adults here—dodging blame or shifting focus won't fly. Growth comes 
                    from taking responsibility, not deflecting it.
                  </p>
                </div>
              </div>
            </div>

            {/* Respect */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-turquoise-100 p-2 rounded-lg flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-turquoise-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-earth-brown-900 mb-2">Respect</h2>
                  <p className="text-earth-brown-700 leading-relaxed">
                    Debate ideas, not people. You can disagree without demeaning or insulting. 
                    Everyone here gets a fair hearing—no name-calling, no mockery, no cheap shots. 
                    Civility isn't weakness; it's proof you can stay human in a hard conversation.
                  </p>
                </div>
              </div>
            </div>

            {/* Who BtA is For */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-3">
                <Flag className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <h2 className="text-xl font-bold text-earth-brown-900">Who BtA is For</h2>
              </div>
              <div className="space-y-3 text-earth-brown-700 leading-relaxed">
                <p>
                  Bridging the Aisle is designed specifically for <strong>U.S. citizens</strong> who want to 
                  engage in civil, productive political conversation. The platform is focused on U.S. governance, 
                  policy, civic issues, and electoral systems.
                </p>
                <p>
                  To protect the integrity and purpose of these discussions, <strong>membership and posting 
                  privileges are limited to U.S. citizens</strong>. Verification may be requested if citizenship 
                  is unclear.
                </p>
              </div>
            </div>

            {/* Age Requirement */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-earth-brown-900 mb-2">Age Requirement</h2>
              <p className="text-earth-brown-700 leading-relaxed">
                You must be at least 18 years old to join and participate on Bridging the Aisle. 
                This age requirement is in place because political discussions may involve mature 
                topics and graphic content. Additionally, voting eligibility begins at 18, aligning 
                our community with civic participation standards.
              </p>
            </div>

            {/* Call to Action */}
            <div className="bg-turquoise-50 border-2 border-turquoise-200 rounded-lg p-6 text-center space-y-4">
              <p className="text-xl font-semibold text-earth-brown-900">
                Let's "Bridge the Aisle" together.
              </p>
              <p className="text-earth-brown-700">
                By joining, you agree to follow these standards and help keep this space constructive.
              </p>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-center gap-4 pt-4">
              <Button asChild variant="outline">
                <Link href="/dashboard">Back to Home</Link>
              </Button>
              <Button asChild>
                <Link href="/moderation">View Moderation Center</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card id="faq" className="border-2 border-turquoise-200">
          <CardHeader>
            <CardTitle className="text-2xl text-earth-brown-900">Frequently Asked Questions (FAQ)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-earth-brown-900 mb-2">What is Bridging the Aisle (BTA)?</h3>
                <p className="text-earth-brown-700">
                  Bridging the Aisle (BTA) is a civic dialogue platform designed to surface public-interest content and support informed, civil discussion across differing perspectives.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-earth-brown-900 mb-2">How are news sources selected?</h3>
                <p className="text-earth-brown-700">
                  Sources are curated based on civic relevance, activity, reliability, and native Bluesky presence. Brand recognition alone is not sufficient. Inactive, bridged, or unreliable accounts are excluded.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-earth-brown-900 mb-2">Why doesn't BTA include every news outlet?</h3>
                <p className="text-earth-brown-700">
                  BTA prioritizes signal over volume. A smaller, verified source list produces clearer context, higher content quality, and a more sustainable platform than a broad but unstable feed.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-earth-brown-900 mb-2">Is BTA politically neutral?</h3>
                <p className="text-earth-brown-700">
                  BTA does not claim political neutrality. It is designed to be inclusive—welcoming a range of civic perspectives while emphasizing civility, accountability, and public-interest relevance. Differences are expected and allowed; hostility and harassment are not.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-earth-brown-900 mb-2">Why were some well-known outlets excluded?</h3>
                <p className="text-earth-brown-700">
                  Outlets may be excluded if their Bluesky accounts are inactive, bridged, incompatible with the public API, or consistently fail relevance or reliability criteria.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-earth-brown-900 mb-2">Can sources be added or removed over time?</h3>
                <p className="text-earth-brown-700">
                  Yes. Sources are reviewed periodically and may be added or removed based on activity, reliability, and alignment with BTA's civic mission.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-earth-brown-900 mb-2">Does BTA track or use user data?</h3>
                <p className="text-earth-brown-700">
                  No. BTA does not track users, collect behavioral data, or use personal information for analytics, advertising, profiling, or any other purpose. User content may be reviewed only if it appears to violate Community Standards. Aside from enforcing those standards, user data is not collected, stored, shared, or used.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Questions about our standards?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-earth-brown-600">
              See our{' '}
              <a href="#faq" className="text-turquoise-600 hover:underline font-medium">
                FAQ section
              </a>{' '}
              above for common questions, or visit our{' '}
              <Link href="/moderation" className="text-turquoise-600 hover:underline font-medium">
                Moderation Center
              </Link>{' '}
              where you can learn more about our guidelines and enforcement policies.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
