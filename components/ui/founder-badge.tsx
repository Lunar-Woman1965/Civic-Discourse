import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FounderBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function FounderBadge({ 
  className, 
  size = 'md',
  showLabel = false 
}: FounderBadgeProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  };

  return (
    <span 
      className={cn('inline-flex items-center gap-1', className)}
      title="Platform Founder"
    >
      <Circle
        className={cn(sizes[size])}
        style={{
          color: '#CFD8DD',
          fill: '#CFD8DD',
          filter: 'drop-shadow(0 0 3px #D5D7EA) drop-shadow(0 0 6px #CFD3D6)',
        }}
      />
      {showLabel && (
        <span 
          className="text-xs font-semibold tracking-wide"
          style={{ color: '#2C1810' }}
        >
          Platform Founder
        </span>
      )}
    </span>
  );
}