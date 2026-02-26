
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Scale, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PublicCommunityStandardsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-creamy-tan-50 to-creamy-tan-200">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-3">
            <Users className="h-10 w-10 text-turquoise-600" />
            <h1 className="text-3xl font-bold text-earth-brown-900">CivilPolitics</h1>
          </div>
          <div className="flex justify-center">
            <div className="bg-turquoise-100 p-4 rounded-full">
              <Scale className="h-12 w-12 text-turquoise-600" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-earth-brown-900 mb-2">Community Standards</h2>
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
                  <h3 className="text-2xl font-bold text-earth-brown-900 mb-2">Integrity</h3>
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
                  <h3 className="text-2xl font-bold text-earth-brown-900 mb-2">Accountability</h3>
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
                  <h3 className="text-2xl font-bold text-earth-brown-900 mb-2">Respect</h3>
                  <p className="text-earth-brown-700 leading-relaxed">
                    Debate ideas, not people. You can disagree without demeaning or insulting. 
                    Everyone here gets a fair hearing—no name-calling, no mockery, no cheap shots. 
                    Civility isn't weakness; it's proof you can stay human in a hard conversation.
                  </p>
                </div>
              </div>
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

            {/* CTA Buttons */}
            <div className="flex justify-center gap-4 pt-4">
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild size="lg">
                <Link href="/auth/signup">Join Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
