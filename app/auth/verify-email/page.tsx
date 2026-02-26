
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')
  const email = searchParams?.get('email')

  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState('')
  const [resendEmail, setResendEmail] = useState(email || '')
  const [resending, setResending] = useState(false)

  useEffect(() => {
    // If token is present in URL, automatically verify
    if (token) {
      verifyEmail(token)
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    setVerifying(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()

      if (response.ok) {
        setVerified(true)
        toast.success('Email verified successfully!')
      } else {
        setError(data.error || 'Verification failed')
        toast.error(data.error || 'Verification failed')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setError('Something went wrong. Please try again.')
      toast.error('Something went wrong')
    } finally {
      setVerifying(false)
    }
  }

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!resendEmail) {
      toast.error('Please enter your email')
      return
    }

    setResending(true)

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resendEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
      } else {
        toast.error(data.error || 'Failed to resend verification email')
      }
    } catch (error) {
      console.error('Resend error:', error)
      toast.error('Something went wrong')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-creamy-tan-50 to-creamy-tan-200 p-4">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="text-center">
            {verifying && (
              <>
                <Loader2 className="h-12 w-12 text-turquoise-600 mx-auto mb-4 animate-spin" />
                <CardTitle>Verifying Your Email</CardTitle>
                <CardDescription>Please wait while we verify your email address...</CardDescription>
              </>
            )}
            
            {!verifying && verified && (
              <>
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Email Verified!</CardTitle>
                <CardDescription>Your email has been successfully verified. You can now sign in to your account.</CardDescription>
              </>
            )}
            
            {!verifying && !verified && error && (
              <>
                <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle>Verification Failed</CardTitle>
                <CardDescription>{error}</CardDescription>
              </>
            )}
            
            {!verifying && !verified && !error && !token && (
              <>
                <Mail className="h-12 w-12 text-turquoise-600 mx-auto mb-4" />
                <CardTitle>Check Your Email</CardTitle>
                <CardDescription>
                  We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {verified && (
              <Button
                onClick={() => router.push('/auth/signin')}
                className="w-full"
              >
                Sign In Now
              </Button>
            )}
            
            {!verified && !verifying && (
              <>
                <div className="p-4 bg-turquoise-50 rounded-lg border border-turquoise-200">
                  <h3 className="font-semibold text-sm mb-2">Didn't receive the email?</h3>
                  <ul className="text-xs text-gray-700 space-y-1 mb-3">
                    <li>• Check your spam or junk folder</li>
                    <li>• Make sure you entered the correct email</li>
                    <li>• The link expires in 24 hours</li>
                  </ul>
                </div>

                <form onSubmit={handleResendVerification} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resendEmail">Email Address</Label>
                    <Input
                      id="resendEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full"
                    disabled={resending}
                  >
                    {resending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center text-sm pt-4 border-t">
                  <Link href="/auth/signin" className="text-turquoise-600 hover:underline">
                    Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-creamy-tan-50 to-creamy-tan-200">
        <Loader2 className="h-8 w-8 animate-spin text-turquoise-600" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}