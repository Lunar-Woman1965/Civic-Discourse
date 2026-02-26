
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

function ReactivateAccountForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingEligibility, setCheckingEligibility] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [eligibility, setEligibility] = useState<any>(null)

  // Pre-fill email from query params and auto-check eligibility
  useEffect(() => {
    const emailParam = searchParams?.get('email')
    if (emailParam) {
      setEmail(emailParam)
      // Auto-check eligibility after setting email
      setTimeout(() => {
        checkEligibility()
      }, 500)
    }
  }, [searchParams])

  const checkEligibility = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setCheckingEligibility(true)
    setError('')
    setEligibility(null)

    try {
      const response = await fetch(`/api/profile/reactivate?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to check account status')
        return
      }

      setEligibility(data)

      if (!data.canReactivate) {
        if (data.reason === 'already_active') {
          setError('This account is already active. You can sign in normally.')
        } else if (data.reason === 'permanently_banned') {
          setError('This account has been permanently banned and cannot be reactivated.')
        } else if (data.reason === 'grace_period_expired') {
          setError(`The grace period for this account expired on ${new Date(data.expiredOn).toLocaleDateString()}. Please contact support for assistance.`)
        }
      }
    } catch (err) {
      setError('Failed to check account status. Please try again.')
    } finally {
      setCheckingEligibility(false)
    }
  }

  const handleReactivate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/profile/reactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to reactivate account')
        return
      }

      setMessage(data.message)
      
      // Redirect to sign in page after 2 seconds
      setTimeout(() => {
        router.push('/auth/signin?message=Account reactivated successfully. Please sign in.')
      }, 2000)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-creamy-tan-50 via-lavender-50 to-sage-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Reactivate Your Account</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to restore your deactivated account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {eligibility?.canReactivate && (
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {eligibility.daysRemaining ? (
                  <>
                    Your account can be reactivated! You have <strong>{eligibility.daysRemaining} days</strong> remaining in the grace period.
                  </>
                ) : (
                  <>
                    Good news! Your account is eligible for reactivation. Enter your password below to restore access.
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleReactivate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={checkEligibility}
                  disabled={checkingEligibility || !email}
                >
                  {checkingEligibility ? 'Checking...' : 'Check'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || (eligibility && !eligibility.canReactivate)}
            >
              {loading ? 'Reactivating...' : 'Reactivate Account'}
            </Button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm">
            <p className="text-gray-600">
              Remember your account?{' '}
              <Link href="/auth/signin" className="text-terra-cotta-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
            <p className="text-gray-600">
              Need help?{' '}
              <Link href="/faq" className="text-terra-cotta-600 hover:underline font-medium">
                View FAQ
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">Account Reactivation Policy</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Recently deleted accounts have a <strong>30-day grace period</strong> for reactivation</li>
              <li>• Accounts deleted before this feature was implemented can still be reactivated</li>
              <li>• All your posts, friends, and settings will be fully restored</li>
              <li>• Permanently banned accounts cannot be reactivated</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main component with Suspense wrapper for search params
export default function ReactivateAccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-creamy-tan-50 via-lavender-50 to-sage-green-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terra-cotta-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <ReactivateAccountForm />
    </Suspense>
  )
}
