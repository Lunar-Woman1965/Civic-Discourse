
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!token) {
      setMessage({ type: 'error', text: 'Invalid reset link. Please request a new password reset.' })
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: data.message })
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
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
          <CardTitle className="text-2xl font-bold text-center text-earth-brown-900">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-center text-earth-brown-600">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-earth-brown-800">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-earth-brown-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || !token}
                  className="pl-10 pr-10 border-creamy-tan-300 focus:border-turquoise-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-earth-brown-400 hover:text-earth-brown-600"
                  disabled={isLoading || !token}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-earth-brown-500">Must be at least 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-earth-brown-800">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-earth-brown-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading || !token}
                  className="pl-10 pr-10 border-creamy-tan-300 focus:border-turquoise-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-earth-brown-400 hover:text-earth-brown-600"
                  disabled={isLoading || !token}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-turquoise-600 hover:bg-turquoise-700 text-white"
              disabled={isLoading || !token}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
            
            <div className="text-center text-sm text-earth-brown-600">
              <Link href="/auth/signin" className="text-turquoise-600 hover:text-turquoise-700 font-medium">
                Back to Sign In
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
