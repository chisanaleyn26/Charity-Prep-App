# Day 3 - AI Magic Features Implementation Plan

## 🎯 Goal: Add AI-Powered Features that Create "Wow" Moments

Building on Day 2's compliance modules, Day 3 adds the AI features that differentiate Charity Prep from basic form-filling software.

## Prerequisites from Day 2 ✅
- [x] All compliance modules working with CRUD
- [x] Document upload system functional
- [x] Real-time data updates
- [x] Compliance score calculating

## Phase 1: AI Service Setup (Hour 1) 🤖

### 1.1 OpenRouter Integration
- [x] Create `lib/ai/openrouter.ts` - Client setup
  ```typescript
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
  const MODEL = 'google/gemini-2.0-flash-exp:free'
  ```
- [x] Create `lib/ai/prompts.ts` - Prompt templates
- [x] Set up error handling and retries
- [x] Configure rate limiting

### 1.2 AI Task Queue Setup
- [x] Create `features/ai/services/task-queue.ts`
- [x] Implement queue processing logic
- [x] Add status tracking in database
- [x] Create background job handler

### 1.3 Type Definitions
- [x] Create `features/ai/types/extraction.ts`
- [x] Define AI response interfaces
- [x] Create validation schemas
- [x] Set up error types

## Phase 2: Email Ingestion System (Hours 2-3) 📧

### 2.1 Email Webhook Setup
- [x] Create `app/api/webhooks/email/route.ts`
  - [x] Parse incoming emails
  - [x] Extract organization ID from recipient
  - [x] Handle attachments
  - [x] Queue for processing

### 2.2 Email Processing Service
- [x] Create `features/ai/services/email-processor.ts`
  - [x] Extract attachments
  - [x] Identify document types
  - [x] Parse email body for data
  - [x] Create AI tasks

### 2.3 AI Email Extraction
- [x] Create `features/ai/services/email-extraction.ts`
  ```typescript
  const prompt = `
    Extract compliance data from this email:
    - DBS certificate details
    - Donation information
    - Expense receipts
    - Overseas transfer confirmations
    
    Return structured JSON with confidence scores.
  `
  ```
- [x] Handle multiple data types
- [x] Confidence scoring
- [x] Fallback strategies

### 2.4 Import Review UI
- [x] Create `app/(app)/import/page.tsx`
- [x] Build `features/ai/components/import-queue.tsx`
  - [x] List of pending imports
  - [x] Processing status
  - [x] Quick actions

- [x] Build `features/ai/components/extraction-review.tsx`
  - [x] Show extracted data
  - [x] Confidence indicators
  - [x] Edit capabilities
  - [x] Approve/reject actions

## Phase 3: Document OCR System (Hours 3-4) 📄

### 3.1 Document Processing Pipeline
- [x] Create `features/ai/services/document-processor.ts`
  - [x] File type detection
  - [x] Image optimization
  - [x] PDF to image conversion
  - [x] Queue for OCR

### 3.2 OCR Service
- [x] Create `features/ai/services/document-ocr.ts`
  ```typescript
  const prompt = `
    Extract text from this ${documentType}:
    
    For DBS Certificate:
    - Full name
    - Certificate number (12 digits)
    - Issue date
    - Type of check
    
    For Receipt:
    - Vendor name
    - Amount
    - Date
    - Category
    
    Return structured data with field locations.
  `
  ```

### 3.3 Visual Extraction UI
- [x] Build `features/ai/components/document-extractor.tsx`
  - [x] Document preview
  - [x] Highlight extracted fields
  - [x] Confidence badges
  - [x] Manual corrections

- [x] Build `features/ai/components/extraction-review.tsx`
  - [x] Side-by-side view
  - [x] Field mapping
  - [x] Validation errors
  - [x] Save actions

### 3.4 Quick Capture Flow
- [x] Create `app/(app)/quick-capture/page.tsx`
- [x] Build mobile-optimized capture
- [x] Direct camera integration
- [x] Instant processing feedback

## Phase 4: CSV Import with AI Mapping (Hours 4-5) 📊

### 4.1 CSV Parser Service
- [x] Create `features/ai/services/csv-parser.ts`
  - [x] File validation
  - [x] Header extraction
  - [x] Data preview
  - [x] Type inference

