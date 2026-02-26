import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert S3 storage path to accessible image URL
export function getImageUrl(storagePath: string | null | undefined): string | undefined {
  if (!storagePath) return undefined
  
  // If it's already a full URL, return it as is
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath
  }
  
  // Convert S3 key to API endpoint URL
  return `/api/profile/photo/${encodeURIComponent(storagePath)}`
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}