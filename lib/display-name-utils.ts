
/**
 * Utility functions for handling user display names based on privacy settings
 */

interface DisplayNameUser {
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  displayNamePreference?: string | null
}

/**
 * Get the display name for a user based on their privacy preferences
 * @param user - User object with name fields and privacy settings
 * @param fallback - Fallback display name if user data is incomplete
 * @returns The appropriate display name based on user's preferences
 */
export function getDisplayName(user: DisplayNameUser | null | undefined, fallback: string = 'Unknown User'): string {
  if (!user) return fallback

  const preference = user.displayNamePreference || 'username_or_name'
  const username = user.username?.trim()
  const firstName = user.firstName?.trim()
  const lastName = user.lastName?.trim()
  const fullName = user.name?.trim() || (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName)

  switch (preference) {
    case 'username_only':
      // Show only username, fallback to "User" if no username
      return username || 'User'

    case 'real_name':
      // Show only real name, fallback to username if no real name
      return fullName || username || fallback

    case 'username_or_name':
    default:
      // Prefer username, fallback to real name
      return username || fullName || fallback
  }
}

/**
 * Get the avatar fallback text (first letter of display name)
 * @param user - User object with name fields
 * @returns Single character for avatar fallback
 */
export function getAvatarFallback(user: DisplayNameUser | null | undefined): string {
  if (!user) return 'U'
  
  const displayName = getDisplayName(user, 'U')
  return displayName[0]?.toUpperCase() || 'U'
}
