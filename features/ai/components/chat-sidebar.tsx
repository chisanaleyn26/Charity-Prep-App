'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  AlertCircle,
  Info,
  Calendar,
  FileText,
  ExternalLink,
  Download,
  MessageSquare,
  ChevronRight
} from 'lucide-react'
import type { ComplianceAlert, RelatedGuidance } from '../types/chat'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface ChatSidebarProps {
  complianceAlerts: ComplianceAlert[]
  relatedGuidance: RelatedGuidance[]
  suggestedQuestions: string[]
  onQuestionClick: (question: string) => void
  onExportChat: () => void
  showSuggestions: boolean
}

export function ChatSidebar({
  complianceAlerts,
  relatedGuidance,
  suggestedQuestions,
  onQuestionClick,
  onExportChat,
  showSuggestions
}: ChatSidebarProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="h-4 w-4" />
      case 'deadline': return <Calendar className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'warning': return 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950'
      case 'deadline': return 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
      case 'error': return 'border-destructive bg-destructive/10'
      default: return ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Compliance Alerts */}
      {complianceAlerts && complianceAlerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Compliance Alerts
            </CardTitle>
            <CardDescription className="text-xs">
              Important compliance notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {complianceAlerts.map((alert) => (
              <Alert 
                key={alert.id} 
                className={getAlertVariant(alert.type)}
              >
                <div className="flex items-start gap-2">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <AlertTitle className="text-sm">{alert.title}</AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      {alert.message}
                    </AlertDescription>
                    {alert.dueDate && (
                      <p className="text-xs font-medium mt-2">
                        Due: {format(new Date(alert.dueDate), 'dd MMM yyyy')}
                      </p>
                    )}
                    {alert.action && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 h-7 text-xs"
                        onClick={() => {
                          if (alert.action?.onClick) {
                            alert.action.onClick()
                          } else if (alert.action?.href) {
                            window.open(alert.action.href, '_blank')
                          }
                        }}
                      >
                        {alert.action.label}
                      </Button>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Suggested Questions */}
      {showSuggestions && suggestedQuestions && suggestedQuestions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Suggested Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => onQuestionClick(question)}
                className="w-full text-left text-xs p-2.5 rounded-lg border hover:bg-muted transition-colors flex items-center justify-between group"
              >
                <span className="pr-2">{question}</span>
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Related Guidance */}
      {relatedGuidance && relatedGuidance.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Related Guidance
            </CardTitle>
            <CardDescription className="text-xs">
              Relevant compliance resources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {relatedGuidance.map((guidance) => (
              <div key={guidance.id} className="space-y-2 pb-3 border-b last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium">{guidance.title}</h4>
                  {guidance.relevanceScore && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {Math.round(guidance.relevanceScore * 100)}% match
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {guidance.summary}
                </p>
                {guidance.category && (
                  <Badge variant="outline" className="text-xs">
                    {guidance.category}
                  </Badge>
                )}
                {guidance.link && (
                  <a
                    href={guidance.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Learn more
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => window.open('https://www.gov.uk/guidance/charity-commission-guidance', '_blank')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Charity Commission Guidance
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => window.open('https://www.fundraisingregulator.org.uk/code', '_blank')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Fundraising Code
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              onExportChat()
              toast.success('Chat exported')
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Chat
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}