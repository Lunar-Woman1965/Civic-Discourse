
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/landing-page'
import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bridgingtheaisle.com'

export const metadata: Metadata = {
  title: 'Bridging the Aisle - Civil Political Discussion Platform',
  description: 'Join a community dedicated to respectful, fact-based political discourse. Connect with others across the political spectrum in meaningful conversations. Features civility scoring, fact-checking, and topic-based groups.',
  keywords: [
    'political discussion',
    'civil discourse',
    'political debate',
    'political social media',
    'respectful politics',
    'political conversation',
    'bipartisan discussion',
    'political spectrum',
    'fact-based politics',
    'political community',
    'political groups',
    'political news',
    'political opinions',
    'democratic discussion',
    'republican discussion',
    'moderate politics',
    'political engagement',
    'civic discourse',
    'political dialogue',
    'bridging political divide'
  ],
  authors: [{ name: 'Alenya Selah Hymendar' }],
  creator: 'Alenya Selah Hymendar',
  publisher: 'Alenya Selah Hymendar',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Bridging the Aisle',
    title: 'Bridging the Aisle - Civil Political Discussion Platform',
    description: 'Join a community dedicated to respectful, fact-based political discourse. Connect across the political spectrum in meaningful conversations.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bridging the Aisle - Civil Political Discussion Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bridging the Aisle - Civil Political Discussion Platform',
    description: 'Join a community dedicated to respectful, fact-based political discourse. Connect across the political spectrum.',
    images: ['/og-image.png'],
    creator: '@BridgingAisle',
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
  verification: {
    // Add your verification codes here when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
}

export default async function Home() {
  const user = await getCurrentUser()
  
  if (user) {
    redirect('/dashboard')
  }

  return <LandingPage />
}
