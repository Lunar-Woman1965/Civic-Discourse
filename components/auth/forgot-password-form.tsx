
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [resetUrl, setResetUrl] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setResetUrl(null)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: data.message })
        // DEV ONLY: Display reset URL
        if (data.resetUrl) {
          setResetUrl(data.resetUrl)
        }
        setEmail('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Something went wrong' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-creamy-tan-50 to-creamy-tan-200 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-creamy-tan-300">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between mb-2">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm" className="text-earth-brown-600 hover:text-earth-brown-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-earth-brown-900">
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-center text-earth-brown-600">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            {resetUrl && (
              <Alert className="bg-turquoise-50 border-turquoise-200">
                <AlertDescription className="space-y-2">
                  <p className="font-semibold text-turquoise-900">Development Mode - Reset Link:</p>
                  <Link 
                    href={resetUrl} 
                    className="text-turquoise-700 hover:text-turquoise-900 underline break-all text-sm"
                  >
                    {resetUrl}
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-earth-brown-800">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-earth-brown-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 border-creamy-tan-300 focus:border-turquoise-500"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-turquoise-600 hover:bg-turquoise-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            
            <div className="text-center text-sm text-earth-brown-600">
              Remember your password?{' '}
              <Link href="/auth/signin" className="text-turquoise-600 hover:text-turquoise-700 font-medium">
                Sign in here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
