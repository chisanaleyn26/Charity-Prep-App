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
- [ ] Create `lib/ai/openrouter.ts` - Client setup
  ```typescript
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
  const MODEL = 'google/gemini-2.0-flash-exp:free'
  ```
- [ ] Create `lib/ai/prompts.ts` - Prompt templates
- [ ] Set up error handling and retries
- [ ] Configure rate limiting

### 1.2 AI Task Queue Setup
- [ ] Create `features/ai/services/task-queue.ts`
- [ ] Implement queue processing logic
- [ ] Add status tracking in database
- [ ] Create background job handler

### 1.3 Type Definitions
- [ ] Create `features/ai/types/extraction.ts`
- [ ] Define AI response interfaces
- [ ] Create validation schemas
- [ ] Set up error types

## Phase 2: Email Ingestion System (Hours 2-3) 📧

### 2.1 Email Webhook Setup
- [ ] Create `app/api/webhooks/email/route.ts`
  - [ ] Parse incoming emails
  - [ ] Extract organization ID from recipient
  - [ ] Handle attachments
  - [ ] Queue for processing

### 2.2 Email Processing Service
- [ ] Create `features/ai/services/email-processor.ts`
  - [ ] Extract attachments
  - [ ] Identify document types
  - [ ] Parse email body for data
  - [ ] Create AI tasks

### 2.3 AI Email Extraction
- [ ] Create `features/ai/services/email-extraction.ts`
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
- [ ] Handle multiple data types
- [ ] Confidence scoring
- [ ] Fallback strategies

### 2.4 Import Review UI
- [ ] Create `app/(app)/import/page.tsx`
- [ ] Build `features/ai/components/import-queue.tsx`
  - [ ] List of pending imports
  - [ ] Processing status
  - [ ] Quick actions

- [ ] Build `features/ai/components/extraction-review.tsx`
  - [ ] Show extracted data
  - [ ] Confidence indicators
  - [ ] Edit capabilities
  - [ ] Approve/reject actions

## Phase 3: Document OCR System (Hours 3-4) 📄

### 3.1 Document Processing Pipeline
- [ ] Create `features/ai/services/document-processor.ts`
  - [ ] File type detection
  - [ ] Image optimization
  - [ ] PDF to image conversion
  - [ ] Queue for OCR

### 3.2 OCR Service
- [ ] Create `features/ai/services/ocr-service.ts`
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
- [ ] Build `features/ai/components/document-extractor.tsx`
  - [ ] Document preview
  - [ ] Highlight extracted fields
  - [ ] Confidence badges
  - [ ] Manual corrections

- [ ] Build `features/ai/components/extraction-preview.tsx`
  - [ ] Side-by-side view
  - [ ] Field mapping
  - [ ] Validation errors
  - [ ] Save actions

### 3.4 Quick Capture Flow
- [ ] Create `app/(app)/quick-capture/page.tsx`
- [ ] Build mobile-optimized capture
- [ ] Direct camera integration
- [ ] Instant processing feedback

## Phase 4: CSV Import with AI Mapping (Hours 4-5) 📊

### 4.1 CSV Parser Service
- [ ] Create `features/ai/services/csv-parser.ts`
  - [ ] File validation
  - [ ] Header extraction
  - [ ] Data preview
  - [ ] Type inference

### 4.2 AI Column Mapper
- [ ] Create `features/ai/services/column-mapper.ts`
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
- [ ] Create `features/ai/components/csv-import-wizard.tsx`
  - [ ] File upload step
  - [ ] Column mapping step
  - [ ] Data preview step
  - [ ] Import confirmation

- [ ] Build `features/ai/components/column-mapper.tsx`
  - [ ] Drag-and-drop mapping
  - [ ] AI suggestions
  - [ ] Sample data display
  - [ ] Validation feedback

### 4.4 Bulk Import Processing
- [ ] Handle large files (1000+ rows)
- [ ] Progress tracking
- [ ] Error handling per row
- [ ] Partial success handling

## Phase 5: Natural Language Search (Hours 5-6) 🔍

### 5.1 Search Query Parser
- [ ] Create `features/ai/services/query-parser.ts`
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
- [ ] Create embeddings table in Supabase
- [ ] Generate embeddings for existing data
- [ ] Implement similarity search
- [ ] Cache common queries

### 5.3 Smart Search UI
- [ ] Build `features/ai/components/smart-search.tsx`
  - [ ] Search bar with suggestions
  - [ ] Recent searches
  - [ ] Query examples
  - [ ] Voice input option

- [ ] Build `features/ai/components/search-results.tsx`
  - [ ] Grouped by type
  - [ ] Relevance scoring
  - [ ] Quick actions
  - [ ] Export options

## Phase 6: AI Report Generation (Hours 6-7) 📝

### 6.1 Narrative Generator
- [ ] Create `features/ai/services/narrative-generator.ts`
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
- [ ] Create narrative templates
- [ ] Section generators
- [ ] Data aggregation logic
- [ ] Formatting service

### 6.3 Report Builder UI
- [ ] Update `features/reports/components/report-builder.tsx`
  - [ ] AI content blocks
  - [ ] Regenerate sections
  - [ ] Edit capabilities
  - [ ] Preview updates

## Phase 7: Compliance Q&A Bot (Hours 7-8) 💬

### 7.1 Knowledge Base Setup
- [ ] Index charity regulations
- [ ] Create embeddings
- [ ] Build retrieval system
- [ ] Context management

### 7.2 Chat Service
- [ ] Create `features/ai/services/compliance-chat.ts`
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
- [ ] Build `features/ai/components/compliance-chat.tsx`
  - [ ] Chat interface
  - [ ] Suggested questions
  - [ ] Citation links
  - [ ] Save useful answers

- [ ] Build `features/ai/components/chat-message.tsx`
  - [ ] Message bubbles
  - [ ] Markdown support
  - [ ] Copy buttons
  - [ ] Feedback options

## Testing & Integration (Hour 8) 🧪

### 8.1 AI Feature Testing
- [ ] Test email parsing accuracy
- [ ] Verify OCR extraction rates
- [ ] Check CSV mapping logic
- [ ] Validate search results

### 8.2 Performance Testing
- [ ] Load test with multiple documents
- [ ] Check AI response times
- [ ] Monitor API usage
- [ ] Optimize slow queries

### 8.3 Error Handling
- [ ] Graceful AI failures
- [ ] User-friendly error messages
- [ ] Fallback options
- [ ] Manual override capabilities

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