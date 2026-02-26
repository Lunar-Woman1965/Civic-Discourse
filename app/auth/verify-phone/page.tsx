
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { getDeviceFingerprint } from '@/lib/device-fingerprint';
import { Loader2, Shield, Smartphone } from 'lucide-react';

export default function VerifyPhonePage() {
  const { data: session, status, update } = useSession() || {};
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Get device fingerprint on mount
  useEffect(() => {
    async function initFingerprint() {
      try {
        const fp = await getDeviceFingerprint();
        setDeviceFingerprint(fp);
      } catch (error) {
        console.error('Error getting device fingerprint:', error);
      }
    }
    initFingerprint();
  }, []);

  // Redirect if already verified
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Check if phone is already verified
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data.phoneVerified) {
            router.push('/dashboard');
          }
        })
        .catch(console.error);
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, session, router]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Verification code sent! Check your phone.');
        setCodeSent(true);
        setCountdown(60); // 60 second cooldown
      } else {
        toast.error(data.error || 'Failed to send verification code');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone, 
          code: verificationCode,
          deviceFingerprint,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Phone verified successfully!');
        // Update session
        await update();
        // Redirect to dashboard
        setTimeout(() => router.push('/dashboard'), 1000);
      } else {
        toast.error(data.error || 'Invalid verification code');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-orange-200">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Verify Your Phone Number
          </CardTitle>
          <CardDescription className="text-gray-600">
            Help us keep our community safe by verifying your phone number. This helps prevent abuse and keeps discussions civil.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!codeSent ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  Phone Number
                </Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Include your country code (e.g., +1 for US)
                </p>
              </div>
              
              <Button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-gray-700 font-medium">
                  Verification Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                />
                <p className="text-xs text-gray-500 text-center">
                  Code sent to {phone}
                </p>
              </div>
              
              <Button
                onClick={handleVerifyCode}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Phone Number'
                )}
              </Button>
              
              <Button
                onClick={handleSendCode}
                disabled={loading || countdown > 0}
                variant="outline"
                className="w-full border-orange-200 hover:bg-orange-50"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </Button>
            </div>
          )}
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>
          
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="w-full text-gray-600 hover:text-gray-900"
          >
            Skip for now
          </Button>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-gray-700">
            <p className="font-medium mb-2">Why verify your phone?</p>
            <ul className="space-y-1 text-xs">
              <li>• Prevents abuse and keeps discussions civil</li>
              <li>• Makes it harder for banned users to return</li>
              <li>• Helps maintain community safety standards</li>
              <li>• You can skip now and verify later in settings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
