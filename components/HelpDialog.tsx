
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, HelpCircle, AlertCircle, Shield, Copy, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface HelpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  const copyToClipboard = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email)
      setCopiedEmail(email)
      toast.success('Email copied to clipboard!')
      setTimeout(() => setCopiedEmail(null), 2000)
    } catch (err) {
      toast.error('Failed to copy email')
    }
  }

  const contacts = [
    {
      icon: HelpCircle,
      title: 'General Help & Support',
      email: 'assistBTA@outlook.com',
      description: 'Questions, technical issues, or general assistance',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      icon: AlertCircle,
      title: 'Appeals',
      email: 'appealBTA@outlook.com',
      description: 'Appeal suspensions, warnings, or moderation decisions',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      icon: Shield,
      title: 'Privacy & Data',
      email: 'privacyBTA@outlook.com',
      description: 'Privacy concerns, data requests, or account deletion',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-turquoise-600" />
            Help & Support
          </DialogTitle>
          <DialogDescription>
            Choose the appropriate contact option for your needs
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 font-medium">
            💡 <strong>Tip:</strong> Including your username and brief context in the email helps us respond faster.
          </p>
        </div>

        <div className="space-y-4 mt-4">
          {contacts.map((contact, index) => (
            <Card key={index} className={`border-2 ${contact.borderColor} ${contact.bgColor}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${contact.bgColor} border ${contact.borderColor}`}>
                    <contact.icon className={`h-6 w-6 ${contact.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg mb-1 ${contact.color}`}>
                      {contact.title}
                    </h3>
                    <p className="text-sm text-earth-brown-600 mb-3">
                      {contact.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <a
                        href={`mailto:${contact.email}?subject=Bridging%20the%20Aisle%20-%20${encodeURIComponent(contact.title)}`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 transition-colors"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {contact.email}
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(contact.email)}
                        className={`h-9 ${
                          copiedEmail === contact.email
                            ? 'bg-green-50 border-green-300 text-green-700'
                            : ''
                        }`}
                      >
                        {copiedEmail === contact.email ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy email
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-turquoise-50 border border-turquoise-200 rounded-lg">
          <p className="text-sm text-earth-brown-700">
            <strong>Response Time:</strong> We typically respond within 24-48 hours. For urgent
            matters, please indicate "URGENT" in your subject line.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
