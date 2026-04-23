"use client";

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
  role?: Role;
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
        setIsLoading(false);
        return;
      }

      if (response.status === 403) {
        setError("This profile is private");
        setIsLoading(false);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send friend request");
      }

      toast.success("Friend request sent!");
      fetchUserProfile();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSendingRequest(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-creamy-tan-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-creamy-tan-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-creamy-tan-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Card>
            <CardContent className="p-12 text-center">
              <Lock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h2 className="mb-2 text-xl font-semibold">{error}</h2>
              <p className="text-gray-600">
                {error === "This profile is private"
                  ? "This user has set their profile to private."
                  : "The profile you're looking for could not be found."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  if (profile.friendshipStatus === "self") {
    router.push("/profile");
    return null;
  }

  const displayName = getDisplayName(profile);
  const avatarUrl =
    profile.useAvatar && profile.avatarStyle && profile.avatarSeed
      ? generateAvatarDataUrl(profile.avatarStyle, profile.avatarSeed)
      : profile.profileImage || null;

  const roleLabel =
    profile.role === "PLATFORM_FOUNDER" || profile.isFounder
      ? "Founder"
      : profile.isAdmin
        ? "Admin"
        : profile.role === "MODERATOR"
          ? "Moderator"
          : null;

  const roleBadgeClassName =
    roleLabel === "Founder"
      ? "border-amber-300 bg-amber-100 text-amber-900"
      : roleLabel === "Admin"
        ? "border-red-200 bg-red-100 text-red-800"
        : "border-blue-200 bg-blue-100 text-blue-800";

  return (
    <div className="min-h-screen bg-gradient-to-b from-creamy-tan-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="rounded-lg p-4 shadow-md">
          <CardHeader className="pb-2 text-center">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32 border-4 border-creamy-tan-200">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-creamy-tan-100 text-2xl">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>

                  {profile.isVerified && <Shield className="h-6 w-6 text-blue-500" />}

                  {roleLabel && (
                    <Badge
                      variant="secondary"
                      className={`font-semibold ${roleBadgeClassName}`}
                    >
                      {roleLabel}
                    </Badge>
                  )}

                  {profile.politicalLeaning && (
                    <Badge
                      className={`${getPoliticalIdentifierColor(
                        profile.politicalLeaning
                      )} text-white`}
                    >
                      {getPoliticalLeaningLabel(profile.politicalLeaning)}
                    </Badge>
                  )}
                </div>

                {profile.bio && (
                  <p className="mx-auto max-w-2xl text-gray-600">{profile.bio}</p>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {new Date(profile.joinedAt).toLocaleDateString()}
                  </Badge>

                  {profile.atprotoHandle && (
                    <Badge
                      variant="outline"
                      className="flex cursor-pointer items-center gap-1 hover:bg-accent"
                      onClick={() =>
                        window.open(
                          `https://bsky.app/profile/${profile.atprotoHandle}`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="h-3 w-3" />
                      @{profile.atprotoHandle}
                    </Badge>
                  )}
                </div>
              </div>

              {profile.friendshipStatus === "none" && (
                <Button
                  onClick={handleSendFriendRequest}
                  disabled={isSendingRequest}
                  className="mt-4"
                >
                  {isSendingRequest ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  Send Friend Request
                </Button>
              )}

              {profile.friendshipStatus === "pending" && (
                <Badge variant="secondary" className="mt-4">
                  Friend Request Pending
                </Badge>
              )}

              {profile.friendshipStatus === "accepted" && (
                <Badge className="mt-4 bg-green-500 hover:bg-green-600">
                  <UserCheck className="mr-1 h-3 w-3" />
                  Friends
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {profile.posts.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">Recent Posts</h2>
              <p className="text-sm text-gray-500">
                Click on any post to view and interact with it
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.posts.map((post) => (
                <Card
                  key={post.id}
                  className="cursor-pointer p-4 transition-shadow duration-200 hover:border-creamy-tan-300 hover:shadow-lg"
                  onClick={() => router.push(`/dashboard?postId=${post.id}`)}
                >
                  <p className="mb-3 text-gray-800">
                    {post.content.length > 200
                      ? `${post.content.substring(0, 200)}...`
                      : post.content}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{post._count.reactions} reactions</span>
                    <span>•</span>
                    <span>{post._count.comments} comments</span>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}