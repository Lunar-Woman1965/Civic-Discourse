'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Eye, CheckCircle, XCircle, Clock, Ban, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import toast from 'react-hot-toast'
import ViolationDetailModal from './violation-detail-modal'

interface Violation {
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
  post?: {
    id: string
    content: string
  }
  comment?: {
    id: string
    content: string
  }
}

export default function ViolationsList() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchViolations()
  }, [statusFilter])

  const fetchViolations = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/violations?status=${statusFilter}`)
      if (res.ok) {
        const data = await res.json()
        setViolations(data.violations)
      }
    } catch (error) {
      console.error('Error fetching violations:', error)
      toast.error('Failed to load violations')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = (violation: Violation) => {
    setSelectedViolation(violation)
    setShowModal(true)
  }

  const handleAction = async (violationId: string, action: string, reviewNote: string) => {
    try {
      const res = await fetch(`/api/admin/violations/${violationId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reviewNote }),
      })

      if (res.ok) {
        toast.success(`Action taken: ${action}`)
        setShowModal(false)
        fetchViolations()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to take action')
      }
    } catch (error) {
      console.error('Error taking action:', error)
      toast.error('Failed to take action')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800'
      case 'action_taken':
        return 'bg-red-100 text-red-800'
      case 'reviewed':
        return 'bg-blue-100 text-blue-800'
      case 'dismissed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading violations...</div>
      </div>
    )
  }

  return (
    <>
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Content Violations</CardTitle>
              <CardDescription>Review and take action on flagged content</CardDescription>
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="bg-gray-100">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="action_taken">Actioned</TabsTrigger>
                <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {violations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No violations found with status: {statusFilter}
            </div>
          ) : (
            <div className="space-y-4">
              {violations.map((violation) => (
                <div
                  key={violation.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <AlertTriangle
                        className={`h-5 w-5 ${
                          violation.severity === 'severe'
                            ? 'text-red-600'
                            : violation.severity === 'moderate'
                            ? 'text-orange-600'
                            : 'text-yellow-600'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[#2C1810]">
                            {violation.user.name || 'Unknown User'}
                          </h3>
                          <Badge className={getSeverityColor(violation.severity)}>
                            {violation.severity}
                          </Badge>
                          <Badge className={getStatusColor(violation.status)}>
                            {violation.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {violation.user.email} • {violation.violationType.replace(/_/g, ' ')} •{' '}
                          {new Date(violation.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReview(violation)}
                      className="border-[#6B8E23] text-[#6B8E23] hover:bg-[#6B8E23] hover:text-white"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </div>

                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <p className="text-sm text-gray-700 line-clamp-3">{violation.content}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">
                        <strong>Flagged words:</strong>{' '}
                        {violation.flaggedWords.map(w => `***${w.slice(1, -1)}***`).join(', ')}
                      </span>
                      <Badge variant="outline">{violation.contentType}</Badge>
                    </div>
                    {violation.user.isSuspended && (
                      <Badge className="bg-orange-100 text-orange-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Suspended
                      </Badge>
                    )}
                    {violation.user.isPermanentlyBanned && (
                      <Badge className="bg-red-100 text-red-800">
                        <Ban className="h-3 w-3 mr-1" />
                        Banned
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      User has <strong>{violation.user.violationCount}</strong> total violation
                      {violation.user.violationCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedViolation && (
        <ViolationDetailModal
          violation={selectedViolation}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onAction={handleAction}
        />
      )}
    </>
  )
}
