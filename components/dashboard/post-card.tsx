"use client";

import { Badge } from "@/components/ui/badge";
import { getDisplayName } from "@/lib/display-name-utils";
import {
  getPoliticalIdentifierColor,
  getPoliticalIdentifierLabel,
} from "@/lib/political-utils";

interface PostCardProps {
  post: any;
  currentUser: any;
  onDelete?: (id: string) => void;
  isHighlighted?: boolean;
}

export default function PostCard({
  post,
  currentUser,
}: PostCardProps) {
  const currentPost = post;

  // 🔥 FIXED AUTHORITY BADGE (FOUNDER PRIORITY)
  const renderAuthorityBadge = (author: any) => {
    if (!author) return null;

    const isFounder =
      author.role === "PLATFORM_FOUNDER" || author.isFounder === true;

    const isAdmin =
      author.role === "ADMIN" || author.isAdmin === true;

    const isModerator =
      author.role === "MODERATOR";

    if (isFounder) {
      return (
        <Badge
          variant="secondary"
          className="text-xs font-semibold border border-sky-200 bg-sky-50 text-sky-900 inline-flex items-center gap-1.5"
        >
          <span
            className="inline-block h-3.5 w-3.5 rounded-full border border-sky-200 bg-[radial-gradient(circle_at_35%_30%,#ffffff_0%,#dff7ff_28%,#9fc7dd_55%,#6f8fa8_100%)] shadow-sm"
          />
          Founder
        </Badge>
      );
    }

    if (isAdmin) {
      return (
        <Badge
          variant="secondary"
          className="text-xs font-semibold border-red-200 bg-red-100 text-red-800"
        >
          Admin
        </Badge>
      );
    }

    if (isModerator) {
      return (
        <Badge
          variant="secondary"
          className="text-xs font-semibold border-blue-200 bg-blue-100 text-blue-800"
        >
          Moderator
        </Badge>
      );
    }

    return null;
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm space-y-3">
      {/* AUTHOR */}
      <div className="flex items-center gap-2">
        {currentPost.isAnonymous ? (
          <>
            <p className="font-medium italic text-gray-700">
              Anonymous User
            </p>
            <Badge
              variant="secondary"
              className="bg-gray-200 text-xs text-gray-600"
            >
              Anonymous
            </Badge>
          </>
        ) : (
          <>
            <p className="font-medium text-gray-900">
              {getDisplayName(currentPost.author)}
            </p>

            {renderAuthorityBadge(currentPost.author)}

            {currentPost.author?.politicalLeaning && (
              <Badge
                variant="secondary"
                className={`text-xs ${getPoliticalIdentifierColor(
                  currentPost.author.politicalLeaning
                )}`}
              >
                {getPoliticalIdentifierLabel(
                  currentPost.author.politicalLeaning
                )}
              </Badge>
            )}
          </>
        )}
      </div>

      {/* CONTENT */}
      <p className="text-sm text-gray-800 whitespace-pre-wrap">
        {currentPost.content}
      </p>

      {/* FOOTER */}
      <div className="text-xs text-gray-500">
        {new Date(currentPost.createdAt).toLocaleString()}
      </div>
    </div>
  );
}