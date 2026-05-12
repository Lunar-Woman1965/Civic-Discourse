import { Badge } from '@/components/ui/badge'
import { FounderBadge } from '@/components/ui/founder-badge'

export function getRoleBadge(role?: string | null) {
  if (role === 'PLATFORM_FOUNDER') {
    return <FounderBadge showLabel={true} />
  }

  return (
    <Badge variant="secondary" className="w-fit">
      User
    </Badge>
  )
}
