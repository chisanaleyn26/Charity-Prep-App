'use client'

import { useRef, useState, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Mic, Paperclip, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
  placeholder?: string
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = "Ask about compliance requirements..."
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isRecording, setIsRecording] = useState(false)

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !isLoading) {
        onSubmit()
      }
    }
  }

  const handleVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice input is not supported in your browser')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.lang = 'en-GB'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onChange(value + (value ? ' ' : '') + transcript)
      setIsRecording(false)
    }

    recognition.onerror = () => {
      toast.error('Voice recognition failed')
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    try {
      recognition.start()
    } catch (error) {
      toast.error('Failed to start voice recognition')
      setIsRecording(false)
    }
  }

  const handleFileUpload = () => {
    toast.info('Document upload coming soon!')
  }

  return (
    <div className="p-6 border-t bg-background">
      <form 
        onSubmit={(e) => {
          e.preventDefault()
          if (value.trim() && !isLoading) {
            onSubmit()
          }
        }}
        className="space-y-4"
      >
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="min-h-[60px] max-h-[120px] pr-24 resize-none"
            rows={1}
            aria-label="Type your compliance question"
          />
          
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            {/* Voice input button */}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={handleVoiceInput}
              disabled={isLoading || isRecording}
              aria-label="Voice input"
            >
              <Mic className={`h-4 w-4 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} />
            </Button>

            {/* File upload button */}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={handleFileUpload}
              disabled={isLoading}
              aria-label="Attach document"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Send button */}
            <Button 
              type="submit" 
              disabled={!value.trim() || isLoading}
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{value.length} / 500</span>
        </div>
      </form>
    </div>
  )
}