import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { ChatMessage, ChatContext } from '@/features/ai/types/chat'

interface ChatState {
  // State
  messages: ChatMessage[]
  context: ChatContext | null
  isLoading: boolean
  suggestedQuestions: string[]
  complianceAlerts: any[]
  relatedGuidance: any[]
  
  // Actions
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  setMessages: (messages: ChatMessage[]) => void
  setContext: (context: ChatContext) => void
  setLoading: (loading: boolean) => void
  setSuggestedQuestions: (questions: string[]) => void
  setComplianceAlerts: (alerts: any[]) => void
  setRelatedGuidance: (guidance: any[]) => void
  clearChat: () => void
  
  // Selectors
  getMessageById: (id: string) => ChatMessage | undefined
}

export const useChatStore = create<ChatState>()(
  persist(
    immer((set, get) => ({
      // Initial state with safe defaults
      messages: [],
      context: null,
      isLoading: false,
      suggestedQuestions: [],
      complianceAlerts: [],
      relatedGuidance: [],
      
      // Actions
      addMessage: (message) => set((state) => {
        state.messages.push(message)
      }),
      
      updateMessage: (id, updates) => set((state) => {
        const index = state.messages.findIndex(m => m.id === id)
        if (index !== -1) {
          state.messages[index] = { ...state.messages[index], ...updates }
        }
      }),
      
      setMessages: (messages) => set((state) => {
        state.messages = messages
      }),
      
      setContext: (context) => set((state) => {
        state.context = context
      }),
      
      setLoading: (loading) => set((state) => {
        state.isLoading = loading
      }),
      
      setSuggestedQuestions: (questions) => set((state) => {
        state.suggestedQuestions = questions
      }),
      
      setComplianceAlerts: (alerts) => set((state) => {
        state.complianceAlerts = alerts
      }),
      
      setRelatedGuidance: (guidance) => set((state) => {
        state.relatedGuidance = guidance
      }),
      
      clearChat: () => set((state) => {
        state.messages = []
        state.suggestedQuestions = []
        state.relatedGuidance = []
        // Keep context and alerts as they're organization-specific
      }),
      
      // Selectors
      getMessageById: (id) => {
        return get().messages.find(m => m.id === id)
      }
    })),
    {
      name: 'charity-prep-chat',
      partialize: (state) => ({
        messages: state.messages.slice(-20), // Keep last 20 messages
        context: state.context
      }),
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        }
      })
    }
  )
)