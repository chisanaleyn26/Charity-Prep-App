/**
 * AI Compliance Assistant - Main Chat Component
 * Professional WhatsApp-style chat interface with real-time features
 */

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
  ChevronRight,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Zap,
  Shield,
  DollarSign,
  Globe,
  Users
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useComplianceChat } from '../hooks/use-compliance-chat'
import type { 
  ChatMessage, 
  ComplianceAlert, 
  RelatedGuidance,
  ChatContext
} from '../types/chat'

// Suggested questions with smart categorization
const SUGGESTED_QUESTIONS = [
  {
    id: '1',
    text: 'What DBS checks do we need for our volunteers?',
    category: 'safeguarding',
    icon: Shield,
    priority: 1
  },
  {
    id: '2',
    text: 'When is our annual return due this year?',
    category: 'reporting',
    icon: Calendar,
    priority: 1
  },
  {
    id: '3',
    text: 'Do we need to register with the Fundraising Regulator?',
    category: 'fundraising',
    icon: DollarSign,
    priority: 2
  },
  {
    id: '4',
    text: 'What are the reporting requirements for overseas activities?',
    category: 'overseas',
    icon: Globe,
    priority: 2
  },
  {
    id: '5',
    text: 'How do we handle Gift Aid claims properly?',
    category: 'fundraising',
    icon: DollarSign,
    priority: 2
  },
  {
    id: '6',
    text: 'What safeguarding policies do we need?',
    category: 'safeguarding',
    icon: Shield,
    priority: 1
  }
]

// Mock compliance alerts (would come from API in real implementation)
const MOCK_COMPLIANCE_ALERTS: ComplianceAlert[] = [
  {
    id: '1',
    type: 'deadline',
    category: 'reporting',
    title: 'Annual Return Due Soon',
    message: 'Your annual return is due within 30 days. Make sure all information is up to date.',
    due_date: '2025-03-31',
    action_text: 'Start Annual Return',
    action_url: '/reports/annual-return',
    dismissible: false,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    type: 'warning',
    category: 'dbs',
    title: 'DBS Checks Expiring',
    message: '3 DBS checks expire in the next 60 days. Plan renewals to maintain compliance.',
    action_text: 'View DBS Records',
    action_url: '/compliance/safeguarding',
    dismissible: true,
    created_at: new Date().toISOString()
  }
]

// Mock related guidance
const MOCK_RELATED_GUIDANCE: RelatedGuidance[] = [
  {
    id: '1',
    title: 'Charity Commission Guidance',
    summary: 'Essential guidance for charity trustees on governance and compliance',
    category: 'governance',
    url: 'https://www.gov.uk/government/organisations/charity-commission',
    official_source: true,
    relevance_score: 0.9
  },
  {
    id: '2',
    title: 'Fundraising Code of Practice',
    summary: 'Standards for ethical fundraising and donor protection',
    category: 'fundraising',
    url: 'https://www.fundraisingregulator.org.uk/code',
    official_source: true,
    relevance_score: 0.85
  }
]

interface ComplianceAssistantProps {
  context?: Partial<ChatContext>
  className?: string
}

