
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { RegisterServiceWorker } from './register-sw'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bridging the Aisle - Civil Political Discussion Platform | Democrats, Republicans & Independents',
  description: 'Join civil political discussions on climate change, healthcare, economy, and more. Connect with Democrats, Republicans, Liberals, Conservatives, and Independents for respectful, fact-based debate.',
  keywords: [
    'political discussion',
    'civil discourse',
    'Democrats',
    'Republicans',
    'Liberals',
    'Conservatives',
    'Independents',
    'climate change debate',
    'healthcare policy',
    'economic policy',
    'political debate',
    'bipartisan discussion',
    'political forum',
    'respectful politics',
    'fact-based politics',
    'political social network',
    'bridge political divide',
    'left and right politics',
    'political spectrum',
    'moderate politics'
  ],
  authors: [{ name: 'Alenya Selah Hymendar' }],
  creator: 'Alenya Selah Hymendar',
  publisher: 'Alenya Selah Hymendar',
  metadataBase: new URL('https://bridgingtheaisle.com'),
  manifest: '/manifest.json',
  openGraph: {
    title: 'Bridging the Aisle - Civil Political Discussion',
    description: 'Join civil political discussions with Democrats, Republicans, and Independents. Discuss climate change, healthcare, economy, and more in a respectful environment.',
    url: 'https://bridgingtheaisle.com',
    siteName: 'Bridging the Aisle',
    images: [
      {
        url: '/bridging-the-aisle-logo.png',
        width: 1200,
        height: 630,
        alt: 'Bridging the Aisle - Civil Political Discussion Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bridging the Aisle - Civil Political Discussion',
    description: 'Join respectful political discussions on climate, healthcare, economy with Democrats, Republicans & Independents.',
    images: ['/bridging-the-aisle-logo.png'],
    creator: '@bridgingtheaisle',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://bridgingtheaisle.com',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bridging the Aisle',
  },
}

export const viewport: Viewport = {
  themeColor: '#8B7355',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://bridgingtheaisle.com/#website",
        "url": "https://bridgingtheaisle.com",
        "name": "Bridging the Aisle",
        "description": "A platform for civil political discourse across the political spectrum",
        "publisher": {
          "@id": "https://bridgingtheaisle.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://bridgingtheaisle.com/dashboard?search={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://bridgingtheaisle.com/#organization",
        "name": "Bridging the Aisle",
        "url": "https://bridgingtheaisle.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://bridgingtheaisle.com/bridging-the-aisle-logo.png",
          "width": 1200,
          "height": 630
        },
        "founder": {
          "@type": "Person",
          "name": "Alenya Selah Hymendar"
        },
        "description": "Platform dedicated to fostering respectful political discourse between Democrats, Republicans, and Independents",
        "sameAs": [
          "https://twitter.com/bridgingtheaisle"
        ]
      },
      {
        "@type": "DiscussionForumPosting",
        "@id": "https://bridgingtheaisle.com/#forum",
        "name": "Political Discussion Forum",
        "description": "Civil political discussions on climate change, healthcare, economy, immigration, education, and more",
        "about": [
          {
            "@type": "Thing",
            "name": "Political Discourse"
          },
          {
            "@type": "Thing",
            "name": "Civil Debate"
          },
          {
            "@type": "Thing",
            "name": "Climate Change Policy"
          },
          {
            "@type": "Thing",
            "name": "Healthcare Policy"
          },
          {
            "@type": "Thing",
            "name": "Economic Policy"
          },
          {
            "@type": "Thing",
            "name": "Immigration Policy"
          },
          {
            "@type": "Thing",
            "name": "Education Policy"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": "https://bridgingtheaisle.com/faq#faqpage",
        "url": "https://bridgingtheaisle.com/faq",
        "name": "Frequently Asked Questions About Civil Political Discourse",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is Bridging the Aisle?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Bridging the Aisle is a social platform designed for civil political discourse across the entire political spectrum. We provide a space where Democrats, Republicans, Liberals, Conservatives, and Independents can engage in respectful, fact-based discussions about important political issues like climate change, healthcare, economy, immigration, and education."
            }
          },
          {
            "@type": "Question",
            "name": "How does Bridging the Aisle promote civil discourse?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We enforce strict community standards that prohibit personal attacks, hate speech, and misinformation. Our moderation team reviews reported content, and we encourage users to cite sources for their claims. We also use a recommendation system that exposes users to diverse political perspectives, helping bridge political divides."
            }
          },
          {
            "@type": "Question",
            "name": "What topics can I discuss on Bridging the Aisle?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can discuss any political topic, including Climate Change & Environmental Policy, Healthcare & Medicare/Medicaid, Economic Policy & Taxes, Immigration & Border Policy, Education & Student Loans, Veterans Affairs, Homelessness & Housing, Food Insecurity & SNAP, Employment & Labor Rights, and Foreign Policy & Defense."
            }
          }
        ]
      },
      {
        "@type": "WebPage",
        "@id": "https://bridgingtheaisle.com/about#webpage",
        "url": "https://bridgingtheaisle.com/about",
        "name": "About Bridging the Aisle - Our Mission for Civil Political Discourse",
        "description": "Learn about our mission to foster respectful political dialogue between Democrats, Republicans, and Independents",
        "isPartOf": {
          "@id": "https://bridgingtheaisle.com/#website"
        }
      },
      {
        "@type": "SoftwareApplication",
        "name": "Bridging the Aisle",
        "operatingSystem": "Web, iOS, Android",
        "applicationCategory": "SocialNetworkingApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "1000"
        }
      }
    ]
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <RegisterServiceWorker />
          {children}
        </Providers>
      </body>
    </html>
  )
}
