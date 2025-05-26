'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Mail, 
  Paperclip, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  FileText,
  DollarSign,
  Globe,
  CreditCard
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { getPendingEmailImports } from '../services/email-processor'
import { toast } from 'sonner'

interface ImportQueueProps {
  onSelectImport: (importId: string) => void
}

export function ImportQueue({ onSelectImport }: ImportQueueProps) {
  const [imports, setImports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    loadImports()
  }, [])

  const loadImports = async () => {
    try {
      setLoading(true)
      const data = await getPendingEmailImports()
      setImports(data)
    } catch (error) {
      console.error('Failed to load imports:', error)
      toast.error('Failed to load email imports')
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'dbs_certificate':
        return <FileText className="h-4 w-4" />
      case 'donation':
        return <DollarSign className="h-4 w-4" />
      case 'expense':
        return <CreditCard className="h-4 w-4" />
      case 'overseas_transfer':
        return <Globe className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      dbs_certificate: 'DBS Check',
      donation: 'Donation',
      expense: 'Expense',
      overseas_transfer: 'Overseas',
      bank_statement: 'Statement',
      complex: 'Review Required'
    }

    const typeColors: Record<string, string> = {
      dbs_certificate: 'bg-blue-100 text-blue-800',
      donation: 'bg-green-100 text-green-800',
      expense: 'bg-purple-100 text-purple-800',
      overseas_transfer: 'bg-orange-100 text-orange-800',
      bank_statement: 'bg-gray-100 text-gray-800',
      complex: 'bg-red-100 text-red-800'
    }

    return (
      <Badge className={typeColors[type] || 'bg-gray-100 text-gray-800'}>
        <span className="flex items-center gap-1">
          {getTypeIcon(type)}
          {typeLabels[type] || 'Unknown'}
        </span>
      </Badge>
    )
  }

  const handleSelect = (importId: string) => {
    setSelectedId(importId)
    onSelectImport(importId)
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Import Queue
          </CardTitle>
          <CardDescription>Loading pending imports...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Import Queue
          </span>
          <Badge variant="secondary">{imports.length} pending</Badge>
        </CardTitle>
        <CardDescription>
          Review and approve email extractions
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[600px]">
          <div className="p-6 pt-0 space-y-3">
            {imports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No pending imports</p>
                <p className="text-sm mt-1">
                  Forward emails to your inbox address to import data
                </p>
              </div>
            ) : (
              imports.map((import_) => (
                <button
                  key={import_.id}
                  onClick={() => handleSelect(import_.id)}
                  className={`w-full text-left transition-all ${
                    selectedId === import_.id
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'hover:shadow-md'
                  }`}
                >
                  <Card className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">
                            {import_.subject || 'No subject'}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">
                            From: {import_.from_address}
                          </p>
                        </div>
                        {getTypeBadge(import_.email_type || 'complex')}
                      </div>

                      {/* Content Preview */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {import_.text_content || 'No content'}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(import_.received_at), { 
                              addSuffix: true 
                            })}
                          </span>
                          {import_.attachment_count > 0 && (
                            <span className="flex items-center gap-1">
                              <Paperclip className="h-3 w-3" />
                              {import_.attachment_count} attachment{import_.attachment_count > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {import_.confidence_score && (
                            <Badge 
                              variant="outline" 
                              className={
                                import_.confidence_score >= 0.8
                                  ? 'text-green-600 border-green-600'
                                  : import_.confidence_score >= 0.5
                                  ? 'text-yellow-600 border-yellow-600'
                                  : 'text-red-600 border-red-600'
                              }
                            >
                              {Math.round(import_.confidence_score * 100)}% confident
                            </Badge>
                          )}
                          <Eye className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}