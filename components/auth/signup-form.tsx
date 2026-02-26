
'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getDeviceFingerprint } from '@/lib/device-fingerprint'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mail, Lock, User, Users, Flag } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '', // Pseudonymous username
    firstName: '',
    lastName: '',
    useRealName: false, // Toggle between username and real name
    dateOfBirth: '',
    politicalLeaning: '',
    acceptTerms: false
  })
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

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate age (must be 18+)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      if (age < 18) {
        toast.error('You must be 18 years or older to join')
        setIsLoading(false)
        return
      }
    }

    if (!formData.acceptTerms) {
      toast.error('Please accept the terms and conditions')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          deviceFingerprint,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Account created successfully! Please check your email to verify your account.')
        // Redirect to verification pending page
        router.push('/auth/verify-email?email=' + encodeURIComponent(formData.email))
      } else {
        const data = await response.json()
        toast.error(data.error || 'Something went wrong')
      }
    } catch (error) {
      toast.error('Something went wrong')
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
          <Users className="h-12 w-12 text-turquoise-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-earth-brown-900">Join Bridging the Aisle</h1>
          <p className="text-earth-brown-600">Create your account to start discussing</p>
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
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Fill in your details to join our community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Privacy Option */}
              <div className="p-3 bg-turquoise-50 rounded-lg border border-turquoise-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="useRealName"
                    checked={formData.useRealName}
                    onCheckedChange={(checked) => setFormData({...formData, useRealName: checked as boolean})}
                  />
                  <Label htmlFor="useRealName" className="text-sm font-medium">
                    Use my real name (optional)
                  </Label>
                </div>
                <p className="text-xs text-gray-600">
                  {formData.useRealName 
                    ? "Your real name will be visible to other users. You can change this later in settings."
                    : "You'll use a pseudonymous username instead. Your real identity stays private."}
                </p>
              </div>

              {!formData.useRealName ? (
                <div className="space-y-2">
                  <Label htmlFor="username">Username (Pseudonym)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    This will be your public display name. Choose wisely!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
                <p className="text-xs text-earth-brown-600">You must be 18 years or older to join</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="politicalLeaning">Political Identifier (Optional)</Label>
                <Select value={formData.politicalLeaning} onValueChange={(value) => setFormData({...formData, politicalLeaning: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your political identifier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progressive">Progressive</SelectItem>
                    <SelectItem value="democratic-socialist">Democratic Socialist</SelectItem>
                    <SelectItem value="liberal">Liberal</SelectItem>
                    <SelectItem value="independent">Independent</SelectItem>
                    <SelectItem value="centrist">Centrist</SelectItem>
                    <SelectItem value="libertarian">Libertarian</SelectItem>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => setFormData({...formData, acceptTerms: checked as boolean})}
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the <Link href="/terms" target="_blank" className="text-turquoise-600 hover:underline">Terms of Service</Link>, <Link href="/community-standards/public" target="_blank" className="text-turquoise-600 hover:underline">Community Standards</Link>, and <Link href="/privacy/public" target="_blank" className="text-turquoise-600 hover:underline">Privacy Policy</Link>
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
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
              Sign up with Google
            </Button>

            <div className="text-center text-sm">
              <span className="text-earth-brown-600">Already have an account? </span>
              <Link href="/auth/signin" className="text-turquoise-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
