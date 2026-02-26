
import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About Bridging the Aisle - Our Mission for Civil Political Discourse',
  description: 'Learn about Bridging the Aisle, a platform dedicated to fostering respectful political dialogue between Democrats, Republicans, and Independents. Discover our mission to bridge political divides through civil discourse.',
  openGraph: {
    title: 'About Bridging the Aisle - Our Mission',
    description: 'A platform for civil political discourse across the political spectrum',
    type: 'website',
  },
}

export default function AboutPage() {
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
        <article className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-earth-brown-900 mb-6">
            About Bridging the Aisle
          </h1>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold text-earth-brown-800 mb-4">
              Our Mission
            </h2>
            <p className="text-lg text-earth-brown-700 mb-4">
              Bridging the Aisle is a social platform dedicated to fostering respectful, fact-based political discourse across the entire political spectrum. We believe that Democrats, Republicans, Liberals, Conservatives, and Independents can engage in meaningful dialogue without resorting to personal attacks or misinformation.
            </p>
            <p className="text-lg text-earth-brown-700 mb-4">
              In an era of increasing political polarization, we provide a space where people can:
            </p>
            <ul className="list-disc pl-6 text-earth-brown-700 space-y-2">
              <li>Discuss critical issues like climate change, healthcare, economy, immigration, and education</li>
              <li>Understand perspectives different from their own</li>
              <li>Engage with fact-checked, source-cited information</li>
              <li>Build bridges across political divides</li>
              <li>Participate in civil, constructive debates</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold text-earth-brown-800 mb-4">
              What Makes Us Different
            </h2>
            <div className="space-y-4 text-earth-brown-700">
              <div>
                <h3 className="text-xl font-semibold text-turquoise-700 mb-2">
                  Content Moderation & Community Standards
                </h3>
                <p>
                  We enforce strict community standards that prohibit personal attacks, hate speech, and misinformation while encouraging passionate debate based on facts and respectful disagreement.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-turquoise-700 mb-2">
                  Source Citation Policy
                </h3>
                <p>
                  Every post can include a source citation, helping ensure discussions are grounded in verifiable information. We encourage users to share credible sources from across the political spectrum.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-turquoise-700 mb-2">
                  Political Diversity
                </h3>
                <p>
                  Users can identify their political views (Progressive, Liberal, Moderate, Conservative, Libertarian, Independent) allowing for transparency and understanding in discussions. Our recommendation system encourages exposure to diverse perspectives.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-turquoise-700 mb-2">
                  Topic-Based Groups
                </h3>
                <p>
                  Join focused discussion groups on specific issues: climate change, healthcare reform, economic policy, veterans affairs, homelessness, food insecurity, employment, and more.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold text-earth-brown-800 mb-4">
              Our Commitment
            </h2>
            <p className="text-lg text-earth-brown-700 mb-4">
              We are committed to creating a platform where:
            </p>
            <ul className="list-disc pl-6 text-earth-brown-700 space-y-2">
              <li><strong>Truth matters:</strong> We prioritize factual accuracy and source verification</li>
              <li><strong>Respect is required:</strong> Personal attacks and hate speech are not tolerated</li>
              <li><strong>All voices are heard:</strong> We welcome perspectives from across the political spectrum</li>
              <li><strong>Privacy is protected:</strong> Your data and personal information are secure</li>
              <li><strong>Democracy is strengthened:</strong> Informed citizens make better democratic decisions</li>
            </ul>
          </div>

          <div className="bg-turquoise-50 rounded-lg p-8 mb-8 border border-turquoise-200">
            <h2 className="text-2xl font-semibold text-earth-brown-800 mb-4">
              Join the Conversation
            </h2>
            <p className="text-lg text-earth-brown-700 mb-6">
              Ready to engage in meaningful political discourse? Join thousands of users who are bridging political divides and engaging in respectful dialogue about the issues that matter most.
            </p>
            <div className="flex gap-4">
              <Link href="/auth/signup">
                <Button className="bg-turquoise-600 hover:bg-turquoise-700 text-white">
                  Create Account
                </Button>
              </Link>
              <Link href="/faq">
                <Button variant="outline" className="border-turquoise-600 text-turquoise-700 hover:bg-turquoise-50">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-earth-brown-800 mb-4">
              Contact & Support
            </h2>
            <p className="text-earth-brown-700 mb-2">
              <strong>Creator:</strong> Alenya Selah Hymendar
            </p>
            <p className="text-earth-brown-700 mb-4">
              <strong>Email:</strong>{' '}
              <a href="mailto:support@bridgingtheaisle.com" className="text-turquoise-600 hover:underline">
                support@bridgingtheaisle.com
              </a>
            </p>
            <div className="text-sm text-earth-brown-600">
              <p>© 2025 Bridging the Aisle. Built for respectful political dialogue.</p>
            </div>
          </div>
        </article>
      </main>
    </div>
  )
}
