
/**
 * Utilities for handling @mentions in posts and comments
 */

/**
 * Extract mentions from text content
 * Finds all @username patterns in the text
 * @param content - The text content to parse
 * @returns Array of usernames (without @ symbol)
 */
export function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = content.matchAll(mentionRegex);
  const usernames = Array.from(matches, (match) => match[1]);
  // Return unique usernames
  return [...new Set(usernames)];
}

/**
 * Convert usernames to user IDs by looking them up in the database
 * @param usernames - Array of usernames to look up
 * @param prisma - Prisma client instance
 * @returns Array of user IDs
 */
export async function getUserIdsByUsernames(
  usernames: string[],
  prisma: any
): Promise<string[]> {
  if (usernames.length === 0) return [];

  const users = await prisma.user.findMany({
    where: {
      username: {
        in: usernames,
      },
      isActive: true, // Only mention active users
    },
    select: {
      id: true,
    },
  });

  return users.map((user: { id: string }) => user.id);
}

/**
 * Replace mentions in text with clickable links (for display)
 * @param content - The text content
 * @param mentions - Array of mentioned user data with username and id
 * @returns HTML string with mentions as links
 */
export function formatMentionsForDisplay(
  content: string,
  mentions: Array<{ username: string; id: string }>
): string {
  let formattedContent = content;

  mentions.forEach((mention) => {
    const mentionRegex = new RegExp(`@${mention.username}\\b`, "g");
    formattedContent = formattedContent.replace(
      mentionRegex,
      `<a href="/profile/${mention.id}" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">@${mention.username}</a>`
    );
  });

  return formattedContent;
}

/**
 * Validate that quoted text length is reasonable
 * @param quotedText - The text being quoted
 * @returns boolean indicating if quote is valid
 */
export function isValidQuote(quotedText: string | null | undefined): boolean {
  if (!quotedText) return true; // Empty quote is valid
  // Max quote length: 500 characters
  return quotedText.length <= 500;
}

/**
 * Truncate long quoted text for display
 * @param quotedText - The quoted text
 * @param maxLength - Maximum length (default 200)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateQuote(quotedText: string, maxLength: number = 200): string {
  if (quotedText.length <= maxLength) return quotedText;
  return quotedText.substring(0, maxLength) + "...";
}
