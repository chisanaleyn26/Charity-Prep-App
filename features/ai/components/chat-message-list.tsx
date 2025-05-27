'use client'

import { useRef, useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  User, 
  ThumbsUp, 
  ThumbsDown,
  Copy,
  Check,
  FileText,
  RefreshCw,
  Clock
} from 'lucide-react'
import { FormattedMessage } from '../utils/message-formatter'
import type { ChatMessage } from '../types/chat'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface ChatMessageListProps {
  messages: ChatMessage[]
  isLoading: boolean
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void
  onRetry?: (message: ChatMessage) => void
}

export function ChatMessageList({ 
  messages, 
  isLoading, 
  onFeedback,
  onRetry 
}: ChatMessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const copyMessage = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    if (onFeedback) {
      onFeedback(messageId, feedback)
      toast.success(feedback === 'positive' ? 'Thanks for your feedback!' : 'We\'ll improve our responses')
    }
  }

  return (
    <ScrollArea 
      ref={scrollAreaRef}
      className="flex-1 p-6"
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            role="article"
            aria-label={`${message.role} message`}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* Assistant avatar */}
            {message.role === 'assistant' && (
              <div className="p-2 bg-primary/10 rounded-lg shrink-0 h-fit">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            )}

            {/* Message content */}
            <div className={`group relative max-w-[80%] ${
              message.role === 'user' 
                ? 'bg-primary text-primary-foreground rounded-lg px-4 py-2' 
                : 'space-y-2'
            }`}>
              {/* User message */}
              {message.role === 'user' ? (
                <div className="space-y-1">
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70">
                    {format(new Date(message.timestamp), 'HH:mm')}
                  </p>
                </div>
              ) : (
                /* Assistant message */
                <>
                  <FormattedMessage content={message.content} />
                  
                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">Sources:</span>
                      {message.sources.map((source, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary" 
                          className="text-xs cursor-pointer hover:bg-secondary/80"
                          onClick={() => source.link && window.open(source.link, '_blank')}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          {source.title}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Message actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                    {/* Timestamp */}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(message.timestamp), 'HH:mm')}
                    </span>

                    <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Copy button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => copyMessage(message.content, message.id)}
                      >
                        {copiedId === message.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>

                      {/* Feedback buttons */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-8 w-8 p-0 ${
                          message.feedback === 'positive' ? 'text-green-600' : ''
                        }`}
                        onClick={() => handleFeedback(message.id, 'positive')}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-8 w-8 p-0 ${
                          message.feedback === 'negative' ? 'text-red-600' : ''
                        }`}
                        onClick={() => handleFeedback(message.id, 'negative')}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>

                      {/* Retry button for errors */}
                      {message.retryCount && message.retryCount > 0 && onRetry && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => onRetry(message)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User avatar */}
            {message.role === 'user' && (
              <div className="p-2 bg-muted rounded-lg shrink-0 h-fit">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3" role="status" aria-label="AI is thinking">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[250px]" />
              <span className="sr-only">AI is generating a response...</span>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}