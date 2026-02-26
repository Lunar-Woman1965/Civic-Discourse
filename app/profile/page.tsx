
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, User, Calendar, AlertTriangle, UserX, ArrowLeft, Lock, Sparkles, Link, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AvatarCreator from "@/components/avatar-creator";
import { generateAvatarDataUrl } from "@/lib/avatar-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { signOut } from "next-auth/react";
import { toast } from "react-hot-toast";
import { POLITICAL_LEANINGS, getPoliticalLeaningLabel } from "@/lib/political-utils";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  bio: string | null;
  profileImage: string | null;
  useAvatar: boolean;
  avatarStyle: string | null;
  avatarSeed: string | null;
  politicalLeaning: string | null;
  civilityScore: number;
  joinedAt: string;
  isVerified: boolean;
  password: string | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    bio: "",
    politicalLeaning: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setFormData({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          username: data.user.username || "",
          bio: data.user.bio || "",
          politicalLeaning: data.user.politicalLeaning || "",
        });
      } else {
        toast.error("Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        toast.success("Profile updated successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profile/upload-photo", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        toast.success("Profile photo updated successfully!");
        router.refresh(); // Refresh all server-side data to show updated photo everywhere
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to upload photo");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to upload photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const getProfilePhotoUrl = (path: string | null) => {
    if (!path) return null;
    // Return API route that will handle S3 signed URL
    return `/api/profile/photo/${encodeURIComponent(path)}`;
  };

  const getCurrentAvatarUrl = () => {
    if (profile?.useAvatar && profile.avatarStyle && profile.avatarSeed) {
      return generateAvatarDataUrl(profile.avatarStyle, profile.avatarSeed);
    }
    return getProfilePhotoUrl(profile?.profileImage || null) || undefined;
  };

  const handleAvatarCreate = async (style: string, seed: string) => {
    try {
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatarStyle: style, avatarSeed: seed }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        toast.success("Avatar updated successfully!");
        router.refresh(); // Refresh all server-side data to show updated avatar everywhere
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update avatar");
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error("Failed to update avatar");
    }
  };

  const handleRemovePhoto = async () => {
    setIsRemovingPhoto(true);
    try {
      const response = await fetch("/api/profile/remove-photo", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        toast.success("Profile photo removed successfully!");
        router.refresh(); // Refresh all server-side data
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to remove photo");
      }
    } catch (error) {
      console.error("Error removing photo:", error);
      toast.error("Failed to remove photo");
    } finally {
      setIsRemovingPhoto(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsRemovingAvatar(true);
    try {
      const response = await fetch("/api/profile/remove-avatar", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        toast.success("Avatar removed successfully!");
        router.refresh(); // Refresh all server-side data
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to remove avatar");
      }
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast.error("Failed to remove avatar");
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      const response = await fetch("/api/profile/deactivate", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Account deactivated successfully");
        // Sign out the user
        await signOut({ callbackUrl: "/auth/signin" });
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to deactivate account");
      }
    } catch (error) {
      toast.error("Failed to deactivate account");
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/profile/delete", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Account deleted successfully");
        // Sign out the user
        await signOut({ callbackUrl: "/auth/signin" });
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete account");
      }
    } catch (error) {
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/atproto-settings")}
            >
              <Link className="h-4 w-4 mr-2" />
              Bluesky
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/privacy-settings")}
            >
              <Lock className="h-4 w-4 mr-2" />
              Privacy
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Profile Photo Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>
                Upload a photo or create a custom avatar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6">
                {/* Current Avatar Display */}
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage
                      src={getCurrentAvatarUrl()}
                      alt={profile.name || "Profile"}
                    />
                    <AvatarFallback className="text-3xl">
                      {profile.firstName?.[0]}
                      {profile.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>

                {/* Tabs for Upload or Create */}
                <Tabs defaultValue={profile.useAvatar ? "avatar" : "upload"} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </TabsTrigger>
                    <TabsTrigger value="avatar">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create Avatar
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="mt-4">
                    <div className="flex flex-col items-center gap-4">
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={isUploadingPhoto}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("photo-upload")?.click()}
                        disabled={isUploadingPhoto}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploadingPhoto ? "Uploading..." : "Choose Photo"}
                      </Button>
                      {profile?.profileImage && !profile?.useAvatar && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRemovePhoto}
                          disabled={isRemovingPhoto}
                          className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isRemovingPhoto ? "Removing..." : "Remove Photo"}
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground text-center">
                        Max size: 5MB. Supports JPG, PNG, GIF
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="avatar" className="mt-4">
                    <AvatarCreator
                      onAvatarCreate={handleAvatarCreate}
                      initialStyle={profile.avatarStyle || undefined}
                      initialSeed={profile.avatarSeed || undefined}
                    />
                    {profile?.useAvatar && profile?.avatarStyle && (
                      <div className="mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRemoveAvatar}
                          disabled={isRemovingAvatar}
                          className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isRemovingAvatar ? "Removing..." : "Remove Avatar"}
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and political affiliation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username (Pseudonym)</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="Choose a username for privacy"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional. Use a username instead of your real name for privacy. Must be unique.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="politicalLeaning">Political Affiliation</Label>
                  <Select
                    value={formData.politicalLeaning}
                    onValueChange={(value) =>
                      setFormData({ ...formData, politicalLeaning: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your political affiliation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Prefer not to say</SelectItem>
                      {POLITICAL_LEANINGS.map((leaning) => (
                        <SelectItem key={leaning.value} value={leaning.value}>
                          {leaning.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.bio.length}/500 characters
                  </p>
                </div>

                <Button type="submit" disabled={isSaving} className="w-full">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Section */}
          {profile.password && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      placeholder="Enter your current password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      placeholder="Enter your new password"
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters long
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      placeholder="Confirm your new password"
                      required
                      minLength={8}
                    />
                  </div>

                  <Button type="submit" disabled={isChangingPassword} className="w-full">
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Change Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined</span>
                </div>
                <span className="font-medium">
                  {new Date(profile.joinedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {profile.politicalLeaning && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Political Affiliation
                  </span>
                  <span className="font-medium">
                    {getPoliticalLeaningLabel(profile.politicalLeaning)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that will affect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Deactivate Account */}
              <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
                <div className="flex-1">
                  <h4 className="font-medium text-orange-900">Deactivate Account</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Temporarily disable your account. You can reactivate it later by signing in again.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-100">
                      <UserX className="h-4 w-4 mr-2" />
                      Deactivate
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deactivate Your Account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your account will be temporarily deactivated. You can reactivate it at any time by signing in again.
                        Your posts, comments, and profile information will be preserved.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeactivating}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeactivate}
                        disabled={isDeactivating}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        {isDeactivating ? "Deactivating..." : "Deactivate Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Delete Account */}
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex-1">
                  <h4 className="font-medium text-red-900">Delete Account Permanently</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-600">
                        Delete Your Account Permanently?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        <div className="space-y-2">
                          <p className="font-semibold text-red-700">This action cannot be undone!</p>
                          <p>All of your data will be permanently deleted, including:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>Your profile and personal information</li>
                            <li>All posts and comments you've created</li>
                            <li>Your reactions and interactions</li>
                            <li>Friend connections and group memberships</li>
                            <li>Notification history</li>
                          </ul>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
