'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, Clock, Ban, X, CheckCircle, AlertOctagon } from 'lucide-react'

interface ViolationDetailModalProps {
  violation: {
    id: string
    violationType: string
    severity: string
    content: string
    flaggedWords: string[]
    contentType: string
    status: string
    createdAt: string
    user: {
      id: string
      name: string | null
      email: string
      violationCount: number
      isSuspended: boolean
      isPermanentlyBanned: boolean
    }
  }
  isOpen: boolean
  onClose: () => void
  onAction: (violationId: string, action: string, reviewNote: string) => void
}

export default function ViolationDetailModal({
  violation,
  isOpen,
  onClose,
  onAction,
}: ViolationDetailModalProps) {
  const [reviewNote, setReviewNote] = useState('')
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  const handleAction = (action: string) => {
    if (!reviewNote.trim() && action !== 'dismiss') {
      alert('Please provide a review note')
      return
    }
    setSelectedAction(action)
  }

  const confirmAction = () => {
    if (selectedAction) {
      onAction(violation.id, selectedAction, reviewNote)
      setReviewNote('')
      setSelectedAction(null)
    }
  }

  const cancelAction = () => {
    setSelectedAction(null)
  }

  const getRecommendedAction = () => {
    const count = violation.user.violationCount
    if (count === 0) return { action: 'warning', label: 'Written Warning (1st offense)' }
    if (count === 1) return { action: '14_days', label: '14-Day Suspension (2nd offense)' }
    if (count === 2) return { action: '28_days', label: '28-Day Suspension (3rd offense)' }
    return { action: 'permanent', label: 'Permanent Ban (4th+ offense)' }
  }

  const recommended = getRecommendedAction()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {selectedAction ? (
          // Confirmation Screen
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <AlertOctagon className="h-6 w-6 text-red-600" />
                Confirm Action
              </DialogTitle>
            </DialogHeader>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="font-semibold text-amber-900 mb-2">
                Are you sure you want to take this action?
              </p>
              <p className="text-sm text-amber-800">
                Action: <strong className="uppercase">{selectedAction.replace(/_/g, ' ')}</strong>
              </p>
              <p className="text-sm text-amber-800 mt-1">
                User: <strong>{violation.user.name || violation.user.email}</strong>
              </p>
              {selectedAction === 'permanent' && (
                <p className="text-sm text-red-600 font-semibold mt-2">
                  ⚠️ This user will be permanently banned and unable to rejoin.
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Review Note:</p>
              <p className="text-sm text-gray-900">{reviewNote || 'No note provided'}</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={confirmAction}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm & Execute
              </Button>
              <Button onClick={cancelAction} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // Review Screen
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
                Review Violation
              </DialogTitle>
              <DialogDescription>
                Review the flagged content and decide on appropriate action
              </DialogDescription>
            </DialogHeader>

            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#2C1810]">
                    {violation.user.name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-600">{violation.user.email}</p>
                </div>
                <div className="text-right space-y-1">
                  {violation.user.isPermanentlyBanned && (
                    <Badge className="bg-red-100 text-red-800">
                      <Ban className="h-3 w-3 mr-1" />
                      Permanently Banned
                    </Badge>
                  )}
                  {violation.user.isSuspended && !violation.user.isPermanentlyBanned && (
                    <Badge className="bg-orange-100 text-orange-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Currently Suspended
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <span>
                  <strong>Total Violations:</strong> {violation.user.violationCount}
                </span>
                <span>
                  <strong>Date:</strong> {new Date(violation.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Violation Details */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Violation Type:</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-100 text-gray-800">
                    {violation.violationType.replace(/_/g, ' ')}
                  </Badge>
                  <Badge className={
                    violation.severity === 'severe'
                      ? 'bg-red-100 text-red-800'
                      : violation.severity === 'moderate'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }>
                    {violation.severity.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Flagged Words:</p>
                <div className="bg-red-50 border border-red-200 rounded p-2">
                  <p className="text-sm text-red-900 font-mono">
                    {violation.flaggedWords.join(', ')}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Content:</p>
                <div className="bg-white border border-gray-200 rounded p-3">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{violation.content}</p>
                </div>
              </div>
            </div>

            {/* Review Note */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Review Note (Required for actions)
              </label>
              <Textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Add your notes about this violation and why you're taking this action..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Recommended Action */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-semibold text-blue-900 mb-1">Recommended Action:</p>
              <p className="text-sm text-blue-800">{recommended.label}</p>
              <p className="text-xs text-blue-700 mt-1">
                Based on user's violation history ({violation.user.violationCount} previous violations)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <p className="font-semibold text-[#2C1810]">Take Action:</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleAction('warning')}
                  variant="outline"
                  className={`border-yellow-500 text-yellow-700 hover:bg-yellow-50 ${
                    recommended.action === 'warning' ? 'ring-2 ring-yellow-500' : ''
                  }`}
                  disabled={violation.user.isPermanentlyBanned}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Written Warning
                </Button>

                <Button
                  onClick={() => handleAction('14_days')}
                  variant="outline"
                  className={`border-orange-500 text-orange-700 hover:bg-orange-50 ${
                    recommended.action === '14_days' ? 'ring-2 ring-orange-500' : ''
                  }`}
                  disabled={violation.user.isPermanentlyBanned}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  14-Day Suspension
                </Button>

                <Button
                  onClick={() => handleAction('28_days')}
                  variant="outline"
                  className={`border-orange-600 text-orange-800 hover:bg-orange-50 ${
                    recommended.action === '28_days' ? 'ring-2 ring-orange-600' : ''
                  }`}
                  disabled={violation.user.isPermanentlyBanned}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  28-Day Suspension
                </Button>

                <Button
                  onClick={() => handleAction('permanent')}
                  variant="outline"
                  className={`border-red-600 text-red-800 hover:bg-red-50 ${
                    recommended.action === 'permanent' ? 'ring-2 ring-red-600' : ''
                  }`}
                  disabled={violation.user.isPermanentlyBanned}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Permanent Ban
                </Button>

                <Button
                  onClick={() => handleAction('dismiss')}
                  variant="outline"
                  className="col-span-2 border-green-500 text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Dismiss Violation
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={onClose} variant="outline" className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
