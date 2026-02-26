
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft, Link as LinkIcon, Unlink, ExternalLink, Info, Check, AlertCircle, ShieldCheck, Clock, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BlueskyConnectionStatus {
  isConnected: boolean;
  isTokenValid: boolean;
  handle: string | null;
  did: string | null;
  connectedAt: string | null;
  tokenExpiry: string | null;
  autoPost: boolean;
  needsReconnect: boolean;
}

export default function AtprotoSettingsPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<BlueskyConnectionStatus | null>(null);
  const [identifierInput, setIdentifierInput] = useState("");
  const [appPasswordInput, setAppPasswordInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isTogglingAutoPost, setIsTogglingAutoPost] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchConnectionStatus();
    }
  }, [status]);

  const fetchConnectionStatus = async () => {
    try {
      const response = await fetch("/api/profile/bluesky/status");
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(data);
      } else {
        toast.error("Failed to load Bluesky connection status");
      }
    } catch (error) {
      console.error("Error fetching Bluesky status:", error);
      toast.error("Failed to load Bluesky connection status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectAccount = async () => {
    if (!identifierInput.trim()) {
      toast.error("Please enter your Bluesky handle or email");
      return;
    }

    if (!appPasswordInput.trim()) {
      toast.error("Please enter your Bluesky app password");
      return;
    }

    // Validate app password format
    const appPasswordRegex = /^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/;
    if (!appPasswordRegex.test(appPasswordInput)) {
      toast.error("Invalid app password format. Must be: xxxx-xxxx-xxxx-xxxx");
      return;
    }

    setIsConnecting(true);
    try {
      const response = await fetch("/api/profile/bluesky/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifierInput,
          appPassword: appPasswordInput,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Bluesky account connected successfully! 🎉");
        setIdentifierInput("");
        setAppPasswordInput("");
        await fetchConnectionStatus();
      } else {
        toast.error(data.message || data.error || "Failed to connect Bluesky account");
      }
    } catch (error) {
      console.error("Error connecting Bluesky account:", error);
      toast.error("Failed to connect Bluesky account");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectAccount = async () => {
    if (!confirm("Are you sure you want to disconnect your Bluesky account? You'll need to re-enter your app password to reconnect.")) {
      return;
    }

    setIsDisconnecting(true);
    try {
      const response = await fetch("/api/profile/bluesky/disconnect", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Bluesky account disconnected successfully");
        await fetchConnectionStatus();
      } else {
        toast.error("Failed to disconnect Bluesky account");
      }
    } catch (error) {
      console.error("Error disconnecting Bluesky account:", error);
      toast.error("Failed to disconnect Bluesky account");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleToggleAutoPost = async (enabled: boolean) => {
    setIsTogglingAutoPost(true);
    try {
      const response = await fetch("/api/profile/bluesky/toggle-autopost", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ autoPost: enabled }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(enabled ? "Auto-posting enabled" : "Auto-posting disabled");
        setConnectionStatus(prev => prev ? { ...prev, autoPost: enabled } : null);
      } else {
        toast.error(data.error || "Failed to update auto-post setting");
      }
    } catch (error) {
      console.error("Error updating auto-post setting:", error);
      toast.error("Failed to update auto-post setting");
    } finally {
      setIsTogglingAutoPost(false);
    }
  };

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!connectionStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load Bluesky settings</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/profile")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <LinkIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Bluesky Cross-Posting</h1>
            <p className="text-muted-foreground mt-1">
              Connect once, post forever - seamless Bluesky integration
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Info Alert */}
          <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertDescription>
              <strong>Industry-Standard Authorization</strong> - Connect your Bluesky account once with an app password. 
              Your access token is encrypted and stored securely. After setup, broadcasts happen automatically—no more password prompts.
            </AlertDescription>
          </Alert>

          {/* 90-Day Refresh Token Notice */}
          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 dark:text-blue-100">
              <strong className="block mb-1">🔄 Automatic Token Refresh (90 Days)</strong>
              <p className="text-sm">
                Your Bluesky connection uses a <strong>refresh token</strong> that's valid for approximately <strong>90 days</strong>. 
                As long as you use BtA within that timeframe, your connection is automatically refreshed in the background—<strong>you'll never need to re-enter your app password</strong>.
              </p>
              <p className="text-sm mt-2 text-blue-700 dark:text-blue-300">
                ⚠️ <strong>Only if you're inactive for 90+ days</strong> (don't visit BtA at all), your refresh token will expire, and you'll need to reconnect by re-entering your app password. 
                Otherwise, enjoy seamless, permanent cross-posting! ✨
              </p>
            </AlertDescription>
          </Alert>

          {/* Connection Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {connectionStatus.isConnected ? (
                  <>
                    <Check className="h-5 w-5 text-green-600" />
                    Connected to Bluesky
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    Not Connected
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {connectionStatus.isConnected
                  ? "Your Bluesky account is connected and ready for one-click broadcasting"
                  : "Connect your Bluesky account to enable seamless cross-posting"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectionStatus.isConnected ? (
                <>
                  {/* Connected Account Info */}
                  <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Bluesky Handle</span>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-background px-2 py-1 rounded">
                          @{connectionStatus.handle}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(`https://bsky.app/profile/${connectionStatus.handle}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {connectionStatus.connectedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Connected Since</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(connectionStatus.connectedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <div className="flex items-center gap-2">
                        {connectionStatus.isTokenValid ? (
                          <>
                            <Check className="h-3 w-3 text-green-600" />
                            <span className="text-sm text-green-600">Token Valid</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 text-amber-600" />
                            <span className="text-sm text-amber-600">Needs Refresh</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Lock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Your access token is encrypted and stored securely
                      </span>
                    </div>
                  </div>

                  {/* Token Refresh Warning */}
                  {connectionStatus.needsReconnect && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your Bluesky connection needs to be refreshed. Please disconnect and reconnect with your app password.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <>
                  {/* Connection Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="identifier">Bluesky Handle or Email</Label>
                      <Input
                        id="identifier"
                        type="text"
                        placeholder="user.bsky.social or your@email.com"
                        value={identifierInput}
                        onChange={(e) => setIdentifierInput(e.target.value)}
                        disabled={isConnecting}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter your Bluesky handle or the email you use to sign in
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="appPassword">App Password</Label>
                      <Input
                        id="appPassword"
                        type="text"
                        placeholder="xxxx-xxxx-xxxx-xxxx"
                        value={appPasswordInput}
                        onChange={(e) => setAppPasswordInput(e.target.value)}
                        disabled={isConnecting}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Format: xxxx-xxxx-xxxx-xxxx (16 characters with dashes)
                      </p>
                    </div>

                    <Button
                      onClick={handleConnectAccount}
                      disabled={isConnecting || !identifierInput.trim() || !appPasswordInput.trim()}
                      className="w-full"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Connect Bluesky Account
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Help Instructions */}
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs space-y-2">
                      <p className="font-semibold">How to generate a Bluesky App Password:</p>
                      <ol className="list-decimal ml-4 space-y-1">
                        <li>Open <a href="https://bsky.app" target="_blank" rel="noopener noreferrer" className="text-turquoise-600 hover:underline">bsky.app</a> and sign in</li>
                        <li>Go to Settings → Privacy and Security → App Passwords</li>
                        <li>Click "Add App Password"</li>
                        <li>Name it "Bridging the Aisle" and generate</li>
                        <li>Copy the password (format: xxxx-xxxx-xxxx-xxxx)</li>
                        <li>Paste it above to connect</li>
                      </ol>
                      <p className="text-amber-600 flex items-center gap-1 mt-2">
                        <ShieldCheck className="h-3 w-3" />
                        <strong>Security:</strong> Your app password will be converted to an encrypted access token. The original password is never stored.
                      </p>
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>

          {/* Settings Card (only when connected) */}
          {connectionStatus.isConnected && (
            <Card>
              <CardHeader>
                <CardTitle>Cross-Posting Settings</CardTitle>
                <CardDescription>
                  Control how your posts are shared to Bluesky
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Auto-Post Toggle - LEFT SIDE */}
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="autoPost" className="text-base font-semibold">
                      Enable Bluesky Cross-Posting
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically post your BtA content to Bluesky without password prompts
                    </p>
                  </div>
                  <Switch
                    id="autoPost"
                    checked={connectionStatus.autoPost}
                    onCheckedChange={handleToggleAutoPost}
                    disabled={isTogglingAutoPost || connectionStatus.needsReconnect}
                    className="ml-4"
                  />
                </div>

                {connectionStatus.autoPost && (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Your new public posts will automatically be shared to Bluesky. You can still manually broadcast individual posts from the post menu.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Disconnect Button - RIGHT SIDE, FAR FROM TOGGLE */}
                <div className="flex justify-end pt-6 border-t">
                  <Button
                    variant="destructive"
                    onClick={handleDisconnectAccount}
                    disabled={isDisconnecting}
                  >
                    {isDisconnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      <>
                        <Unlink className="h-4 w-4 mr-2" />
                        Disconnect Bluesky Account
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* How It Works Card */}
          <Card className="border-turquoise-200 bg-turquoise-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-turquoise-600" />
                How the Authorization Flow Works
              </CardTitle>
              <CardDescription>
                Industry-standard secure token management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-turquoise-600 text-white text-xs font-bold">
                    1
                  </span>
                  <div>
                    <strong>One-Time Setup:</strong> You enter your Bluesky app password once during the initial connection.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-turquoise-600 text-white text-xs font-bold">
                    2
                  </span>
                  <div>
                    <strong>Secure Authentication:</strong> We authenticate with Bluesky and receive both an access token and a refresh token.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-turquoise-600 text-white text-xs font-bold">
                    3
                  </span>
                  <div>
                    <strong>Encrypted Storage:</strong> Both tokens are encrypted using AES-256-GCM and stored securely in our database.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-turquoise-600 text-white text-xs font-bold">
                    4
                  </span>
                  <div>
                    <strong>One-Click Broadcasting:</strong> When you post, we decrypt your token and authenticate automatically—no password prompts.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-turquoise-600 text-white text-xs font-bold">
                    5
                  </span>
                  <div>
                    <strong>Automatic Refresh (90 Days):</strong> Your refresh token automatically renews your connection in the background. 
                    As long as you use BtA within 90 days, you'll never need to re-enter your password. Only after 90+ days of complete inactivity will reconnection be required.
                  </div>
                </li>
              </ol>
              <Alert className="mt-4">
                <Lock className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Your Security is Our Priority:</strong> Your app password is never stored. Only the encrypted access token remains in our database, 
                  protected by AES-256-GCM encryption with a key derived from your session secret. You can disconnect at any time to revoke access.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
