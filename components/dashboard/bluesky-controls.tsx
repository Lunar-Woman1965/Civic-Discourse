
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, RefreshCw, ExternalLink, Info, Heart, Repeat2, MessageCircle, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BlueskyControlsProps {
  postId: string;
  postAuthorId: string;
  currentUserId: string;
  postContent: string; // Added to calculate character limits
  atprotoUri: string | null;
  atprotoBroadcastedAt: Date | null;
  atprotoSyncedAt: Date | null;
  atprotoLikeCount?: number;
  atprotoRepostCount?: number;
  atprotoReplyCount?: number;
  atprotoEngagementSyncedAt?: Date | null;
  onBroadcastSuccess?: () => void;
  onSyncSuccess?: () => void;
}

export default function BlueskyControls({
  postId,
  postAuthorId,
  currentUserId,
  postContent,
  atprotoUri,
  atprotoBroadcastedAt,
  atprotoSyncedAt,
  atprotoLikeCount,
  atprotoRepostCount,
  atprotoReplyCount,
  atprotoEngagementSyncedAt,
  onBroadcastSuccess,
  onSyncSuccess,
}: BlueskyControlsProps) {
  const [broadcastDialogOpen, setBroadcastDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [engagementDialogOpen, setEngagementDialogOpen] = useState(false);
  const [appPassword, setAppPassword] = useState(""); // Still needed for sync features
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingEngagement, setIsSyncingEngagement] = useState(false);

  const isOwnPost = postAuthorId === currentUserId;
  const isBroadcasted = !!atprotoUri;
  const hasEngagement = (atprotoLikeCount || 0) + (atprotoRepostCount || 0) + (atprotoReplyCount || 0) > 0;

  // Calculate character count for Bluesky limit with URL-aware logic
  // Bluesky limit is 300 graphemes, attribution adds author name + footer
  const BLUESKY_LIMIT = 300;
  // Format: "\n\nPosted by [Name] (@username)\n🌉 via Bridging the Aisle\n[URL]"
  const ATTRIBUTION_LENGTH = 110; // Conservative estimate including typical name lengths
  const MAX_CONTENT_LENGTH = BLUESKY_LIMIT - ATTRIBUTION_LENGTH; // ~190 chars for content
  const cleanContent = postContent.replace(/<[^>]*>/g, ''); // Remove HTML tags
  const contentLength = cleanContent.length;
  
  // Extract URLs to show accurate truncation info
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = cleanContent.match(urlRegex) || [];
  const totalUrlLength = urls.reduce((sum, url) => sum + url.length, 0);
  const textOnlyLength = contentLength - totalUrlLength;
  
  // Calculate if truncation is needed
  const willBeTruncated = contentLength > MAX_CONTENT_LENGTH;
  const isOverLimit = contentLength > BLUESKY_LIMIT; // Severe warning if way over
  
  // Show user what will actually fit
  const urlsWillFit = totalUrlLength <= MAX_CONTENT_LENGTH;
  const spaceForTextAfterUrls = urlsWillFit ? MAX_CONTENT_LENGTH - totalUrlLength : 0;

  // Handler to initiate broadcast - now centralized through platform account
  const initiateBroadcast = async () => {
    setBroadcastDialogOpen(true);
  };

  const handleBroadcast = async () => {
    setIsBroadcasting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      // ALWAYS log the full response for debugging
      console.log('===== BROADCAST RESPONSE =====');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('OK:', response.ok);
      console.log('Full Data:', JSON.stringify(data, null, 2));
      console.log('==============================');

      if (response.ok) {
        // Check if content was truncated and inform user
        if (data.wasTruncated) {
          toast.success(
            "✅ Post broadcasted to Bluesky!\n\n" +
            "ℹ️ Content was truncated to fit 300 characters.\n" +
            "✓ All links were preserved intact.",
            { duration: 6000 }
          );
        } else {
          toast.success(data.message || "Post broadcasted to Bluesky!");
        }
        setBroadcastDialogOpen(false);
        onBroadcastSuccess?.();
      } else {
        // Log ALL error responses
        console.error('🔴 BROADCAST FAILED:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          fullData: data,
        });
        
        // Provide helpful error messages with actionable guidance
        if (response.status === 403 && data.error?.includes('Broadcasting not enabled')) {
          toast.error(
            "Please link your Bluesky account and enable broadcasting in AT Protocol settings first.",
            { duration: 5000 }
          );
        } else if (response.status === 401) {
          // Check if it's a rate limit error
          if (data.error?.includes('Rate Limit') || data.error?.includes('rate limit')) {
            toast.error(
              `⏳ Bluesky Rate Limit Reached\n\n` +
              `You've tried to authenticate too many times.\n\n` +
              `✅ SOLUTION:\n` +
              `1. Wait 10-15 minutes before trying again\n` +
              `2. OR connect your account in AT Protocol Settings (one-time setup)\n` +
              `3. This will enable instant broadcasting without passwords\n\n` +
              `📍 Your post will be automatically truncated to fit Bluesky's 300-character limit with all links preserved.`,
              { duration: 10000 }
            );
          } else {
            // Other authentication errors
            toast.error(
              `Authentication Failed\n\n` +
              `Handle: @${data.handle || 'unknown'}\n` +
              `Email: ${data.email || 'Not set'}\n` +
              `Authenticating with: ${data.identifier || 'unknown'}\n\n` +
              `🔍 CHECK BROWSER CONSOLE for full error details (F12 → Console tab)\n\n` +
              `${data.error || 'Invalid Bluesky credentials'}`,
              { 
                duration: 15000,
                style: {
                  minWidth: '500px',
                  whiteSpace: 'pre-line',
                }
              }
            );
          }
        } else if (response.status === 400 && data.error?.includes('app password')) {
          toast.error("Invalid Bluesky app password. Please check your credentials.");
        } else {
          toast.error(data.error || "Failed to broadcast");
        }
      }
    } catch (error) {
      console.error("🚨 BROADCAST EXCEPTION:", error);
      toast.error("Failed to broadcast to Bluesky");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleSync = async () => {
    if (!appPassword) {
      toast.error("Please enter your Bluesky app password");
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch(`/api/posts/${postId}/sync-replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          data.imported > 0
            ? `Imported ${data.imported} new ${data.imported === 1 ? "reply" : "replies"}`
            : "No new replies"
        );
        setSyncDialogOpen(false);
        setAppPassword("");
        onSyncSuccess?.();
      } else {
        toast.error(data.error || "Failed to sync replies");
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync replies");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncEngagement = async () => {
    if (!appPassword) {
      toast.error("Please enter your Bluesky app password");
      return;
    }

    setIsSyncingEngagement(true);
    try {
      const response = await fetch(`/api/posts/${postId}/sync-engagement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        const { engagement } = data;
        toast.success(
          `Synced: ${engagement.likeCount} likes, ${engagement.repostCount} reposts, ${engagement.replyCount} replies`
        );
        setEngagementDialogOpen(false);
        setAppPassword("");
        onSyncSuccess?.();
      } else {
        toast.error(data.error || "Failed to sync engagement");
      }
    } catch (error) {
      console.error("Engagement sync error:", error);
      toast.error("Failed to sync engagement");
    } finally {
      setIsSyncingEngagement(false);
    }
  };

  if (!isOwnPost) {
    // Show read-only status for other users' posts
    if (isBroadcasted) {
      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="flex items-center gap-1">
            <Share2 className="h-3 w-3" />
            Shared on Bluesky
          </Badge>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {!isBroadcasted ? (
        <>
          {/* Broadcast button - centralized platform broadcasting */}
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={initiateBroadcast}
            disabled={isBroadcasting}
          >
            {isBroadcasting ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Broadcasting...</>
            ) : (
              <><Share2 className="h-3 w-3" /> Share to Bluesky</>
            )}
          </Button>
          
          {/* Broadcast confirmation dialog */}
          <Dialog open={broadcastDialogOpen} onOpenChange={setBroadcastDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Share Post to Bluesky
              </DialogTitle>
              <DialogDescription>
                This post will be shared to Bluesky through the BTA platform account with your name attributed as the author.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg border border-turquoise-200 bg-turquoise-50 p-3">
                <div className="flex gap-2">
                  <Info className="h-4 w-4 text-turquoise-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-turquoise-900">
                    <p className="font-medium mb-1">
                      Centralized Broadcasting
                    </p>
                    <p className="text-xs">
                      All BTA posts are broadcast through our platform account. Your post will include your name and link back to the original discussion. No Bluesky account required!
                    </p>
                  </div>
                </div>
              </div>
              {/* Character limit info */}
              {willBeTruncated && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="flex gap-2">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">
                        ✂️ Auto-Truncation Enabled
                      </p>
                      <div className="text-xs space-y-1">
                        <p>Your post: <span className="font-semibold">{contentLength}</span> characters total</p>
                        {urls.length > 0 && (
                          <>
                            <p>• URLs: <span className="font-semibold">{totalUrlLength}</span> chars ({urls.length} link{urls.length > 1 ? 's' : ''}) - <span className="text-green-700 font-semibold">will be preserved</span></p>
                            <p>• Text: <span className="font-semibold">{textOnlyLength}</span> chars</p>
                          </>
                        )}
                        <p>Bluesky limit: <span className="font-semibold">{BLUESKY_LIMIT}</span> characters (with attribution)</p>
                        {urls.length > 0 ? (
                          <p className="mt-2 text-green-700 font-semibold">
                            {urlsWillFit 
                              ? `✅ Your ${urls.length} URL${urls.length > 1 ? 's' : ''} will be preserved! Text will auto-shorten to ~${spaceForTextAfterUrls} chars.`
                              : `✅ All ${urls.length} URL${urls.length > 1 ? 's' : ''} will be preserved! Text will be minimal.`
                            }
                          </p>
                        ) : (
                          <p className="mt-2 text-green-700 font-semibold">
                            ✅ Your text will be automatically shortened to fit. You can broadcast any length post!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBroadcastDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleBroadcast} disabled={isBroadcasting}>
                {isBroadcasting ? "Broadcasting..." : "Broadcast to Bluesky"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </>
      ) : (
        // Synced status and sync button
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Share2 className="h-3 w-3" />
            On Bluesky
          </Badge>

          {/* Engagement Metrics (Phase 4) */}
          {hasEngagement && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {atprotoLikeCount! > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {atprotoLikeCount}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bluesky Likes</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {atprotoRepostCount! > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1">
                      <Repeat2 className="h-3 w-3" />
                      {atprotoRepostCount}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bluesky Reposts</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {atprotoReplyCount! > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {atprotoReplyCount}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bluesky Replies</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}

          {/* Sync Engagement Button (Phase 4) */}
          {isOwnPost && (
            <Dialog open={engagementDialogOpen} onOpenChange={setEngagementDialogOpen}>
              <DialogTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <TrendingUp className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sync engagement metrics from Bluesky</p>
                  </TooltipContent>
                </Tooltip>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sync Bluesky Engagement</DialogTitle>
                  <DialogDescription>
                    Update likes, reposts, and reply counts from Bluesky
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="engagementPassword">Bluesky App Password</Label>
                    <Input
                      id="engagementPassword"
                      type="password"
                      placeholder="Enter your Bluesky app password"
                      value={appPassword}
                      onChange={(e) => setAppPassword(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Required to fetch engagement metrics from Bluesky
                    </p>
                  </div>
                  {atprotoEngagementSyncedAt && (
                    <p className="text-xs text-muted-foreground">
                      Last synced: {new Date(atprotoEngagementSyncedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEngagementDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSyncEngagement} disabled={isSyncingEngagement}>
                    {isSyncingEngagement ? "Syncing..." : "Sync Engagement"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
            <DialogTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sync replies from Bluesky</p>
                </TooltipContent>
              </Tooltip>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sync Bluesky Replies</DialogTitle>
                <DialogDescription>
                  Import replies from Bluesky as comments on your BtA post.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="syncPassword">Bluesky App Password</Label>
                  <Input
                    id="syncPassword"
                    type="password"
                    placeholder="Enter your Bluesky app password"
                    value={appPassword}
                    onChange={(e) => setAppPassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Required to fetch replies from Bluesky
                  </p>
                </div>
                {atprotoSyncedAt && (
                  <p className="text-xs text-muted-foreground">
                    Last synced: {new Date(atprotoSyncedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSyncDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSync} disabled={isSyncing}>
                  {isSyncing ? "Syncing..." : "Sync Replies"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {atprotoUri && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => {
                    const handle = atprotoUri.split("/")[2];
                    const rkey = atprotoUri.split("/").pop();
                    window.open(
                      `https://bsky.app/profile/${handle}/post/${rkey}`,
                      "_blank"
                    );
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View on Bluesky</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
}


// DEPLOYMENT TIMESTAMP: 2025-11-25 01:53:03
// This comment forces Next.js to rebuild this component

// FORCED REBUILD: 2025-11-25 02:01:22 UTC
// Git hash would go here in production
