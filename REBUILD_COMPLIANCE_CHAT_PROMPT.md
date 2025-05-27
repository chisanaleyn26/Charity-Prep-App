# LLM Prompt: Rebuild Charity Prep Compliance Chat Feature

## CRITICAL: READ THESE FIRST - MANDATORY

🚨 **BEFORE YOU START**: You MUST read these files in this exact order:

1. **CLAUDE.md** - Contains critical development guidelines you MUST follow
2. **Use MCP Supabase integration** - You have full Supabase access via MCP functions
3. **Read `/docs` folder** - Complete project documentation and architecture
4. **List and understand current project structure** - Don't create duplicate files
5. **Be extremely careful with file creation** - Only create what's absolutely necessary

### Key Rules from CLAUDE.md:
- Always read entire files before making changes
- Ask before editing config files (tailwind, etc.)
- Commit early and often at logical milestones
- Look up latest library syntax when unsure
- Never skip implementations - no dummy/placeholder code
- Run linting after major changes
- Get plan approval before writing code
- Break down large tasks into subtasks

### MCP Integration Available:
- Use `mcp__supabase__*` functions for all database operations
- List projects first: `mcp__supabase__list_projects`
- Get project details: `mcp__supabase__get_project`
- Execute SQL: `mcp__supabase__execute_sql`
- Apply migrations: `mcp__supabase__apply_migration`

### BEFORE CREATING ANY FILES:
1. Read the entire `/docs` folder to understand architecture
2. Check existing file structure to avoid duplicates
3. Understand current implementation patterns
4. Plan your approach and get approval
5. Only then start implementation

## Context & Project Overview

You are rebuilding the compliance chat feature for **Charity Prep**, a SaaS platform helping UK charities comply with new Annual Return regulations (2024). The current implementation has performance issues and needs a complete rebuild.

