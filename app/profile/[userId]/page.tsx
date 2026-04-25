"use client";

import { RoleBadge } from "@/components/role-badge";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Shield,
  Lock,
  UserPlus,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import {
  getPoliticalLeaningLabel,
  getPoliticalIdentifierColor,
} from "@/lib/political-utils";
import { getDisplayName } from "@/lib/display-name-utils";
import { toast } from "react-hot-toast";
import { generateAvatarDataUrl } from "@/lib/avatar-utils";

type Role = "USER" | "MODERATOR" | "PLATFORM_FOUNDER";

interface UserProfileData {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  displayNamePreference: string | null;
  bio: string | null;
  profileImage: string | null;
  useAvatar: boolean;
  avatarStyle: string | null;
  avatarSeed: string | null;
  politicalLeaning: string | null;
  civilityScore: number;
  joinedAt: string;
  role?: Role | null;
  isFounder?: boolean;
  isAdmin?: boolean;
  isVerified: boolean;
  profileVisibility: string | null;
  atprotoHandle: string | null;
  atprotoDid: string | null;
  friendshipStatus?: string | null;
  posts: Array<{
    id: string;
    content: string;
    createdAt: string;
    _count: {
      reactions: number;
      comments: number;
    };
  }>;
}

export default function UserProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && userId) {
      fetchUserProfile();
    }
  }, [status, userId]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/profile/${userId}`);

      if (response.status === 404) {
        setError("User not found");
        return;
      }

      if (response.status === 403) {
        setError("This profile is private");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load profile");
      }

      const data = await response.json();
      setProfile(data.user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      setIsSendingRequest(true);

      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverId: userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send friend request");
      }

      toast.success("Friend request sent!");
      fetchUserProfile();
    } catch (error: any) {
      toast.error(error.message || "Failed to send friend request");
    } finally {
      setIsSendingRequest(false);
    }
  };

  const getProfilePhotoUrl = (path: string | null) => {
    if (!path) return undefined;
    return `/api/profile/photo/${encodeURIComponent(path)}`;
  };

  const getCurrentAvatarUrl = () => {
    if (profile?.useAvatar && profile.avatarStyle && profile.avatarSeed) {
      return generateAvatarDataUrl(profile.avatarStyle, profile.avatarSeed);
    }

    return getProfilePhotoUrl(profile?.profileImage || null);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-creamy-tan-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-creamy-tan-50 to-white">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card>
            <CardContent className="py-12 text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h1 className="text-2xl font-bold mb-2">
                {error || "Profile unavailable"}
              </h1>
              <p className="text-muted-foreground">
                This profile could not be loaded.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const displayName = getDisplayName(profile);
  const avatarFallback =
    profile.firstName?.[0] ||
    profile.username?.[0] ||
    profile.name?.[0] ||
    "U";

  const isOwnProfile = session?.user?.id === profile.id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-creamy-tan-50 to-white">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={getCurrentAvatarUrl()} alt={displayName} />
                  <AvatarFallback className="text-2xl">
                    {avatarFallback.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-bold">{displayName}</h1>

                    <RoleBadge
                      role={profile.role}
                      isFounder={profile.isFounder}
                      isAdmin={profile.isAdmin}
                    />

                    {profile.isVerified && (
                      <Badge
                        variant="secondary"
                        className="font-semibold border-green-200 bg-green-100 text-green-800"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {profile.username && (
                    <p className="text-muted-foreground mt-1">
                      @{profile.username}
                    </p>
                  )}

                  {profile.politicalLeaning && (
                    <Badge
                      variant="outline"
                      className={`mt-3 ${getPoliticalIdentifierColor(
                        profile.politicalLeaning
                      )}`}
                    >
                      {getPoliticalLeaningLabel(profile.politicalLeaning)}
                    </Badge>
                  )}
                </div>
              </div>

              {!isOwnProfile && (
                <div className="flex flex-col gap-2">
                  {profile.friendshipStatus === "ACCEPTED" ? (
                    <Button variant="outline" disabled>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Friends
                    </Button>
                  ) : profile.friendshipStatus === "PENDING" ? (
                    <Button variant="outline" disabled>
                      Request Pending
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSendFriendRequest}
                      disabled={isSendingRequest}
                    >
                      {isSendingRequest ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      Add Friend
                    </Button>
                  )}
                </div>
              )}
            </div>

            {profile.bio && (
              <p className="mt-6 whitespace-pre-wrap text-sm leading-6">
                {profile.bio}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Joined{" "}
                {new Date(profile.joinedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>

              {profile.atprotoHandle && (
                <a
                  href={`https://bsky.app/profile/${profile.atprotoHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary"
                >
                  <ExternalLink className="h-4 w-4" />
                  {profile.atprotoHandle}
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Account Information</h2>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Platform Role
                </span>

                <RoleBadge
                  role={profile.role}
                  isFounder={profile.isFounder}
                  isAdmin={profile.isAdmin}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Civility Score
                </span>
                <span className="font-medium">{profile.civilityScore}</span>
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

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Recent Posts</h2>
            </CardHeader>

            <CardContent>
              {profile.posts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  This user has not posted yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {profile.posts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-lg border bg-white p-4 shadow-sm"
                    >
                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {post.content}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {new Date(post.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                        <span>{post._count.reactions} reactions</span>
                        <span>{post._count.comments} comments</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}