### 4.2 AI Column Mapper
- [x] Create `features/ai/services/column-mapper.ts`
  ```typescript
  const prompt = `
    Map these CSV columns to our schema:
    
    CSV Headers: ${headers.join(', ')}
    
    Target Schema:
    - person_name: Full name of person
    - dbs_number: 12-digit DBS certificate number
    - issue_date: Date certificate was issued
    - expiry_date: Date certificate expires
    
    Return confidence scores for each mapping.
  `
  ```

### 4.3 Import Wizard UI
- [x] Create `features/ai/components/csv-import-wizard.tsx`
  - [x] File upload step
  - [x] Column mapping step
  - [x] Data preview step
  - [x] Import confirmation

- [x] Build `features/ai/components/column-mapper.tsx`
  - [x] Drag-and-drop mapping
  - [x] AI suggestions
  - [x] Sample data display
  - [x] Validation feedback

### 4.4 Bulk Import Processing
- [x] Handle large files (1000+ rows)
- [x] Progress tracking
- [x] Error handling per row
- [x] Partial success handling

## Phase 5: Natural Language Search (Hours 5-6) 🔍

### 5.1 Search Query Parser
- [x] Create `features/ai/services/search-parser.ts`
  ```typescript
  const prompt = `
    Convert this natural language query to a database query:
    
    User Query: "${query}"
    
    Available fields:
    - DBS: person_name, expiry_date, status
    - Overseas: country, amount, transfer_method
    - Income: donor_name, amount, source
    
    Return SQL WHERE clause or filter object.
  `
  ```

### 5.2 Vector Search Setup
- [x] Create embeddings table in Supabase
- [x] Generate embeddings for existing data
- [x] Implement similarity search
- [x] Cache common queries

### 5.3 Smart Search UI
- [x] Build `features/ai/components/smart-search.tsx`
  - [x] Search bar with suggestions
  - [x] Recent searches
  - [x] Query examples
  - [x] Voice input option

- [x] Build search results in `app/(app)/search/page.tsx`
  - [x] Grouped by type
  - [x] Relevance scoring
  - [x] Quick actions
  - [x] Export options

## Phase 6: AI Report Generation (Hours 6-7) 📝

### 6.1 Narrative Generator
- [x] Create `features/ai/services/report-narrator.ts`
  ```typescript
  const prompt = `
    Generate a trustee report section on ${topic}:
    
    Data:
    - Compliance Score: ${score}%
    - Key Issues: ${issues}
    - Improvements: ${improvements}
    
    Tone: Professional but accessible
    Length: 2-3 paragraphs
    Include: Specific numbers and achievements
  `
  ```

### 6.2 Report Templates
- [x] Create narrative templates
- [x] Section generators
- [x] Data aggregation logic
- [x] Formatting service

### 6.3 Report Builder UI
- [x] Build `features/ai/components/report-generator.tsx`
  - [x] AI content blocks
  - [x] Regenerate sections
  - [x] Edit capabilities
  - [x] Preview updates

## Phase 7: Compliance Q&A Bot (Hours 7-8) 💬

### 7.1 Knowledge Base Setup
- [x] Index charity regulations
- [x] Create embeddings
- [x] Build retrieval system
- [x] Context management

### 7.2 Chat Service
- [x] Create `features/ai/services/compliance-chat.ts`
  ```typescript
  const prompt = `
    You are a UK charity compliance expert.
    
    Context: ${relevantRegulations}
    User Data: ${organizationContext}
    
    Question: ${question}
    
    Provide clear, actionable advice.
    Cite specific regulations when relevant.
  `
  ```

### 7.3 Chat UI
- [x] Build `features/ai/components/compliance-chat.tsx`
  - [x] Chat interface
  - [x] Suggested questions
  - [x] Citation links
  - [x] Save useful answers

- [x] Create `app/(app)/compliance/chat/page.tsx`
  - [x] Message bubbles
  - [x] Markdown support
  - [x] Copy buttons
  - [x] Feedback options

## Testing & Integration (Hour 8) 🧪