### Technology Stack
- **Frontend**: Next.js 15.2 (App Router), TypeScript, Zustand for UI state
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **AI**: Gemini 2.5 Flash via OpenRouter API
- **UI**: Shadcn UI components + Ethereal design system
- **Design Colors**: Inchworm (#B1FA63), Gunmetal (#243837), Orange (#FE7733)

### Architecture Principles
- Server Components by default, Client Components only when needed
- Server Actions for mutations
- Zustand for UI state only (not server data)
- Feature-based organization
- Progressive enhancement

## Current Issues with Existing Implementation
1. **Rate Limiting**: OpenRouter API returns 429 errors frequently
2. **Slow Response**: 7-9 second response times
3. **Poor Error Handling**: Doesn't gracefully handle failures
4. **No Chat History**: Messages lost on page refresh
5. **No Response Caching**: Same questions hit API repeatedly

## Requirements for New Implementation

### Core Features
1. **AI-Powered Chat**: Context-aware responses about UK charity compliance
2. **Real-time Messaging**: Instant message exchange with typing indicators
3. **Persistent Chat History**: Store conversations in Supabase
4. **Smart Caching**: Cache responses to avoid repeat API calls
5. **Context Awareness**: Know user's charity data for personalized advice
6. **Regulatory Knowledge**: Expert on Charities Act, DBS requirements, fundraising rules

### UI/UX Requirements
1. **Professional Chat Interface**: Clean, WhatsApp-style messaging
2. **Suggested Questions**: Context-relevant quick starts
3. **Compliance Alerts Sidebar**: Show deadlines/warnings
4. **Related Guidance**: Link to official resources
5. **Mobile Responsive**: Works perfectly on phones
6. **Loading States**: Skeleton loaders, typing indicators
7. **Error Recovery**: Retry mechanisms, fallback options

### Technical Requirements
1. **New URL**: Create at `/ai/compliance-assistant` (not `/compliance/chat`)
2. **Supabase Integration**: Store chat history, user context
3. **Rate Limiting Handling**: Queue requests, exponential backoff
4. **Response Caching**: 24-hour cache for identical questions
5. **Real-time Updates**: Live typing indicators, instant messages
6. **Performance**: < 3 second response times, smooth scrolling

## File Structure to Create

```
/app/(app)/ai/
  └── compliance-assistant/
      └── page.tsx                    # Main page (Server Component)

/features/ai/
  ├── components/
  │   ├── compliance-assistant.tsx    # Main chat component (Client)
  │   ├── chat-message.tsx           # Individual message component
  │   ├── message-input.tsx          # Input with send button
  │   ├── suggested-questions.tsx    # Quick start questions
  │   ├── chat-sidebar.tsx           # Alerts & guidance sidebar
  │   └── typing-indicator.tsx       # Animated typing dots
  ├── hooks/
  │   ├── use-chat-history.ts        # Manage chat messages
  │   ├── use-ai-assistant.ts        # AI API integration
  │   └── use-compliance-context.ts  # User's charity context
  ├── services/
  │   ├── ai-assistant.ts            # OpenRouter integration
  │   ├── chat-storage.ts            # Supabase chat operations
  │   └── response-cache.ts          # Cache management
  └── types/
      └── chat.ts                    # TypeScript interfaces

/app/api/ai/
  └── compliance-assistant/
      └── route.ts                   # API endpoint for chat
```

## Database Schema Required

```sql
-- Chat conversations
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB, -- sources, confidence, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Response cache
CREATE TABLE ai_response_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_hash TEXT UNIQUE NOT NULL,
  response TEXT NOT NULL,
  context_hash TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Key Components to Implement

### 1. Main Chat Component (`compliance-assistant.tsx`)
- Real-time message list with smooth scrolling
- Auto-scroll to bottom on new messages
- Message grouping by sender
- Timestamp display
- Professional styling with Ethereal colors

### 2. AI Service Integration (`ai-assistant.ts`)
- OpenRouter API integration with retry logic
- Rate limiting with exponential backoff
- Response caching to avoid repeat calls
- Context-aware prompts
- Error handling with meaningful messages

### 3. Chat Storage (`chat-storage.ts`)
- Save conversations to Supabase
- Load chat history on page load
- Real-time sync across devices
- Message persistence

### 4. Compliance Context (`use-compliance-context.ts`)
- Load user's charity data for context
- Include recent compliance issues
- Current charity status and needs
- Personalized question suggestions

## Design Specifications

### Message Styling
- **User messages**: Right-aligned, primary color background (#B1FA63)
- **AI messages**: Left-aligned, light gray background
- **System messages**: Centered, subtle styling
- **Timestamps**: Small, muted text below messages
- **Avatar**: Bot icon for AI, user initial for human

### Sidebar Components
- **Compliance Alerts**: Red/orange urgent items
- **Deadlines**: Calendar-based warnings
- **Quick Actions**: Links to official guidance
- **Related Resources**: Context-relevant help

### Suggested Questions Examples
```
"What DBS checks do we need for our volunteers?"
"When is our annual return due?"
"How do we report overseas spending?"
"What fundraising regulations apply to us?"
"Do we need a safeguarding policy?"
```

## Performance Requirements
1. **Initial Load**: < 2 seconds to show chat interface
2. **Message Send**: < 500ms to show user message
3. **AI Response**: < 3 seconds average (with caching)
4. **Smooth Scrolling**: 60fps animation
5. **Mobile Performance**: Works on slow 3G

## Error Handling Strategy
1. **Rate Limiting**: Show "High demand - please wait" with retry timer
2. **Network Errors**: "Connection issue - try again" with retry button
3. **API Errors**: "Sorry, I'm having trouble - contact support"
4. **Timeout**: "Taking longer than usual - still working..."
5. **Cache Fallback**: Show cached response if API fails

## Compliance Knowledge Base

The AI should be expert on:
- **Charities Act 2011** and recent amendments
- **DBS Check Requirements** for different roles
- **Annual Return Regulations 2024** (new requirements)
- **Fundraising Standards** and Fundraising Regulator code
- **Overseas Activities** reporting thresholds
- **Safeguarding Obligations** for different charity types
- **Gift Aid Rules** and eligibility
- **Trustee Responsibilities** and legal duties

## Implementation Instructions

1. **Start with Database**: Create the tables for chat storage
2. **Build API Route**: Handle chat requests with proper error handling
3. **Create Components**: Build UI components with proper TypeScript
4. **Add AI Integration**: Implement OpenRouter with caching
5. **Test Thoroughly**: Ensure mobile works, errors handled
6. **Update Sidebar**: Change link from `/compliance/chat` to `/ai/compliance-assistant`

## Success Criteria
- ✅ Chat loads in < 2 seconds
- ✅ Messages persist across sessions
- ✅ AI responds in < 3 seconds average
- ✅ Handles rate limiting gracefully
- ✅ Mobile experience is excellent
- ✅ No console errors or crashes
- ✅ Professional, delightful UX

Build this as a production-ready feature that charity administrators will love using daily. Focus on reliability, speed, and helpfulness above all else.

## Final Notes
- Follow all Next.js 15.2 best practices
- Use Server Components where possible
- Implement proper TypeScript types
- Add comprehensive error boundaries
- Test on mobile devices
- Make it genuinely helpful for charity compliance

## MANDATORY: MEMORY BANK UPDATE
After completing this work, you MUST update the memory bank:
1. Create/update a file in `/memory-bank/` describing what was implemented
2. Include any architectural decisions made
3. Document any issues encountered and solutions
4. Update the main project state file
5. Note any changes that affect other parts of the system

## FINAL CHECKPOINT
Before considering this task complete:
- [ ] All CLAUDE.md guidelines followed
- [ ] MCP Supabase integration used appropriately
- [ ] Project documentation read and understood
- [ ] No duplicate files created
- [ ] Implementation tested and working
- [ ] Memory bank updated with progress
- [ ] Code committed at logical milestones
- [ ] Linting passed
- [ ] Mobile experience verified