
'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Lock, Flag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { getDeviceFingerprint } from '@/lib/device-fingerprint'

export default function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null)
  const router = useRouter()

  // Get device fingerprint on mount
  useEffect(() => {
    async function initFingerprint() {
      try {
        const fp = await getDeviceFingerprint()
        setDeviceFingerprint(fp)
      } catch (error) {
        console.error('Error getting device fingerprint:', error)
      }
    }
    initFingerprint()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password: password,
        redirect: false,
      })

      console.log('SignIn result:', result)

      if (result?.error) {
        // Check for specific error messages
        if (result.error.includes('EMAIL_NOT_VERIFIED')) {
          toast.error('Please verify your email before signing in.', {
            duration: 6000,
          })
          // Redirect to verification page after a short delay
          setTimeout(() => {
            router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
          }, 1500)
        } else if (result.error.includes('ACCOUNT_DEACTIVATED')) {
          toast.error('Your account has been deactivated.', {
            duration: 6000,
          })
          // Redirect to reactivation page after a short delay
          setTimeout(() => {
            router.push(`/auth/reactivate?email=${encodeURIComponent(email)}`)
          }, 1500)
        } else if (result.error.includes('ACCOUNT_SUSPENDED')) {
          toast.error('Your account has been suspended. Please contact support.')
        } else if (result.error.includes('ACCOUNT_BANNED')) {
          toast.error('This account has been permanently banned.')
        } else {
          toast.error('Invalid email or password. Please try again.')
        }
      } else if (result?.ok) {
        // Track device fingerprint
        if (deviceFingerprint) {
          try {
            const trackRes = await fetch('/api/auth/track-device', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ deviceFingerprint }),
            })
            
            const trackData = await trackRes.json()
            
            if (trackData.banned) {
              toast.error('This device is not eligible for access')
              return
            }
          } catch (error) {
            console.error('Error tracking device:', error)
          }
        }
        
        toast.success('Welcome back!')
        router.replace('/dashboard')
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('SignIn error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (error) {
      toast.error('Google sign in failed')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-creamy-tan-50 to-creamy-tan-200 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="relative w-64 h-64 mx-auto mb-4">
            <Image
              src="/bridging-the-aisle-logo.png"
              alt="Bridging the Aisle - Common ground, uncommon courage"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-earth-brown-900">Welcome back</h1>
          <p className="text-earth-brown-600">Sign in to join the conversation</p>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Flag className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <p className="font-semibold mb-1">Bridging the Aisle is limited to U.S. citizens.</p>
            <p className="text-sm">
              Because the platform focuses on U.S. civic dialogue and political processes, participation is restricted to U.S. citizens only. Verification may be requested.
            </p>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-turquoise-600 hover:text-turquoise-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <Separator className="my-4" />

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              Sign in with Google
            </Button>

            <div className="text-center text-sm space-y-2">
              <div>
                <span className="text-earth-brown-600">Don't have an account? </span>
                <Link href="/auth/signup" className="text-turquoise-600 hover:underline">
                  Sign up
                </Link>
              </div>
              <div>
                <span className="text-earth-brown-600">Forgot your password? </span>
                <Link href="/auth/forgot-password" className="text-turquoise-600 hover:underline font-medium">
                  Reset it here
                </Link>
              </div>
              <div>
                <span className="text-earth-brown-600">Need to reactivate your account? </span>
                <Link href="/auth/reactivate" className="text-terra-cotta-600 hover:underline">
                  Reactivate
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
