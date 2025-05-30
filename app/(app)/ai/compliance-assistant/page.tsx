/**
 * AI Compliance Assistant Page
 * New dedicated page for the enhanced chat experience
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getDevSession } from '@/lib/dev/dev-auth'
import { ComplianceAssistant } from '@/features/ai/components/compliance-assistant'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { ChatContext } from '@/features/ai/types/chat'

export const metadata: Metadata = {
  title: 'AI Compliance Assistant | Charity Prep',
  description: 'Get expert guidance on UK charity compliance and regulations with our AI-powered assistant.',
  keywords: ['charity compliance', 'AI assistant', 'UK charity law', 'DBS checks', 'fundraising regulations'],
}

// Loading component for the chat interface
function ChatLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main chat skeleton */}
      <div className="lg:col-span-3">
        <Card className="h-full flex flex-col">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-6">
            <div className="flex-1 space-y-4">
              {/* Message skeletons */}
              <div className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="space-y-2 max-w-xs">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sidebar skeleton */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Client component wrapper to avoid build issues with server data fetching
function ComplianceAssistantWrapper() {
  // Context will be loaded on the client side by the hook
  return <ComplianceAssistant />
}

export default function ComplianceAssistantPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#243837] mb-2">
          AI Compliance Assistant
        </h1>
        <p className="text-[#243837]/70 text-lg">
          Get expert guidance on UK charity compliance, regulations, and best practices.
        </p>
      </div>
      
      <Suspense fallback={<ChatLoadingSkeleton />}>
        <ComplianceAssistantWrapper />
      </Suspense>
    </div>
  )
}