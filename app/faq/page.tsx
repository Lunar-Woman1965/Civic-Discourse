
import { Metadata } from 'next'
import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | Bridging the Aisle',
  description: 'Get answers to common questions about Bridging the Aisle, including how to engage in civil political discourse, our community standards, moderation policies, and features for Democrats, Republicans, and Independents.',
  openGraph: {
    title: 'Frequently Asked Questions - Bridging the Aisle',
    description: 'Everything you need to know about civil political discussions on Bridging the Aisle',
    type: 'website',
  },
}

export default function FAQPage() {
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-earth-brown-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-earth-brown-700">
            Everything you need to know about Bridging the Aisle and civil political discourse
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left text-lg font-semibold text-earth-brown-800">
                What is Bridging the Aisle?
              </AccordionTrigger>
              <AccordionContent className="text-earth-brown-700">
                Bridging the Aisle is a social platform designed for civil political discourse across the entire political spectrum. We provide a space where Democrats, Republicans, Liberals, Conservatives, and Independents can engage in respectful, fact-based discussions about important political issues like climate change, healthcare, economy, immigration, and education.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left text-lg font-semibold text-earth-brown-800">
                How does Bridging the Aisle promote civil discourse?
              </AccordionTrigger>
              <AccordionContent className="text-earth-brown-700">
                We enforce strict community standards that prohibit personal attacks, hate speech, and misinformation. Our moderation team reviews reported content, and we encourage users to cite sources for their claims. We also use a recommendation system that exposes users to diverse political perspectives, helping bridge political divides.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left text-lg font-semibold text-earth-brown-800">
                Can I identify my political views on the platform?
              </AccordionTrigger>
              <AccordionContent className="text-earth-brown-700">
                Yes! Users can identify their political views as Progressive, Liberal, Moderate, Conservative, Libertarian, or Independent. This helps create transparency in discussions and allows you to understand where others are coming from politically. You can also filter content by political viewpoint to see perspectives that align with or differ from your own.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left text-lg font-semibold text-earth-brown-800">
                What topics can I discuss on Bridging the Aisle?
              </AccordionTrigger>
              <AccordionContent className="text-earth-brown-700">
                You can discuss any political topic, with popular categories including:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Climate Change & Environmental Policy</li>
                  <li>Healthcare & Medicare/Medicaid</li>
                  <li>Economic Policy & Taxes</li>
                  <li>Immigration & Border Policy</li>
                  <li>Education & Student Loans</li>
                  <li>Veterans Affairs</li>
                  <li>Homelessness & Housing</li>
                  <li>Food Insecurity & SNAP</li>
                  <li>Employment & Labor Rights</li>
                  <li>Foreign Policy & Defense</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left text-lg font-semibold text-earth-brown-800">
                What are Groups and how do they work?
              </AccordionTrigger>
              <AccordionContent className="text-earth-brown-700">
                Groups are communities focused on specific political topics or issues. They can be public (anyone can join), private (requires approval), or hidden (invitation only). Each group has creators, admins, and moderators who ensure discussions stay on-topic and respectful. You can join multiple groups to engage with issues that matter to you.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left text-lg font-semibold text-earth-brown-800">
                What is the source citation policy?
              </AccordionTrigger>
              <AccordionContent className="text-earth-brown-700">
                When creating a post, you can add a source citation (URL) to support your claims. We encourage citing credible sources from diverse perspectives. Note: only one link is clickable per post to prevent spam and ensure quality sourcing. This policy helps ground discussions in factual information rather than opinions alone.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left text-lg font-semibold text-earth-brown-800">
                How does content moderation work?
              </AccordionTrigger>
              <AccordionContent className="text-earth-brown-700">
                Our moderation system includes:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Community reporting:</strong> Users can flag inappropriate content</li>
                  <li><strong>Moderator review:</strong> Trained moderators evaluate reported content</li>
                  <li><strong>Enforcement actions:</strong> Violations result in warnings, temporary bans, or permanent removal</li>
                  <li><strong>Appeals process:</strong> Users can appeal moderation decisions</li>
                  <li><strong>Transparency:</strong> Our Community Standards page explains what's allowed</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left text-lg font-semibold text-earth-brown-800">
                What happens if I violate community standards?
              </AccordionTrigger>
              <AccordionContent className="text-earth-brown-700">
                Violations are handled based on severity:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Minor violations:</strong> Warning + content removal</li>
                  <li><strong>Moderate violations:</strong> Temporary ban (1-30 days)</li>
                  <li><strong>Severe violations:</strong> Permanent ban from the platform</li>
                </ul>
                All users receive notifications about violations and can appeal decisions through our moderation system.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9">
              <AccordionTrigger className="text-left text-lg font-semibold text-earth-brown-800">
                How do I find users with different political views?
              </AccordionTrigger>
              <AccordionContent className="text-earth-brown-700">
                Our recommendations sidebar suggests users with diverse perspectives based on your interactions and stated political views. You can also filter the news feed by political viewpoint to see content from Progressives, Liberals, Moderates, Conservatives, Libertarians, or Independents. This helps you understand different perspectives and engage in meaningful cross-aisle dialogue.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10">
              <AccordionTrigger className="text-left text-lg font-semibold text-earth-brown-800">
                What is the international news sidebar?
              </AccordionTrigger>
              <AccordionContent className="text-earth-brown-700">
                The "From other parts of the globe" sidebar provides links to reputable international news outlets from various regions (Europe, Asia, Middle East, Africa, Latin America, Oceania). This helps users gain global perspectives on political issues and understand how other countries report on international events.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-11">
              <AccordionTrigger className="text-left text-lg font-semibold text-earth-brown-800">
                Is my data and privacy protected?
              </AccordionTrigger>
              <AccordionContent className="text-earth-brown-700">
                Yes. We take privacy seriously. Your email, password, and personal information are encrypted and secure. We never sell your data to third parties. You can review our full Privacy Policy for details about data collection, storage, and usage. You can also deactivate or delete your account at any time from your profile settings.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-11a">
              <AccordionTrigger className="text-left text-lg font-semibold text-earth-brown-800">
                Can I reactivate my account after deactivating it?
              </AccordionTrigger>
              <AccordionContent className="text-earth-brown-700">
                Yes! If you deactivate your account, you have <strong>30 days</strong> to reactivate it before it's permanently deleted. During this grace period, your account is hidden but all your data (posts, friends, groups, settings) is preserved. To reactivate, visit the <a href="/auth/reactivate" className="text-turquoise-600 hover:underline font-medium">reactivation page</a> and sign in with your credentials. <strong>Important:</strong> Accounts deleted before this reactivation feature was implemented can also be restored without a time limit. Note: Permanently banned accounts cannot be reactivated.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-12">
              <AccordionTrigger className="text-left text-lg font-semibold text-earth-brown-800">
                Can I use Bridging the Aisle on mobile?
              </AccordionTrigger>
              <AccordionContent className="text-earth-brown-700">
                Yes! Bridging the Aisle is a Progressive Web App (PWA) that works on all devices. You can access it through your mobile browser, and on supported devices, you can install it to your home screen for app-like functionality. Your account and settings sync across all devices where you're logged in.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-13">
              <AccordionTrigger className="text-left text-lg font-semibold text-earth-brown-800">
                How do reactions and comments work?
              </AccordionTrigger>
              <AccordionContent className="text-earth-brown-700">
                Each post can receive reactions (thumbs up, thumbs down, heart, sad, angry, thinking) and comments. Hover over any reaction icon to see what it means. Comments allow for threaded discussions, and you can edit or delete your own comments. All interactions are moderated according to our community standards.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-14">
              <AccordionTrigger className="text-left text-lg font-semibold text-earth-brown-800">
                Is Bridging the Aisle free to use?
              </AccordionTrigger>
              <AccordionContent className="text-earth-brown-700">
                Yes, Bridging the Aisle is completely free to use. We believe civil political discourse should be accessible to everyone, regardless of economic background. We do not charge for accounts, groups, or any features on the platform.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-15">
              <AccordionTrigger className="text-left text-lg font-semibold text-earth-brown-800">
                How can I report a bug or suggest a feature?
              </AccordionTrigger>
              <AccordionContent className="text-earth-brown-700">
                We welcome feedback! You can contact us at support@bridgingtheaisle.com with bug reports, feature suggestions, or general feedback. We're constantly working to improve the platform based on user input.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mt-8 bg-turquoise-50 rounded-lg p-8 border border-turquoise-200">
          <h2 className="text-2xl font-semibold text-earth-brown-800 mb-4">
            Ready to Join?
          </h2>
          <p className="text-lg text-earth-brown-700 mb-6">
            Start engaging in meaningful political discussions today. Join Democrats, Republicans, and Independents in respectful dialogue about the issues that matter.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/signup">
              <Button className="bg-turquoise-600 hover:bg-turquoise-700 text-white">
                Create Free Account
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" className="border-turquoise-600 text-turquoise-700 hover:bg-turquoise-50">
                Learn More About Us
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
