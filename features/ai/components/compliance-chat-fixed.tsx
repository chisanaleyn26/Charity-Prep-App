'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Send, 
  Sparkles, 
  Bot, 
  User,
  AlertCircle,
  Info,
  Calendar,
  ExternalLink,
  FileText,
  RefreshCw,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

// Define types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  sources?: {
    type: 'regulation' | 'guidance' | 'internal_data'
    title: string
    reference?: string
  }[]
}

export interface ChatContext {
  organizationType?: string
  income?: number
  hasOverseasActivities?: boolean
  workWithChildren?: boolean
  workWithVulnerableAdults?: boolean
}

interface ComplianceAlert {
  type: 'info' | 'warning' | 'deadline'
  title: string
  message: string
  dueDate?: string
}

interface RelatedGuidance {
  title: string
  summary: string
  link?: string
}

export function ComplianceChatFixed() {
  // Initialize state with safe defaults
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [context, setContext] = useState<ChatContext>({})
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>([])
  const [relatedGuidance, setRelatedGuidance] = useState<RelatedGuidance[]>([])
  const [mounted, setMounted] = useState(false)
  
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const idCounter = useRef(0)

  // Generate ID safely
  const generateId = useCallback(() => {
    // Only use crypto.randomUUID on client side
    if (mounted && typeof window !== 'undefined' && window.crypto?.randomUUID) {
      return window.crypto.randomUUID()
    }
    // Fallback that works on both server and client
    return `msg-${++idCounter.current}-${Math.random().toString(36).substr(2, 9)}`
  }, [mounted])

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load initial data after mount
  useEffect(() => {
    if (mounted) {
      loadInitialData()
    }
  }, [mounted])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current && messages.length > 0) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const loadInitialData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Get organization context
        const { data: membership } = await supabase
          .from('organization_members')
          .select(`
            organization_id,
            organizations (
              name,
              charity_number
            )
          `)
          .eq('user_id', user.id)
          .single()
        
        if (membership) {
          // Get organization details for context
          const { data: safeguarding } = await supabase
            .from('safeguarding_records')
            .select('works_with_children, works_with_vulnerable_adults')
            .eq('organization_id', membership.organization_id)
            .limit(1)
          
          const { data: overseas } = await supabase
            .from('overseas_activities')
            .select('id')
            .eq('organization_id', membership.organization_id)
            .limit(1)
          
          setContext({
            organizationType: 'Registered Charity',
            workWithChildren: safeguarding?.[0]?.works_with_children ?? false,
            workWithVulnerableAdults: safeguarding?.[0]?.works_with_vulnerable_adults ?? false,
            hasOverseasActivities: !!overseas && overseas.length > 0
          })
          
          // Set context-aware compliance alerts
          setComplianceAlerts([
            {
              type: 'info',
              title: 'Regular Review Reminder',
              message: 'Review your safeguarding policy and procedures annually'
            }
          ])
        }
      }
      
      // Get suggested questions
      const baseSuggestions = [
        'What are the DBS check requirements for our charity?',
        'When is our annual return due?',
        'Do we need to register with the Fundraising Regulator?',
        'What records do we need to keep for Gift Aid claims?',
        'What are the reporting requirements for overseas activities?'
      ]
      
      // Add context-specific suggestions
      const contextualSuggestions = [...baseSuggestions]
      if (context?.workWithChildren || context?.workWithVulnerableAdults) {
        contextualSuggestions.unshift('What safeguarding policies do we need?')
      }
      
      if (context?.hasOverseasActivities) {
        contextualSuggestions.unshift('How do we conduct due diligence on overseas partners?')
      }
      
      setSuggestedQuestions(contextualSuggestions.slice(0, 5))
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `Hello! I'm your charity compliance assistant. I can help you understand:

• DBS check requirements
• Annual reporting obligations  
• Fundraising regulations
• Safeguarding policies
• Overseas activity rules
• Gift Aid requirements

What compliance topic would you like to explore today?`,
        timestamp: new Date()
      }
      
      setMessages([welcomeMessage])
    } catch (error) {
      console.error('Failed to load initial data:', error)
      // Still show welcome message even if data loading fails
      const welcomeMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `Hello! I'm your charity compliance assistant. I can help you understand UK charity compliance requirements. What would you like to know?`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setRelatedGuidance([])

    try {
      // Call the API route
      const apiResponse = await fetch('/api/ai/compliance-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage.content,
          context,
          history: messages
        })
      })

      if (!apiResponse.ok) {
        throw new Error(`API Error: ${apiResponse.status}`)
      }

      const response = await apiResponse.json()
      
      if (response.error) {
        throw new Error(response.error)
      }

      setMessages(prev => [...prev, response])
      
      // Update related guidance based on the query
      const lowerQuery = userMessage.content.toLowerCase()
      const guidance: RelatedGuidance[] = []
      
      if (lowerQuery.includes('dbs') || lowerQuery.includes('safeguarding')) {
        guidance.push({
          title: 'DBS Checks and Safeguarding',
          summary: 'DBS checks are required for anyone working with children or vulnerable adults',
          link: 'https://www.gov.uk/guidance/safeguarding-duties-for-charity-trustees'
        })
      }
      
      if (lowerQuery.includes('overseas') || lowerQuery.includes('international')) {
        guidance.push({
          title: 'Overseas Activities Reporting',
          summary: 'Report overseas expenditure if income exceeds £1m or overseas spend exceeds £100k',
          link: 'https://www.gov.uk/guidance/reporting-overseas-expenditure'
        })
      }
      
      if (lowerQuery.includes('fundrais')) {
        guidance.push({
          title: 'Fundraising Requirements',
          summary: 'Be honest, respect donor wishes, handle donations safely',
          link: 'https://www.fundraisingregulator.org.uk/code'
        })
      }
      
      setRelatedGuidance(guidance)
      
      // Update suggested questions
      const updatedSuggestions = [
        'What are the next steps for compliance?',
        'Can you explain this in more detail?',
        'What are the penalties for non-compliance?',
        'Where can I find official guidance?',
        'What deadlines should I be aware of?'
      ]
      setSuggestedQuestions(updatedSuggestions)
    } catch (error) {
      console.error('Chat error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to get response. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuestionClick = (question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }

  const formatMessageContent = (content: string) => {
    if (!content) return null
    
    // Convert markdown formatting to HTML
    const convertMarkdown = (text: string) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
        .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>') // Inline code
    }
    
    const lines = content.split('\n')
    let inList = false
    let listItems: JSX.Element[] = []
    const elements: JSX.Element[] = []
    let consecutiveEmptyLines = 0
    
    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="ml-6 mb-4 space-y-2 list-disc list-outside">
            {listItems}
          </ul>
        )
        listItems = []
        inList = false
      }
    }
    
    const addSpacing = () => {
      if (elements.length > 0) {
        elements.push(<div key={`spacer-${elements.length}`} className="mb-4" />)
      }
    }
    
    lines.forEach((line, idx) => {
      const trimmedLine = line.trim()
      
      // Handle empty lines - create proper spacing
      if (!trimmedLine) {
        consecutiveEmptyLines++
        if (consecutiveEmptyLines === 1) {
          flushList()
          if (elements.length > 0 && idx < lines.length - 1) {
            // Only add spacing if there's content before and after
            const nextLineIndex = lines.findIndex((l, i) => i > idx && l.trim())
            if (nextLineIndex !== -1) {
              addSpacing()
            }
          }
        }
        return
      }
      
      consecutiveEmptyLines = 0
      
      // Handle bullet points (• - *)
      if (trimmedLine.match(/^[•\-\*]\s/)) {
        if (!inList) inList = true
        const bulletContent = trimmedLine.substring(1).trim()
        listItems.push(
          <li key={`li-${idx}`} className="mb-1.5 pl-1 leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: convertMarkdown(bulletContent) }} />
          </li>
        )
        return
      }
      
      // Handle numbered lists
      if (trimmedLine.match(/^\d+\.\s/)) {
        flushList()
        const numberContent = trimmedLine.replace(/^\d+\.\s/, '')
        elements.push(
          <div key={`num-${idx}`} className="ml-6 mb-3 leading-relaxed">
            <span className="font-semibold text-primary">{trimmedLine.match(/^\d+\./)?.[0]} </span>
            <span dangerouslySetInnerHTML={{ __html: convertMarkdown(numberContent) }} />
          </div>
        )
        return
      }
      
      // Handle headings (lines that end with colon or are all caps)
      if (trimmedLine.endsWith(':') || (trimmedLine.length > 3 && trimmedLine === trimmedLine.toUpperCase())) {
        flushList()
        elements.push(
          <h4 key={`heading-${idx}`} className="font-semibold text-foreground mb-3 mt-4 first:mt-0">
            <span dangerouslySetInnerHTML={{ __html: convertMarkdown(line) }} />
          </h4>
        )
        return
      }
      
      // Handle regular paragraphs with better spacing
      flushList()
      elements.push(
        <p key={`p-${idx}`} className="mb-3 leading-relaxed text-foreground/90">
          <span dangerouslySetInnerHTML={{ __html: convertMarkdown(line) }} />
        </p>
      )
    })
    
    // Flush any remaining list items
    flushList()
    
    return <div className="space-y-1">{elements}</div>
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="h-4 w-4" />
      case 'deadline': return <Calendar className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  // Show loading state until mounted
  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Main Chat */}
      <div className="lg:col-span-2 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Compliance Assistant
            </CardTitle>
            <CardDescription>
              Ask questions about charity compliance and regulations
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[80%] ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-lg px-4 py-2' 
                        : 'space-y-2'
                    }`}>
                      <div className={message.role === 'user' ? '' : 'prose prose-sm max-w-none'}>
                        {message.role === 'user' ? (
                          <p>{message.content}</p>
                        ) : (
                          formatMessageContent(message.content)
                        )}
                      </div>
                      {message.sources && message.sources.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {message.sources.map((source, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              {source.title}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="p-2 bg-muted rounded-lg shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[250px]" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Suggested Questions */}
            {messages.length === 1 && suggestedQuestions.length > 0 && (
              <div className="px-6 pb-4">
                <p className="text-sm font-medium mb-2">Suggested questions:</p>
                <div className="space-y-2">
                  {suggestedQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuestionClick(question)}
                      className="w-full text-left text-sm p-3 rounded-lg border hover:bg-muted transition-colors flex items-center justify-between group"
                    >
                      <span>{question}</span>
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-6 border-t">
              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about compliance requirements..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Compliance Alerts */}
        {complianceAlerts.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Compliance Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {complianceAlerts.map((alert, idx) => (
                <Alert key={idx} className={
                  alert.type === 'warning' ? 'border-amber-200 bg-amber-50' :
                  alert.type === 'deadline' ? 'border-red-200 bg-red-50' :
                  ''
                }>
                  <div className="flex items-start gap-2">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <AlertTitle className="text-sm">{alert.title}</AlertTitle>
                      <AlertDescription className="text-xs mt-1">
                        {alert.message}
                      </AlertDescription>
                      {alert.dueDate && (
                        <p className="text-xs font-medium mt-2">
                          Due: {new Date(alert.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Related Guidance */}
        {relatedGuidance.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Related Guidance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {relatedGuidance.map((guidance, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-sm font-medium">{guidance.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {guidance.summary}
                  </p>
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
                setMessages([])
                setSuggestedQuestions([])
                setRelatedGuidance([])
                loadInitialData()
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Start New Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}