import React from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface FormattedMessageProps {
  content: string
  className?: string
}

export function FormattedMessage({ content, className = '' }: FormattedMessageProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const formatContent = (text: string) => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    let currentList: string[] = []
    let listType: 'bullet' | 'number' | null = null
    let codeBlock: string[] = []
    let inCodeBlock = false
    let codeLanguage = ''

    const flushList = () => {
      if (currentList.length > 0) {
        const ListComponent = listType === 'number' ? 'ol' : 'ul'
        elements.push(
          <ListComponent 
            key={elements.length} 
            className={listType === 'number' ? 'list-decimal' : 'list-disc'} 
            style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}
          >
            {currentList.map((item, idx) => (
              <li key={idx} className="mb-1 text-sm leading-relaxed">
                {formatInlineElements(item)}
              </li>
            ))}
          </ListComponent>
        )
        currentList = []
        listType = null
      }
    }

    lines.forEach((line, idx) => {
      // Code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          const codeId = `code-${idx}`
          const codeContent = codeBlock.join('\n')
          elements.push(
            <div key={elements.length} className="relative group my-3">
              <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <pre>{codeContent}</pre>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copyToClipboard(codeContent, codeId)}
              >
                {copiedId === codeId ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )
          codeBlock = []
          inCodeBlock = false
          codeLanguage = ''
        } else {
          // Start code block
          inCodeBlock = true
          codeLanguage = line.slice(3).trim()
          flushList()
        }
        return
      }

      if (inCodeBlock) {
        codeBlock.push(line)
        return
      }

      // Headers
      if (line.startsWith('###')) {
        flushList()
        elements.push(
          <h4 key={elements.length} className="font-semibold text-base mt-4 mb-2">
            {formatInlineElements(line.slice(3).trim())}
          </h4>
        )
      } else if (line.startsWith('##')) {
        flushList()
        elements.push(
          <h3 key={elements.length} className="font-semibold text-lg mt-4 mb-2">
            {formatInlineElements(line.slice(2).trim())}
          </h3>
        )
      } else if (line.startsWith('#')) {
        flushList()
        elements.push(
          <h2 key={elements.length} className="font-bold text-xl mt-4 mb-3">
            {formatInlineElements(line.slice(1).trim())}
          </h2>
        )
      }
      // Bullet points
      else if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        if (listType !== 'bullet') {
          flushList()
          listType = 'bullet'
        }
        const content = line.trim().slice(1).trim()
        currentList.push(content)
      }
      // Numbered lists
      else if (line.trim().match(/^\d+\./)) {
        if (listType !== 'number') {
          flushList()
          listType = 'number'
        }
        const content = line.trim().replace(/^\d+\./, '').trim()
        currentList.push(content)
      }
      // Blockquotes
      else if (line.startsWith('>')) {
        flushList()
        elements.push(
          <blockquote key={elements.length} className="border-l-4 border-primary/30 pl-4 py-2 my-3 italic text-muted-foreground">
            {formatInlineElements(line.slice(1).trim())}
          </blockquote>
        )
      }
      // Horizontal rule
      else if (line.trim() === '---' || line.trim() === '***') {
        flushList()
        elements.push(<hr key={elements.length} className="my-4 border-border" />)
      }
      // Regular paragraph
      else if (line.trim()) {
        flushList()
        elements.push(
          <p key={elements.length} className="mb-3 text-sm leading-relaxed">
            {formatInlineElements(line)}
          </p>
        )
      }
      // Empty line
      else if (elements.length > 0) {
        flushList()
      }
    })

    // Flush any remaining list
    flushList()

    return elements
  }

  const formatInlineElements = (text: string): React.ReactNode => {
    // Handle inline code
    const codeRegex = /`([^`]+)`/g
    // Handle bold
    const boldRegex = /\*\*([^*]+)\*\*/g
    // Handle italic
    const italicRegex = /\*([^*]+)\*/g
    // Handle links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    // Handle key terms (e.g., "MUST", "REQUIRED", etc.)
    const keyTermRegex = /\b(MUST|SHOULD|REQUIRED|IMPORTANT|NOTE|WARNING|TIP)\b/g

    let formatted = text
    const elements: (string | React.ReactNode)[] = []
    let lastIndex = 0

    // Process links first
    const linkMatches = Array.from(text.matchAll(linkRegex))
    linkMatches.forEach((match) => {
      const [fullMatch, linkText, url] = match
      const index = match.index || 0
      
      if (index > lastIndex) {
        elements.push(text.slice(lastIndex, index))
      }
      
      elements.push(
        <a
          key={`link-${index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline inline-flex items-center gap-1"
        >
          {linkText}
          <ExternalLink className="h-3 w-3" />
        </a>
      )
      
      lastIndex = index + fullMatch.length
    })
    
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex))
    }

    // If no links were found, use the original text
    if (elements.length === 0) {
      elements.push(text)
    }

    // Process other inline formatting
    return elements.map((element, idx) => {
      if (typeof element !== 'string') return element

      let processedElement: React.ReactNode = element

      // Replace inline code
      processedElement = element.replace(codeRegex, (match, code) => {
        return `<code class="bg-muted px-1 py-0.5 rounded text-xs font-mono">${code}</code>`
      })

      // Replace bold
      processedElement = (processedElement as string).replace(boldRegex, (match, bold) => {
        return `<strong class="font-semibold">${bold}</strong>`
      })

      // Replace italic
      processedElement = (processedElement as string).replace(italicRegex, (match, italic) => {
        return `<em class="italic">${italic}</em>`
      })

      // Replace key terms
      processedElement = (processedElement as string).replace(keyTermRegex, (match) => {
        const colorClass = match === 'WARNING' ? 'text-orange-600' : 
                          match === 'IMPORTANT' || match === 'REQUIRED' || match === 'MUST' ? 'text-red-600' :
                          match === 'TIP' ? 'text-green-600' : 'text-blue-600'
        return `<span class="font-semibold ${colorClass}">${match}</span>`
      })

      return <span key={idx} dangerouslySetInnerHTML={{ __html: processedElement as string }} />
    })
  }

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {formatContent(content)}
    </div>
  )
}