
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft, Shield, Download, Eye, EyeOff, User, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import { Separator } from "@/components/ui/separator";

interface PrivacySettings {
  displayNamePreference: string;
  showEmail: boolean;
  showPoliticalLeaning: boolean;
  showLastActive: boolean;
  profileVisibility: string;
  allowSearch: boolean;
  dataCollectionConsent: boolean;
}

export default function PrivacySettingsPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchPrivacySettings();
    }
  }, [status]);

  const fetchPrivacySettings = async () => {
    try {
      const response = await fetch("/api/profile/privacy");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.privacy);
      } else {
        toast.error("Failed to load privacy settings");
      }
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
      toast.error("Failed to load privacy settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/profile/privacy", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Privacy settings updated successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update privacy settings");
      }
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast.error("Failed to update privacy settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/profile/export");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bridgingtheaisle-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Data exported successfully!");
      } else {
        toast.error("Failed to export data");
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load privacy settings</p>
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
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Privacy Settings</h1>
        </div>

        <div className="grid gap-6">
          {/* Display Name Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Display Name Preferences
              </CardTitle>
              <CardDescription>
                Control how your name appears to other users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayNamePreference">What should others see?</Label>
                <Select
                  value={settings.displayNamePreference}
                  onValueChange={(value) =>
                    setSettings({ ...settings, displayNamePreference: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="username_only">Username only (most private)</SelectItem>
                    <SelectItem value="real_name">Real name only</SelectItem>
                    <SelectItem value="username_or_name">Username if set, otherwise real name</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {settings.displayNamePreference === "username_only" && "Others will only see your username. Make sure you've set one in your profile."}
                  {settings.displayNamePreference === "real_name" && "Others will see your first and last name."}
                  {settings.displayNamePreference === "username_or_name" && "If you have a username, it will be shown; otherwise your real name."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Profile Visibility
              </CardTitle>
              <CardDescription>
                Control who can see your profile and posts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="profileVisibility">Who can view your profile?</Label>
                <Select
                  value={settings.profileVisibility}
                  onValueChange={(value) =>
                    setSettings({ ...settings, profileVisibility: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public (anyone can view)</SelectItem>
                    <SelectItem value="friends_only">Friends only</SelectItem>
                    <SelectItem value="private">Private (only you)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow others to search for you</Label>
                  <p className="text-sm text-muted-foreground">
                    Let other users find you via the search feature
                  </p>
                </div>
                <Switch
                  checked={settings.allowSearch}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, allowSearch: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Information Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <EyeOff className="h-5 w-5" />
                Information Display
              </CardTitle>
              <CardDescription>
                Choose what information is visible to others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show email address</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your email on your public profile
                  </p>
                </div>
                <Switch
                  checked={settings.showEmail}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showEmail: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show political affiliation</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your political leaning on posts and profile
                  </p>
                </div>
                <Switch
                  checked={settings.showPoliticalLeaning}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showPoliticalLeaning: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show last active time</Label>
                  <p className="text-sm text-muted-foreground">
                    Let others see when you were last online
                  </p>
                </div>
                <Switch
                  checked={settings.showLastActive}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showLastActive: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Data Collection & Security
              </CardTitle>
              <CardDescription>
                Manage how we collect and use your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label>Device fingerprinting for security</Label>
                  <p className="text-sm text-muted-foreground">
                    Allows us to detect suspicious activity and prevent ban evasion. 
                    Disabling this improves privacy but reduces security protections.
                  </p>
                </div>
                <Switch
                  checked={settings.dataCollectionConsent}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, dataCollectionConsent: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Your Data
              </CardTitle>
              <CardDescription>
                Download a copy of all your data (GDPR compliance)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Get a complete copy of your personal data, including posts, comments, reactions, 
                and profile information in JSON format.
              </p>
              <Button
                variant="outline"
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export My Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Card className="bg-primary/5">
            <CardContent className="pt-6">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full"
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Save Privacy Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
