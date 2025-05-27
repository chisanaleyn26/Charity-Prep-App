import type { ChatMessage } from '../types/chat'
import { format } from 'date-fns'

export function exportChatToText(messages: ChatMessage[]): string {
  const header = `Charity Prep Compliance Chat Export
Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}
-------------------\n\n`

  const messageText = messages.map(msg => {
    const timestamp = format(new Date(msg.timestamp), 'HH:mm')
    const role = msg.role === 'user' ? 'You' : 'Assistant'
    let content = `[${timestamp}] ${role}: ${msg.content}`
    
    if (msg.sources && msg.sources.length > 0) {
      content += '\nSources: ' + msg.sources.map(s => s.title).join(', ')
    }
    
    return content
  }).join('\n\n')

  return header + messageText
}

export function exportChatToMarkdown(messages: ChatMessage[]): string {
  const header = `# Charity Prep Compliance Chat Export
**Generated:** ${format(new Date(), 'dd MMM yyyy HH:mm')}

---

`

  const messageText = messages.map(msg => {
    const timestamp = format(new Date(msg.timestamp), 'HH:mm')
    const role = msg.role === 'user' ? '**You**' : '**Assistant**'
    let content = `### ${timestamp} - ${role}\n\n${msg.content}`
    
    if (msg.sources && msg.sources.length > 0) {
      content += '\n\n**Sources:**\n' + msg.sources.map(s => `- ${s.title}`).join('\n')
    }
    
    return content
  }).join('\n\n---\n\n')

  return header + messageText
}

export function downloadChat(messages: ChatMessage[], format: 'text' | 'markdown' = 'markdown') {
  const content = format === 'markdown' 
    ? exportChatToMarkdown(messages)
    : exportChatToText(messages)
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = `compliance-chat-${format(new Date(), 'yyyy-MM-dd-HHmm')}.${format === 'markdown' ? 'md' : 'txt'}`
  document.body.appendChild(link)
  link.click()
  
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}