
"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Calendar, Shield, Lock, UserPlus, UserCheck, ExternalLink } from "lucide-react";
import { getPoliticalLeaningLabel, getPoliticalIdentifierColor } from "@/lib/political-utils";
import { getDisplayName } from "@/lib/display-name-utils";
import { toast } from "react-hot-toast";
import { generateAvatarDataUrl } from "@/lib/avatar-utils";

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
  isVerified: boolean;
  isAdmin: boolean;
  profileVisibility: string | null;
  atprotoHandle: string | null;
  atprotoDid: string | null;
  posts: Array<{
    id: string;
    content: string;
    createdAt: string;
    _count: {
      reactions: number;
      comments: number;
    };
  }>;
  friendshipStatus?: 'none' | 'pending' | 'accepted' | 'self';
}

export default function UserProfilePage() {
  const { data: session, status } = useSession() || {};
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
      fetchUserProfile(); // Refresh to update friendship status
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSendingRequest(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-creamy-tan-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-creamy-tan-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-creamy-tan-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Card>
            <CardContent className="p-12 text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">{error}</h2>
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

  // Check if viewing own profile
  if (profile.friendshipStatus === 'self') {
    router.push('/profile');
    return null;
  }

  const displayName = getDisplayName(profile);
  const avatarUrl = profile.useAvatar && profile.avatarStyle && profile.avatarSeed
    ? generateAvatarDataUrl(profile.avatarStyle, profile.avatarSeed)
    : profile.profileImage || null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-creamy-tan-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="mb-8">
          <CardHeader className="text-center pb-2">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32 border-4 border-creamy-tan-200">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-2xl bg-creamy-tan-100">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div className="flex items-center gap-2 justify-center">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {displayName}
                  </h1>
                  {profile.isVerified && (
                    <Shield className="h-6 w-6 text-blue-500" />
                  )}
                </div>

                {profile.bio && (
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    {profile.bio}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 justify-center">
                {profile.isAdmin && (
                  <Badge 
                    variant="secondary" 
                    className={`font-semibold ${
                      profile.name?.includes('Platform Founder')
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}
                  >
                    {profile.name?.includes('Platform Founder') 
                      ? '👑 Platform Founder' 
                      : '🛡️ Platform Moderator'
                    }
                  </Badge>
                )}
                {profile.politicalLeaning && (
                  <Badge 
                    className={`${getPoliticalIdentifierColor(profile.politicalLeaning)} text-white`}
                  >
                    {getPoliticalLeaningLabel(profile.politicalLeaning)}
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {new Date(profile.joinedAt).toLocaleDateString()}
                </Badge>
                {profile.atprotoHandle && (
                  <Badge 
                    variant="outline" 
                    className="flex items-center gap-1 cursor-pointer hover:bg-accent"
                    onClick={() => window.open(`https://bsky.app/profile/${profile.atprotoHandle}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                    @{profile.atprotoHandle}
                  </Badge>
                )}
              </div>

              {/* Friend Request Button */}
              {profile.friendshipStatus === 'none' && (
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

              {profile.friendshipStatus === 'pending' && (
                <Badge variant="secondary" className="mt-4">
                  Friend Request Pending
                </Badge>
              )}

              {profile.friendshipStatus === 'accepted' && (
                <Badge className="mt-4 bg-green-500 hover:bg-green-600">
                  <UserCheck className="mr-1 h-3 w-3" />
                  Friends
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Recent Posts */}
        {profile.posts && profile.posts.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Recent Posts</h2>
              <p className="text-sm text-gray-500">Click on any post to view and interact with it</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.posts.map((post) => (
                <Card 
                  key={post.id} 
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-creamy-tan-300"
                  onClick={() => router.push(`/dashboard?postId=${post.id}`)}
                >
                  <p className="text-gray-800 mb-3">
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
