'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, MessageCircle, Shield, Vote, CheckCircle, Heart, Flag } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Script from 'next/script'

export default function LandingPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bridging the Aisle',
    description: 'A social media platform where people of all political affiliations engage in civil political discussions about climate change, healthcare, economy, immigration, and more',
    url: 'https://bridgingtheaisle-zslir8.abacusai.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://bridgingtheaisle-zslir8.abacusai.app/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    author: {
      '@type': 'Person',
      name: 'Alenya Selah Hymendar',
    },
    keywords: 'political discussion, all political views, political spectrum, climate change, healthcare policy, economic policy, civil discourse, bipartisan, political forum',
  }

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bridging the Aisle',
    description: 'A social media platform bringing people of all political affiliations together for civil political discussions on climate change, healthcare, economy, and more',
    url: 'https://bridgingtheaisle-zslir8.abacusai.app',
    logo: 'https://bridgingtheaisle-zslir8.abacusai.app/bridging-the-aisle-logo.png',
    sameAs: [
      // Add your social media profiles here when available
    ],
  }

  const webApplicationData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Bridging the Aisle',
    description: 'Join people of all political affiliations and perspectives in respectful, fact-based political discourse on climate change, healthcare, economy, immigration, education, and foreign policy',
    url: 'https://bridgingtheaisle-zslir8.abacusai.app',
    applicationCategory: 'SocialNetworkingApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Civil political discourse across all political perspectives',
      'Fact-checked content and source citations',
      'Topic-based groups for climate change, healthcare, economy',
      'Political spectrum filtering across all viewpoints',
      'Community moderation and civility scoring',
      'Meaningful reactions for political discussions',
    ],
  }

  const features = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Civil Discourse",
      description: "Engage in respectful political discussions with built-in civility scoring"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Fact-Checked Content",
      description: "Source citations and fact-checking tools to ensure accurate information"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Topic-Based Groups",
      description: "Join communities focused on specific political topics and issues"
    },
    {
      icon: <Vote className="h-6 w-6" />,
      title: "Political Spectrum",
      description: "Filter content by political leanings and find diverse perspectives"
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Moderation Tools",
      description: "Community-driven moderation with clear guidelines and enforcement"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Meaningful Reactions",
      description: "React with 'Agree', 'Disagree', 'Insightful' and 'Respectful'"
    }
  ]

  return (
    <>
      {/* Structured Data */}
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <Script
        id="webapp-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationData) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-creamy-tan-50 to-creamy-tan-200">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl tracking-tight font-extrabold text-earth-brown-900 sm:text-5xl md:text-6xl"
                  >
                    <span className="block xl:inline">Bridging the Aisle:</span>{' '}
                    <span className="block text-turquoise-600 xl:inline">Where All Political Voices Meet</span>
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mt-3 text-base text-earth-brown-700 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                  >
                    Join a community dedicated to respectful, fact-based political discourse. Discuss climate change, healthcare policy, economic reform, and more with people of all political perspectives across the entire spectrum in meaningful conversations.
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mt-2 text-sm text-earth-brown-600 sm:max-w-xl sm:mx-auto lg:mx-0"
                  >
                    <strong>Ages 18+:</strong> You must be at least 18 years old to join our platform.
                  </motion.p>

                  {/* U.S. Citizenship Notice */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.35 }}
                    className="mt-4 sm:max-w-xl sm:mx-auto lg:mx-0"
                  >
                    <Alert className="bg-blue-50 border-blue-200">
                      <Flag className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-900">
                        <span className="font-semibold">🇺🇸 U.S. Citizens Only</span>
                        <p className="text-sm mt-1">
                          Bridging the Aisle is limited to U.S. citizens. Because the platform focuses on U.S. civic dialogue and political processes, participation is restricted to U.S. citizens only. Verification may be requested.
                        </p>
                      </AlertDescription>
                    </Alert>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
                  >
                    <div className="rounded-md shadow">
                      <Link href="/auth/signup">
                        <Button size="lg" className="w-full bg-turquoise-600 hover:bg-turquoise-700 text-white">
                          Join the Discussion
                        </Button>
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link href="/auth/signin">
                        <Button size="lg" variant="outline" className="w-full border-earth-brown-300 text-earth-brown-700 hover:bg-creamy-tan-100">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </main>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-turquoise-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-earth-brown-900 sm:text-4xl">
                Built for meaningful political dialogue
              </p>
              <p className="mt-4 max-w-2xl text-xl text-earth-brown-600 lg:mx-auto">
                Our platform promotes constructive political discussions through innovative features designed to encourage civility and fact-based conversations. Whether you're discussing climate change policy, healthcare reform, economic issues, immigration, education, or foreign policy, our community brings together people of all political affiliations and perspectives for meaningful dialogue.
              </p>
            </div>

            <div className="mt-10">
              <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-x-8 md:gap-y-10">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow duration-300 border-creamy-tan-200">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-turquoise-100 rounded-lg text-turquoise-600">
                            {feature.icon}
                          </div>
                          <CardTitle className="text-lg text-earth-brown-800">{feature.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-earth-brown-600">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Community Guidelines Section */}
        <div className="bg-pale-copper-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-pale-copper-600 font-semibold tracking-wide uppercase">Community Standards</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-earth-brown-900 sm:text-4xl">
                Our commitment to civility
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-creamy-tan-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center text-earth-brown-800">
                      <CheckCircle className="h-5 w-5 mr-2 text-turquoise-600" />
                      Respect Others
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-earth-brown-600">Treat all members with dignity regardless of political beliefs</p>
                  </CardContent>
                </Card>
                
                <Card className="border-creamy-tan-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center text-earth-brown-800">
                      <CheckCircle className="h-5 w-5 mr-2 text-turquoise-600" />
                      Cite Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-earth-brown-600">Back up claims with credible sources and evidence</p>
                  </CardContent>
                </Card>
                
                <Card className="border-creamy-tan-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center text-earth-brown-800">
                      <CheckCircle className="h-5 w-5 mr-2 text-turquoise-600" />
                      Stay On Topic
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-earth-brown-600">Keep discussions focused and constructive</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
