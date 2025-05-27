'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bot, 
  Send, 
  User, 
  AlertCircle, 
  Calendar,
  FileText,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  Info,
  RefreshCw
} from 'lucide-react'
import { processComplianceQuestion, getSuggestedQuestions, type ChatMessage } from '../services/compliance-chat'
import { generateId } from '@/lib/utils/crypto'

export function ComplianceChatWorking() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [complianceAlerts, setComplianceAlerts] = useState<any[]>([])
  const [relatedGuidance, setRelatedGuidance] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadInitialData = async () => {
    try {
      // Add welcome message
      setMessages([{
        id: generateId(),
        role: 'assistant',
        content: `Hello! I'm your charity compliance assistant. I can help you understand:

• DBS check requirements and safeguarding policies
• Annual reporting obligations and deadlines  
• Fundraising regulations and best practices
• Overseas activity rules and reporting
• Gift Aid requirements and record keeping

What compliance topic would you like to explore today?`,
        timestamp: new Date()
      }])

      // Get suggested questions
      const questions = await getSuggestedQuestions()
      setSuggestedQuestions(questions)

      // Mock compliance alerts for demo
      setComplianceAlerts([
        {
          id: '1',
          type: 'deadline',
          title: 'Annual Return Due',
          description: 'Your annual return is due in 45 days',
          dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
        }
      ])
    } catch (error) {
      console.error('Failed to load initial data:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
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
      const response = await processComplianceQuestion(input.trim(), undefined, messages)
      setMessages(prev => [...prev, response])
      
      // Update suggested questions
      const newQuestions = await getSuggestedQuestions()
      setSuggestedQuestions(newQuestions)
    } catch (error) {
      console.error('Failed to get response:', error)
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuestionClick = (question: string) => {
    setInput(question)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Main Chat */}
      <div className="lg:col-span-2 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Compliance Assistant
              </CardTitle>
              <CardDescription>
                Ask questions about charity compliance and regulations
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={loadInitialData}
              className="ml-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.sources && message.sources.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-border/50">
                          <span className="text-xs opacity-70">Sources:</span>
                          {message.sources.map((source, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
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
                      <Bot className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <p className="text-sm">Thinking...</p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-6 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="space-y-4"
              >
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about compliance requirements..."
                  disabled={isLoading}
                  className="min-h-[60px] resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                  <Button type="submit" disabled={!input.trim() || isLoading}>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </form>

              {/* Suggested Questions */}
              {messages.length === 1 && suggestedQuestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Suggested questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuestionClick(question)}
                        className="text-left h-auto py-2 px-3"
                      >
                        <MessageSquare className="h-3 w-3 mr-2 shrink-0" />
                        <span className="text-xs">{question}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Compliance Alerts */}
        {complianceAlerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Compliance Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {complianceAlerts.map((alert) => (
                <Alert key={alert.id} className={
                  alert.type === 'deadline' ? 'border-orange-200 bg-orange-50' : ''
                }>
                  <Calendar className="h-4 w-4" />
                  <AlertTitle className="text-sm">{alert.title}</AlertTitle>
                  <AlertDescription className="text-xs">
                    {alert.description}
                  </AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Related Guidance */}
        {relatedGuidance.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Related Guidance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {relatedGuidance.map((guide, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => window.open(guide.url, '_blank')}
                >
                  <ChevronRight className="h-4 w-4 mr-2 shrink-0" />
                  <span className="text-sm">{guide.title}</span>
                  <ExternalLink className="h-3 w-3 ml-auto shrink-0" />
                </Button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Links</CardTitle>
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
              onClick={() => window.open('https://www.fundraisingregulator.org.uk/', '_blank')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Fundraising Regulator
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}