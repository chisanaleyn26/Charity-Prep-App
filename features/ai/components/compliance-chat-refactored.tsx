'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bot, RefreshCw } from 'lucide-react'
import { ChatMessageList } from './chat-message-list'
import { ChatInput } from './chat-input'
import { ChatSidebar } from './chat-sidebar'
import { useChatStore } from '@/stores/chat-store'
import { useChatContext } from '../hooks/use-chat-context'
import { downloadChat } from '../utils/chat-export'
import { 
  processComplianceQuestion, 
  getSuggestedQuestions,
  getComplianceAlerts,
  searchComplianceGuidance,
  type ChatMessage
} from '../services/compliance-chat'
import { toast } from 'sonner'
import { generateId } from '@/lib/utils/crypto'

const MAX_RETRIES = 3
const RETRY_DELAY = 1000

export function ComplianceChatRefactored() {
  const {
    messages = [],
    isLoading = false,
    suggestedQuestions = [],
    complianceAlerts = [],
    relatedGuidance = [],
    addMessage,
    updateMessage,
    setLoading,
    setSuggestedQuestions,
    setComplianceAlerts,
    setRelatedGuidance,
    clearChat
  } = useChatStore()

  const { context, isLoading: contextLoading } = useChatContext()
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  console.log('Component state:', { messages: messages?.length, input, isLoading })

  // Load initial data
  useEffect(() => {
    // Don't wait for context to load, show welcome message immediately
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    console.log('loadInitialData called', { messages, addMessage })
    try {
      // Add welcome message if no messages
      if ((!messages || messages.length === 0) && addMessage) {
        const welcomeMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: `Hello! I'm your charity compliance assistant. I can help you understand:

• **DBS check requirements** and safeguarding policies
• **Annual reporting obligations** and deadlines  
• **Fundraising regulations** and best practices
• **Overseas activity rules** and reporting
• **Gift Aid requirements** and record keeping

What compliance topic would you like to explore today?`,
          timestamp: new Date()
        }
        addMessage(welcomeMessage)
      }

      // Load suggested questions
      const questions = await getSuggestedQuestions(context)
      if (setSuggestedQuestions) {
        setSuggestedQuestions(questions)
      }

      // Load compliance alerts if we have organization context
      if (context?.organizationName && setComplianceAlerts) {
        const alerts = await getComplianceAlerts(context.organizationName)
        setComplianceAlerts(alerts.map(alert => ({
          ...alert,
          id: generateId()
        })))
      }
    } catch (error) {
      console.error('Failed to load initial data:', error)
    }
  }

  const handleSendMessage = useCallback(async (retryCount = 0) => {
    const messageContent = input.trim()
    if (!messageContent || isLoading || !addMessage) return

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    }

    addMessage(userMessage)
    setInput('')
    setLoading(true)
    setRelatedGuidance([])

    try {
      // Process the question
      const response = await processComplianceQuestion(
        messageContent,
        context || undefined,
        messages
      )
      
      // Add assistant response
      addMessage(response)
      
      // Search for related guidance
      const guidance = await searchComplianceGuidance(messageContent)
      if (setRelatedGuidance) {
        setRelatedGuidance((guidance || []).map(g => ({
          ...g,
          id: generateId(),
          relevanceScore: Math.random() * 0.3 + 0.7 // Mock relevance score
        })))
      }
      
      // Update suggested questions
      const newQuestions = await getSuggestedQuestions(context || undefined)
      if (setSuggestedQuestions) {
        setSuggestedQuestions(newQuestions)
      }
    } catch (error) {
      console.error('Chat error:', error)
      
      // Retry logic
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          handleSendMessage(retryCount + 1)
        }, RETRY_DELAY * (retryCount + 1))
        
        toast.error(`Failed to get response. Retrying... (${retryCount + 1}/${MAX_RETRIES})`)
      } else {
        // Add error message
        const errorMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: `I apologize, but I'm having trouble processing your request right now. Please try again in a moment.

If the issue persists, you can:
• Check your internet connection
• Try refreshing the page
• Contact support if needed

In the meantime, you might find these resources helpful:
• [Charity Commission Guidance](https://www.gov.uk/government/organisations/charity-commission)
• [Fundraising Regulator](https://www.fundraisingregulator.org.uk/)`,
          timestamp: new Date(),
          retryCount: retryCount
        }
        addMessage(errorMessage)
        toast.error('Unable to get response after multiple attempts')
      }
    } finally {
      setLoading(false)
    }
  }, [input, isLoading, messages, context, addMessage, setLoading, setRelatedGuidance, setSuggestedQuestions])

  const handleRetry = (message: ChatMessage) => {
    // Find the user message before this assistant message
    const messageIndex = messages.findIndex(m => m.id === message.id)
    if (messageIndex > 0) {
      const previousMessage = messages[messageIndex - 1]
      if (previousMessage.role === 'user') {
        setInput(previousMessage.content)
        handleSendMessage()
      }
    }
  }

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    updateMessage(messageId, { feedback })
    // In a real app, send this feedback to analytics
  }

  const handleQuestionClick = (question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }

  const handleExportChat = () => {
    downloadChat(messages, 'markdown')
  }

  const handleNewChat = () => {
    if (clearChat) {
      clearChat()
      loadInitialData()
    }
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
              onClick={handleNewChat}
              className="ml-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ChatMessageList
              messages={messages || []}
              isLoading={isLoading}
              onFeedback={handleFeedback}
              onRetry={handleRetry}
            />
            
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={() => handleSendMessage()}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <ChatSidebar
        complianceAlerts={complianceAlerts || []}
        relatedGuidance={relatedGuidance || []}
        suggestedQuestions={suggestedQuestions || []}
        onQuestionClick={handleQuestionClick}
        onExportChat={handleExportChat}
        showSuggestions={!messages || messages.length <= 1}
      />
    </div>
  )
}