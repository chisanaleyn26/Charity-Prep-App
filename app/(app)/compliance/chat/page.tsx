'use client'

import { ComplianceChatWorking } from '@/features/ai/components/compliance-chat-working'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Bot,
  Info
} from 'lucide-react'

export default function ComplianceChatPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          Compliance Assistant
        </h1>
        <p className="text-muted-foreground mt-1">
          Get instant answers to your charity compliance questions
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This AI assistant provides guidance based on UK charity regulations and best practices. 
          For critical decisions, always verify information with official sources or seek professional advice.
        </AlertDescription>
      </Alert>

      {/* Chat Interface */}
      <ComplianceChatWorking />
    </div>
  )
}