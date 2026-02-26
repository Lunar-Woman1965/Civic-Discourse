
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateAvatarDataUrl } from '@/lib/avatar-utils';

interface UserAvatarProps {
  user: {
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    profileImage?: string | null;
    useAvatar?: boolean;
    avatarStyle?: string | null;
    avatarSeed?: string | null;
  };
  className?: string;
}

export default function UserAvatar({ user, className }: UserAvatarProps) {
  const getAvatarSrc = () => {
    if (user.useAvatar && user.avatarStyle && user.avatarSeed) {
      return generateAvatarDataUrl(user.avatarStyle, user.avatarSeed);
    }
    return user.profileImage || undefined;
  };

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.name) {
      const parts = user.name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <Avatar className={className}>
      <AvatarImage src={getAvatarSrc()} alt={user.name || user.username || 'User'} />
      <AvatarFallback>{getInitials()}</AvatarFallback>
    </Avatar>
  );
}
