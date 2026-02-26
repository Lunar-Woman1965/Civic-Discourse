
/**
 * Privacy utility functions to respect user privacy settings
 */

interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  displayNamePreference?: string;
  showEmail?: boolean;
  showPoliticalLeaning?: boolean;
  showLastActive?: boolean;
  profileVisibility?: string;
  allowSearch?: boolean;
  politicalLeaning?: string | null;
  lastActive?: Date;
}

/**
 * Get the display name for a user based on their privacy preferences
 */
export function getDisplayName(user: User): string {
  const preference = user.displayNamePreference || "username_or_name";
  
  switch (preference) {
    case "username_only":
      return user.username || "Anonymous User";
    
    case "real_name":
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      return user.firstName || user.lastName || "User";
    
    case "username_or_name":
    default:
      if (user.username) {
        return user.username;
      }
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      return user.firstName || user.lastName || "User";
  }
}

/**
 * Check if an email should be shown based on privacy settings
 */
export function shouldShowEmail(user: User): boolean {
  return user.showEmail === true;
}

/**
 * Check if political leaning should be shown based on privacy settings
 */
export function shouldShowPoliticalLeaning(user: User): boolean {
  return user.showPoliticalLeaning !== false; // Default to true
}

/**
 * Check if last active time should be shown based on privacy settings
 */
export function shouldShowLastActive(user: User): boolean {
  return user.showLastActive === true;
}

/**
 * Check if a user's profile is visible to another user
 */
export function isProfileVisible(
  profileOwner: User,
  viewer: User | null,
  areFriends: boolean = false
): boolean {
  const visibility = profileOwner.profileVisibility || "public";
  
  // Owner can always see their own profile
  if (viewer && viewer.id === profileOwner.id) {
    return true;
  }
  
  switch (visibility) {
    case "public":
      return true;
    
    case "friends_only":
      return areFriends;
    
    case "private":
      return false;
    
    default:
      return true;
  }
}

/**
 * Check if a user should appear in search results
 */
export function isSearchable(user: User): boolean {
  return user.allowSearch !== false; // Default to true
}

/**
 * Get user data with privacy filters applied
 */
export function getPrivacyFilteredUser(user: User, viewer: User | null, areFriends: boolean = false) {
  const displayName = getDisplayName(user);
  
  return {
    id: user.id,
    displayName,
    email: shouldShowEmail(user) ? user.email : null,
    politicalLeaning: shouldShowPoliticalLeaning(user) ? user.politicalLeaning : null,
    lastActive: shouldShowLastActive(user) ? user.lastActive : null,
    isProfileVisible: isProfileVisible(user, viewer, areFriends),
  };
}