export function ComplianceAssistant({ context, className }: ComplianceAssistantProps) {
  // Chat functionality
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    retryLastMessage,
    clearError
  } = useComplianceChat({ context })
  
  // Local state
  const [input, setInput] = useState('')
  const [suggestedQuestions, setSuggestedQuestions] = useState(SUGGESTED_QUESTIONS)
  const [complianceAlerts, setComplianceAlerts] = useState(MOCK_COMPLIANCE_ALERTS)
  const [relatedGuidance, setRelatedGuidance] = useState(MOCK_RELATED_GUIDANCE)
  const [showTypingIndicator, setShowTypingIndicator] = useState(false)
  
  // Refs
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Show typing indicator when loading
  useEffect(() => {
    if (isLoading) {
      setShowTypingIndicator(true)
    } else {
      const timer = setTimeout(() => setShowTypingIndicator(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isLoading])
  
  // Handle sending messages
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return
    
    const message = input.trim()
    setInput('')
    clearError()
    
    await sendMessage(message)
    
    // Update suggestions based on message content
    const lowerMessage = message.toLowerCase()
    const newSuggestions = [
      'Can you explain this in more detail?',
      'What are the next steps I should take?',
      'What are the penalties for non-compliance?',
      'Where can I find the official guidance?',
      'What deadlines should I be aware of?'
    ].map((text, index) => ({
      id: `follow-up-${index}`,
      text,
      category: 'general' as const,
      icon: Info,
      priority: 1
    }))
    
    setSuggestedQuestions(newSuggestions)
  }, [input, isLoading, sendMessage, clearError])
  
  // Handle suggested question click
  const handleQuestionClick = useCallback((question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }, [])
  
  // Format message content with better styling
  const formatMessageContent = useCallback((content: string) => {
    if (!content) return null
    
    const lines = content.split('\n')
    const elements: JSX.Element[] = []
    let currentList: string[] = []
    let listType: 'bullet' | 'numbered' | null = null
    
    const flushList = () => {
      if (currentList.length > 0) {
        const ListComponent = listType === 'numbered' ? 'ol' : 'ul'
        elements.push(
          <ListComponent key={`list-${elements.length}`} className="ml-4 mb-2 space-y-1">
            {currentList.map((item, idx) => (
              <li key={idx} className="text-sm leading-relaxed">
                {item}
              </li>
            ))}
          </ListComponent>
        )
        currentList = []
        listType = null
      }
    }
    
    lines.forEach((line, idx) => {
      const trimmedLine = line.trim()
      
      if (!trimmedLine) {
        flushList()
        return
      }
      
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        if (listType !== 'bullet') {
          flushList()
          listType = 'bullet'
        }
        currentList.push(trimmedLine.substring(1).trim())
      } else if (trimmedLine.match(/^\d+\./)) {
        if (listType !== 'numbered') {
          flushList()
          listType = 'numbered'
        }
        currentList.push(trimmedLine)
      } else {
        flushList()
        elements.push(
          <p key={idx} className="mb-2 text-sm leading-relaxed">
            {trimmedLine}
          </p>
        )
      }
    })
    
    flushList()
    return elements
  }, [])
  
  // Get alert icon
  const getAlertIcon = useCallback((type: string) => {
    switch (type) {
      case 'deadline': return <Calendar className="h-4 w-4" />
      case 'warning': return <AlertCircle className="h-4 w-4" />
      case 'urgent': return <XCircle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }, [])
  
  // Message status icon
  const getMessageStatusIcon = useCallback((message: ChatMessage) => {
    if (message.role !== 'user') return null
    
    if (message.metadata?.error_type) {
      return <XCircle className="h-3 w-3 text-red-500" />
    }
    
    return <CheckCircle className="h-3 w-3 text-green-500" />
  }, [])
  
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)] ${className}`}>
      {/* Main Chat Area */}
      <div className="lg:col-span-3 flex flex-col">
        <Card className="flex-1 flex flex-col shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
          <CardHeader className="border-b bg-white/80 backdrop-blur-sm">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#B1FA63] to-green-400 rounded-lg">
                <Bot className="h-5 w-5 text-[#243837]" />
              </div>
              <div>
                <span className="text-[#243837]">AI Compliance Assistant</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground">Online & Ready</span>
                </div>
              </div>
            </CardTitle>
            <CardDescription className="text-[#243837]/70">
              Get expert guidance on UK charity compliance and regulations
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
              <div className="space-y-6">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex gap-4 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="p-2 bg-gradient-to-br from-[#B1FA63]/20 to-green-100 rounded-xl shrink-0">
                          <Sparkles className="h-4 w-4 text-[#243837]" />
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-br from-[#FE7733] to-orange-500 text-white rounded-2xl rounded-br-md px-4 py-3' 
                          : 'space-y-3'
                      }`}>
                        <div className={message.role === 'user' ? '' : 'prose prose-sm max-w-none'}>
                          {message.role === 'user' ? (
                            <div className="flex items-end gap-2">
                              <span className="leading-relaxed">{message.content}</span>
                              {getMessageStatusIcon(message)}
                            </div>
                          ) : (
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-tl-md p-4 border shadow-sm">
                              {formatMessageContent(message.content)}
                            </div>
                          )}
                        </div>
                        
                        {/* Sources */}
                        {message.metadata?.sources && message.metadata.sources.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {message.metadata.sources.map((source, idx) => (
                              <Badge 
                                key={idx} 
                                variant="secondary" 
                                className="text-xs bg-white/60 hover:bg-white/80 transition-colors"
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                {source.title}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {/* Timestamp */}
                        <div className={`text-xs flex items-center gap-1 ${
                          message.role === 'user' ? 'text-white/70 justify-end' : 'text-muted-foreground'
                        }`}>
                          <Clock className="h-3 w-3" />
                          {new Date(message.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                          {message.metadata?.cache_hit && (
                            <Zap className="h-3 w-3 text-yellow-500 ml-1" title="Cached response" />
                          )}
                        </div>
                      </div>
                      
                      {message.role === 'user' && (
                        <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shrink-0">
                          <User className="h-4 w-4 text-[#243837]" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* Typing Indicator */}
                <AnimatePresence>
                  {showTypingIndicator && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex gap-4"
                    >
                      <div className="p-2 bg-gradient-to-br from-[#B1FA63]/20 to-green-100 rounded-xl shrink-0">
                        <Loader2 className="h-4 w-4 text-[#243837] animate-spin" />
                      </div>
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-tl-md p-4 border">
                        <div className="flex space-x-1">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-2 h-2 bg-[#243837]/40 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.2}s` }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Error Display */}
            {error && (
              <div className="px-6 pb-4">
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription className="flex items-center justify-between">
                    <span>{error.message}</span>
                    {error.type === 'RATE_LIMITED' && error.retry_after ? (
                      <Badge variant="outline" className="ml-2">
                        Retry in {error.retry_after}s
                      </Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={retryLastMessage}
                        className="ml-2"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {/* Suggested Questions */}
            {messages.length <= 1 && suggestedQuestions.length > 0 && (
              <div className="px-6 pb-4">
                <p className="text-sm font-medium mb-3 text-[#243837]">Suggested questions:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestedQuestions.slice(0, 6).map((question) => {
                    const IconComponent = question.icon
                    return (
                      <motion.button
                        key={question.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuestionClick(question.text)}
                        className="text-left text-sm p-3 rounded-xl border border-gray-200 hover:border-[#B1FA63] hover:bg-[#B1FA63]/5 transition-all duration-200 flex items-center gap-3 group"
                      >
                        <IconComponent className="h-4 w-4 text-[#243837]/60 group-hover:text-[#243837] transition-colors" />
                        <span className="flex-1">{question.text}</span>
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#243837]/60" />
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Input Area */}
            <div className="p-6 border-t bg-white/80 backdrop-blur-sm">
              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex gap-3"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about compliance requirements..."
                  disabled={isLoading}
                  className="flex-1 border-gray-200 focus:border-[#B1FA63] focus:ring-[#B1FA63]/20"
                  maxLength={1000}
                />
                <Button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-[#FE7733] to-orange-500 hover:from-[#FE7733]/90 hover:to-orange-500/90 border-0 shadow-lg"
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              
              {input.length > 800 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {1000 - input.length} characters remaining
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Compliance Alerts */}
        {complianceAlerts.length > 0 && (
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-[#243837] flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Compliance Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {complianceAlerts.map((alert) => (
                <Alert key={alert.id} className={
                  alert.type === 'urgent' ? 'border-red-200 bg-red-50' :
                  alert.type === 'warning' ? 'border-amber-200 bg-amber-50' :
                  alert.type === 'deadline' ? 'border-orange-200 bg-orange-50' :
                  'border-blue-200 bg-blue-50'
                }>
                  <div className="flex items-start gap-2">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <AlertTitle className="text-sm">{alert.title}</AlertTitle>
                      <AlertDescription className="text-xs mt-1">
                        {alert.message}
                      </AlertDescription>
                      {alert.due_date && (
                        <p className="text-xs font-medium mt-2 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(alert.due_date).toLocaleDateString()}
                        </p>
                      )}
                      {alert.action_text && alert.action_url && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 h-7 text-xs"
                          onClick={() => window.open(alert.action_url, '_blank')}
                        >
                          {alert.action_text}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
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
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-[#243837] flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Related Guidance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {relatedGuidance.map((guidance) => (
                <div key={guidance.id} className="space-y-2">
                  <h4 className="text-sm font-medium text-[#243837] flex items-center gap-2">
                    {guidance.title}
                    {guidance.official_source && (
                      <Badge variant="secondary" className="text-xs">
                        Official
                      </Badge>
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {guidance.summary}
                  </p>
                  {guidance.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs p-0 text-[#FE7733] hover:text-[#FE7733]/80"
                      onClick={() => window.open(guidance.url, '_blank')}
                    >
                      Learn more
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[#243837]">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start hover:bg-[#B1FA63]/10 hover:border-[#B1FA63]"
              onClick={() => window.open('https://www.gov.uk/guidance/charity-commission-guidance', '_blank')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Charity Commission Guidance
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start hover:bg-[#B1FA63]/10 hover:border-[#B1FA63]"
              onClick={() => window.open('https://www.fundraisingregulator.org.uk/code', '_blank')}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Fundraising Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start hover:bg-[#B1FA63]/10 hover:border-[#B1FA63]"
              onClick={() => {
                setInput('')
                clearError()
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