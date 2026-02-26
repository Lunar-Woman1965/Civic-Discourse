
'use client'

import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Mail, HelpCircle, AlertCircle, Shield, Copy, Check, ChevronRight } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function HelpDropdownMenu() {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  const copyToClipboard = async (email: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(email)
      setCopiedEmail(email)
      toast.success('Email copied!')
      setTimeout(() => setCopiedEmail(null), 2000)
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const contacts = [
    {
      icon: HelpCircle,
      title: 'General Help',
      email: 'assistBTA@outlook.com',
      color: 'text-blue-600',
    },
    {
      icon: AlertCircle,
      title: 'Appeals',
      email: 'appealBTA@outlook.com',
      color: 'text-orange-600',
    },
    {
      icon: Shield,
      title: 'Privacy & Data',
      email: 'privacyBTA@outlook.com',
      color: 'text-green-600',
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center justify-between w-full cursor-pointer">
          <div className="flex items-center">
            <HelpCircle className="h-4 w-4 mr-2" />
            Help & Support
          </div>
          <ChevronRight className="h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right" className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          💡 Include your username and context for faster response
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {contacts.map((contact, index) => (
          <div key={index}>
            <DropdownMenuItem asChild>
              <a
                href={`mailto:${contact.email}?subject=Bridging%20the%20Aisle%20-%20${encodeURIComponent(contact.title)}`}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2 flex-1">
                  <contact.icon className={`h-4 w-4 ${contact.color}`} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{contact.title}</span>
                    <span className="text-xs text-muted-foreground">{contact.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <button
                    onClick={(e) => copyToClipboard(contact.email, e)}
                    className={`p-1 rounded hover:bg-muted transition-colors ${
                      copiedEmail === contact.email ? 'text-green-600' : 'text-muted-foreground'
                    }`}
                    title="Copy email"
                  >
                    {copiedEmail === contact.email ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </a>
            </DropdownMenuItem>
            {index < contacts.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-2">
          <p className="text-xs text-muted-foreground">
            Response time: 24-48 hours
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
