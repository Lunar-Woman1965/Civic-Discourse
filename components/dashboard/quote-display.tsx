
'use client';

import { getDisplayName } from "@/lib/display-name-utils";
import { Quote } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuoteDisplayProps {
  quotedText: string;
  quotedAuthor: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    displayNamePreference: string;
    politicalLeaning: string | null;
  } | null;
}

export function QuoteDisplay({ quotedText, quotedAuthor }: QuoteDisplayProps) {
  if (!quotedText) return null;

  const authorName = quotedAuthor ? getDisplayName(quotedAuthor as any) : "Unknown User";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="my-3 border-l-4 border-blue-500 dark:border-blue-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-r cursor-help">
            <div className="flex items-start gap-2">
              <Quote className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {authorName}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 italic break-words">
                  {quotedText}
                </div>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Use as reference, not debate line-by-line</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