### 8.1 AI Feature Testing
- [x] Test email parsing accuracy
- [x] Verify OCR extraction rates
- [x] Check CSV mapping logic
- [x] Validate search results

### 8.2 Performance Testing
- [x] Load test with multiple documents
- [x] Check AI response times
- [x] Monitor API usage
- [x] Optimize slow queries

### 8.3 Error Handling
- [x] Graceful AI failures
- [x] User-friendly error messages
- [x] Fallback options
- [x] Manual override capabilities

## Success Criteria ✅

By end of Day 3:
1. ✅ Email forwarding creates records
2. ✅ Document OCR extracts data accurately
3. ✅ CSV import with smart mapping
4. ✅ Natural language search working
5. ✅ AI report narratives generating
6. ✅ Compliance Q&A responding helpfully

## AI Service Architecture

```
features/ai/
├── services/
│   ├── task-queue.ts         # AI task management
│   ├── email-processor.ts    # Email handling
│   ├── email-extraction.ts   # Email AI extraction
│   ├── document-processor.ts # Document pipeline
│   ├── ocr-service.ts       # OCR extraction
│   ├── csv-parser.ts        # CSV handling
│   ├── column-mapper.ts     # AI mapping
│   ├── query-parser.ts      # NLP to SQL
│   ├── narrative-generator.ts # Report writing
│   └── compliance-chat.ts   # Q&A bot
├── components/
│   ├── import-queue.tsx     # Import management
│   ├── extraction-review.tsx # Review extractions
│   ├── document-extractor.tsx # Visual extraction
│   ├── csv-import-wizard.tsx # Import flow
│   ├── column-mapper.tsx    # Mapping UI
│   ├── smart-search.tsx     # Search interface
│   ├── compliance-chat.tsx  # Chat UI
│   └── chat-message.tsx     # Message component
└── types/
    ├── extraction.ts        # Extraction types
    ├── ai-responses.ts      # AI response types
    └── prompts.ts          # Prompt interfaces
```

## Key Implementation Patterns

### AI Service Pattern
```typescript
export async function extractFromDocument(
  document: Document
): Promise<ExtractionResult> {
  try {
    // Prepare document
    const imageUrl = await prepareForOCR(document)
    
    // Call AI
    const response = await openrouter.chat.completions.create({
      model: 'google/gemini-2.0-flash-exp:free',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: getExtractionPrompt(document.type) },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }],
      response_format: { type: 'json_object' }
    })
    
    // Parse and validate
    const extracted = JSON.parse(response.choices[0].message.content)
    const validated = ExtractionSchema.parse(extracted)
    
    return {
      success: true,
      data: validated,
      confidence: extracted.confidence
    }
  } catch (error) {
    return {
      success: false,
      error: 'Extraction failed',
      fallback: manualEntryUrl(document)
    }
  }
}
```

### Streaming Response Pattern
```typescript
'use client'

import { useChat } from 'ai/react'

export function ComplianceChat() {
  const { messages, input, handleSubmit, isLoading } = useChat({
    api: '/api/ai/chat',
    onError: (error) => {
      toast.error('Failed to get response')
    }
  })
  
  return (
    <div className="flex flex-col h-[600px]">
      <ScrollArea className="flex-1 p-4">
        {messages.map(m => (
          <ChatMessage key={m.id} message={m} />
        ))}
      </ScrollArea>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about compliance..."
          disabled={isLoading}
        />
      </form>
    </div>
  )
}
```

## Magic Moments to Highlight

1. **Email Magic**: "Just forwarded a receipt and it appeared in my expenses!"
2. **Photo Magic**: "Took a photo of the DBS certificate and everything was filled in!"
3. **CSV Magic**: "It knew which columns were which without me telling it!"
4. **Search Magic**: "I just typed what I was looking for in plain English!"
5. **Report Magic**: "It wrote my trustee report section for me!"

## Risk Mitigation

If AI services are slow/expensive:
1. Implement aggressive caching
2. Queue non-urgent processing
3. Offer manual entry as fallback
4. Use simpler prompts

## Tomorrow (Day 4)

With AI features complete, Day 4 focuses on deliverables:
- Annual Return generator
- Board pack creation
- Multi-charity support
- Billing integration