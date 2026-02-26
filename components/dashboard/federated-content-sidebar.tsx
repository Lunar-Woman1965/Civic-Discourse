
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Globe, 
  ThumbsUp, 
  MessageCircle, 
  Repeat2, 
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExternalContent {
  id: string;
  platform: string;
  externalId: string;
  authorHandle: string;
  authorName: string;
  content: string;
  createdAt: string;
  importedAt: string;
  topics: string[];
  civilityScore: number;
  likeCount: number;
  replyCount: number;
  repostCount: number;
}

interface FederatedContentResponse {
  content: ExternalContent[];
  cached: boolean;
  imported?: number;
  timestamp: string;
  diagnostics?: {
    handles: string[];
    totalFetched: number;
    filterStats: {
      totalPosts: number;
      hobbyLifestyle: number;
      uncivilLanguage: number;
      notPoliticalCivic: number;
      tooShort: number;
      lowCivilityScore: number;
      safetyIssues: number;
      alreadyExists: number;
      approved: number;
      threadsFetched: number;
      threadsSkipped: number;
    };
    errors: string[] | null;
  } | null;
}

export function FederatedContentSidebar() {
  const [content, setContent] = useState<ExternalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [diagnostics, setDiagnostics] = useState<FederatedContentResponse['diagnostics']>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const fetchContent = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const url = forceRefresh 
        ? '/api/external-content?refresh=true&limit=10'
        : '/api/external-content?limit=10';
        
      const response = await fetch(url);
      
      // Handle different error status codes with specific messages
      if (!response.ok) {
        let errorMessage = 'Failed to load civic discussions from the fediverse';
        
        if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please wait 10-15 minutes before refreshing.';
          console.error('[FEDERATED CONTENT] Rate limit detected (429)');
        } else if (response.status === 502 || response.status === 503) {
          errorMessage = 'Bluesky is temporarily unavailable. Content will load from cache when available.';
          console.error(`[FEDERATED CONTENT] Upstream service error (${response.status})`);
        } else if (response.status === 401) {
          errorMessage = 'Authentication issue with Bluesky. This is temporary.';
          console.error('[FEDERATED CONTENT] Authentication error (401)');
        }
        
        // Try to parse error details from response
        try {
          const errorData = await response.json();
          if (errorData.error || errorData.details) {
            console.error('[FEDERATED CONTENT] Error details:', errorData);
            // Use the error message from the API if available
            if (errorData.details && typeof errorData.details === 'string') {
              errorMessage = errorData.details;
            }
          }
        } catch (parseError) {
          // If JSON parsing fails, use the default message
        }
        
        toast.error(errorMessage);
        
        // Still try to display cached content on error
        try {
          const cachedResponse = await fetch('/api/external-content?limit=10');
          if (cachedResponse.ok) {
            const cachedData: FederatedContentResponse = await cachedResponse.json();
            setContent(cachedData.content);
            setIsCached(true);
          }
        } catch (cacheError) {
          console.error('[FEDERATED CONTENT] Failed to load cached content:', cacheError);
        }
        
        return; // Exit early on error
      }

      const data: FederatedContentResponse = await response.json();
      setContent(data.content);
      setIsCached(data.cached);
      setDiagnostics(data.diagnostics || null);

      if (forceRefresh && data.imported !== undefined) {
        toast.success(`Imported ${data.imported} new discussions from Bluesky`);
        // Auto-show diagnostics after manual fetch
        if (data.diagnostics) {
          setShowDiagnostics(true);
        }
      }
    } catch (error) {
      console.error('[FEDERATED CONTENT] Fetch error:', error);
      toast.error('Unable to connect. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const getTopicColor = (topic: string): string => {
    const colors: Record<string, string> = {
      'policy': 'bg-blue-100 text-blue-800 border-blue-200',
      'bipartisan': 'bg-purple-100 text-purple-800 border-purple-200',
      'civic-engagement': 'bg-green-100 text-green-800 border-green-200',
      'congress': 'bg-amber-100 text-amber-800 border-amber-200',
      'election': 'bg-red-100 text-red-800 border-red-200',
      'healthcare': 'bg-pink-100 text-pink-800 border-pink-200',
      'economy': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'judiciary': 'bg-slate-100 text-slate-800 border-slate-200',
      'immigration': 'bg-orange-100 text-orange-800 border-orange-200',
      'environment': 'bg-teal-100 text-teal-800 border-teal-200',
      'education': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'foreign-policy': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'civil-rights': 'bg-violet-100 text-violet-800 border-violet-200',
      'veterans': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'homelessness': 'bg-rose-100 text-rose-800 border-rose-200',
      'local-government': 'bg-lime-100 text-lime-800 border-lime-200',
      'community-issues': 'bg-sky-100 text-sky-800 border-sky-200',
      'democracy': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
      'media-literacy': 'bg-orange-100 text-orange-800 border-orange-200',
      'dialogue': 'bg-purple-100 text-purple-800 border-purple-200',
      'general-politics': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[topic] || colors['general-politics'];
  };

  const getCivilityBadge = (score: number) => {
    if (score >= 80) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">High Quality</Badge>;
    } else if (score >= 50) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Good</Badge>;
    }
    return null;
  };

  const truncateContent = (text: string, maxLength: number = 200): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (loading) {
    return (
      <Card className="border-turquoise-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-turquoise-600" />
            Civic Dialogue from the Fediverse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-turquoise-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-turquoise-600" />
            <CardTitle className="text-lg">Civic Dialogue from the Fediverse</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  High-quality civic discussions from Bluesky and the AT Protocol network. 
                  These conversations are curated for civility and relevance to U.S. politics.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchContent(true)}
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {isCached && (
          <p className="text-xs text-gray-500 mt-1">
            Cached content • Updated {formatDistance(new Date(), new Date(), { addSuffix: true })}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {content.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No civic discussions available yet.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchContent(true)}
              className="mt-3"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Fetch Content
            </Button>
          </div>
        ) : (
          content.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-3 hover:border-turquoise-300 transition-colors"
            >
              {/* Author Info */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">
                      {item.authorName}
                    </span>
                    {getCivilityBadge(item.civilityScore)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>@{item.authorHandle}</span>
                    <span>•</span>
                    <span>{formatDistance(new Date(item.createdAt), new Date(), { addSuffix: true })}</span>
                  </div>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                  Bluesky
                </Badge>
              </div>

              {/* Content */}
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                {truncateContent(item.content, 180)}
              </p>

              {/* Topics */}
              {item.topics && item.topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.topics.slice(0, 3).map((topic) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className={`text-xs ${getTopicColor(topic)}`}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Engagement Metrics & Link */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {item.likeCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {item.replyCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Repeat2 className="h-3 w-3" />
                    {item.repostCount}
                  </span>
                </div>
                <a
                  href={`https://bsky.app/profile/${item.authorHandle}/post/${item.externalId.split('/').pop()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-turquoise-600 hover:text-turquoise-700 font-medium"
                >
                  View on Bluesky
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))
        )}

        {/* Diagnostics Panel */}
        {diagnostics && (
          <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
            <button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-sm font-medium text-gray-700"
            >
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Fetch Diagnostics
              </span>
              <span className="text-xs text-gray-500">
                {showDiagnostics ? '▼' : '▶'}
              </span>
            </button>
            
            {showDiagnostics && (
              <div className="p-3 bg-white space-y-3 text-xs">
                {/* Source Handles */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Bluesky Sources ({diagnostics.handles.length} handles)</h4>
                  <div className="bg-purple-50 p-2 rounded">
                    <div className="flex flex-wrap gap-1">
                      {diagnostics.handles.map((handle) => (
                        <Badge key={handle} variant="outline" className="text-xs font-mono">
                          @{handle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="text-gray-600">Total Fetched</div>
                      <div className="text-lg font-bold text-blue-700">{diagnostics.totalFetched}</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <div className="text-gray-600">Imported</div>
                      <div className="text-lg font-bold text-green-700">{diagnostics.filterStats.approved}</div>
                    </div>
                  </div>
                </div>

                {/* Filter Stats */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Content Filtering</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Posts Processed:</span>
                      <span className="font-semibold">{diagnostics.filterStats.totalPosts}</span>
                    </div>
                    <div className="flex justify-between items-center text-orange-600">
                      <span>❌ Not Political/Civic:</span>
                      <span className="font-semibold">{diagnostics.filterStats.notPoliticalCivic}</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-600">
                      <span>🎨 Hobby/Lifestyle:</span>
                      <span className="font-semibold">{diagnostics.filterStats.hobbyLifestyle}</span>
                    </div>
                    <div className="flex justify-between items-center text-red-600">
                      <span>🚫 Uncivil Language:</span>
                      <span className="font-semibold">{diagnostics.filterStats.uncivilLanguage}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-500">
                      <span>📏 Too Short:</span>
                      <span className="font-semibold">{diagnostics.filterStats.tooShort}</span>
                    </div>
                    <div className="flex justify-between items-center text-purple-600">
                      <span>🛡️ Safety Issues:</span>
                      <span className="font-semibold">{diagnostics.filterStats.safetyIssues}</span>
                    </div>
                    <div className="flex justify-between items-center text-blue-500">
                      <span>🔄 Already Exists:</span>
                      <span className="font-semibold">{diagnostics.filterStats.alreadyExists}</span>
                    </div>
                    <div className="flex justify-between items-center text-pink-600">
                      <span>⚠️ Low Civility Score:</span>
                      <span className="font-semibold">{diagnostics.filterStats.lowCivilityScore}</span>
                    </div>
                    <div className="flex justify-between items-center text-green-600 font-medium">
                      <span>✅ Approved:</span>
                      <span className="font-semibold">{diagnostics.filterStats.approved}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-teal-50 p-2 rounded">
                      <div className="text-gray-600 text-xs">Threads Fetched</div>
                      <div className="font-bold text-teal-700">{diagnostics.filterStats.threadsFetched}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600 text-xs">Threads Skipped</div>
                      <div className="font-bold text-gray-700">{diagnostics.filterStats.threadsSkipped}</div>
                    </div>
                  </div>
                </div>

                {/* API Errors */}
                {diagnostics.errors && diagnostics.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-900">Fetch Errors ({diagnostics.errors.length})</h4>
                    <div className="bg-red-50 p-2 rounded border border-red-200 space-y-1">
                      {diagnostics.errors.map((error, idx) => (
                        <div key={idx} className="text-xs text-red-800 font-mono break-words">
                          • {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200 text-gray-500">
                  <p><strong>How Public API Fetching Works:</strong> The system fetches author feeds from {diagnostics.handles.length} configured Bluesky handles using unauthenticated public API. Each post is filtered for civic/political relevance, civility, and safety before import.</p>
                  {diagnostics.filterStats.safetyIssues > 0 && (
                    <p className="mt-2 text-purple-600"><strong>🛡️ Safety Filtering:</strong> {diagnostics.filterStats.safetyIssues} posts were blocked due to ATProto safety labels (spam, violence, sexual content, etc.).</p>
                  )}
                  {diagnostics.filterStats.threadsFetched > 0 && (
                    <p className="mt-2 text-teal-600"><strong>🧵 Thread Context:</strong> Fetched {diagnostics.filterStats.threadsFetched} thread contexts for better conversation understanding.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <p className="text-xs text-blue-900 leading-relaxed">
            <strong>External Content:</strong> These discussions are imported from the AT Protocol 
            network and do not represent BtA users. Content is filtered for civility and relevance 
            to civic dialogue. Only verified U.S. citizens can participate in discussions on BtA.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
