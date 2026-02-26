
'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Home, 
  Users, 
  MessageCircle, 
  Settings, 
  LogOut,
  Vote,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import NotificationsDropdown from '@/components/NotificationsDropdown'
import UserSearchDialog from '@/components/UserSearchDialog'
import HelpDropdownMenu from '@/components/HelpDropdownMenu'
import { getImageUrl } from '@/lib/utils'
import { getDisplayName, getAvatarFallback } from '@/lib/display-name-utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: any
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState('home')
  
  const currentUser = user

  const navigation = [
    { name: 'Home', icon: Home, href: '/dashboard', id: 'home' },
    { name: 'Friends', icon: Users, href: '/friends', id: 'friends' },
    { name: 'Groups', icon: MessageCircle, href: '/groups', id: 'groups' },
    { name: 'Politics', icon: Vote, href: '/politics', id: 'politics' },
    { name: 'Moderation', icon: Shield, href: '/moderation', id: 'moderation' },
  ]

  return (
    <div className="min-h-screen bg-creamy-tan-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-creamy-tan-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Clickable to return to dashboard */}
            <Link href="/dashboard" className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
              <Vote className="h-8 w-8 text-turquoise-600 mr-2" />
              <span className="text-xl font-bold text-earth-brown-900">Bridging the Aisle</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setActiveTab(item.id)}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === item.id
                      ? 'text-turquoise-600 bg-turquoise-50'
                      : 'text-earth-brown-700 hover:text-turquoise-600 hover:bg-creamy-tan-100'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <NotificationsDropdown />
              <UserSearchDialog />

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={getImageUrl(currentUser?.profileImage) || getImageUrl(currentUser?.image)} />
                    <AvatarFallback>
                      {getAvatarFallback(currentUser)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{getDisplayName(currentUser)}</p>
                    <p className="text-xs text-gray-500">{currentUser?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Profile & Settings
                    </Link>
                  </DropdownMenuItem>
                  {currentUser?.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center text-[#6B8E23]">
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                    <HelpDropdownMenu />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-creamy-tan-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-earth-brown-600">
              © 2025 Bridging the Aisle. Built for respectful political dialogue.
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link 
                href="/community-standards" 
                className="text-earth-brown-700 hover:text-turquoise-600 transition-colors"
              >
                Community Standards
              </Link>
              <span className="text-earth-brown-300">•</span>
              <Link 
                href="/community-standards#faq" 
                className="text-earth-brown-700 hover:text-turquoise-600 transition-colors"
              >
                FAQ
              </Link>
              <span className="text-earth-brown-300">•</span>
              <Link 
                href="/moderation" 
                className="text-earth-brown-700 hover:text-turquoise-600 transition-colors"
              >
                Moderation
              </Link>
              <span className="text-earth-brown-300">•</span>
              <Link 
                href="/privacy" 
                className="text-earth-brown-700 hover:text-turquoise-600 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
