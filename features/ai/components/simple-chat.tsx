'use client'

import { useState } from 'react'

export function SimpleChat() {
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([
    { text: 'Hello! How can I help you with charity compliance today?', isUser: false }
  ])
  const [input, setInput] = useState('')

  const sendMessage = () => {
    if (!input.trim()) return
    
    // Add user message
    setMessages(prev => [...prev, { text: input, isUser: true }])
    
    // Add AI response after a delay
    const userInput = input
    setInput('')
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: `I understand you're asking about "${userInput}". This feature is being developed.`, 
        isUser: false 
      }])
    }, 1000)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-[500px] flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${
              msg.isUser 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  )
}