
import { getCurrentUser } from './session'
import { NextResponse } from 'next/server'

export async function requireAdmin() {
  const user = await getCurrentUser()
  
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null }
  }
  
  if (!user.isAdmin) {
    return { error: NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 }), user: null }
  }
  
  return { error: null, user }
}

export async function requirePlatformFounder() {
  const user = await getCurrentUser()
  
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null }
  }
  
  if (!user.isAdmin) {
    return { error: NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 }), user: null }
  }
  
  if (user.role !== 'PLATFORM_FOUNDER') {
    return { error: NextResponse.json({ error: 'Forbidden - Platform Founder access required' }, { status: 403 }), user: null }
  }
  
  return { error: null, user }
}

export function isPlatformFounder(user: any): boolean {
  return user?.role === 'PLATFORM_FOUNDER'
}

export function isModerator(user: any): boolean {
  return user?.role === 'MODERATOR'
}

export function isUser(user: any): boolean {
  return user?.role === 'USER'
}
