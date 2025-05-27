# Compliance Chat Rebuild Task - 2025-01-28

## Task Overview
Created comprehensive prompt for another LLM to completely rebuild the compliance chat feature due to performance and reliability issues with the current implementation.

## Current Issues with Existing Chat
- **Rate Limiting**: OpenRouter API returns 429 errors frequently  
- **Slow Response**: 7-9 second response times
- **Poor Error Handling**: Doesn't gracefully handle failures
- **No Chat History**: Messages lost on page refresh
- **No Response Caching**: Same questions hit API repeatedly

## Solution Approach
- **Complete Rebuild**: Fresh implementation addressing all issues
- **New URL**: `/ai/compliance-assistant` (instead of `/compliance/chat`)
- **Performance Focus**: Caching, rate limiting, < 3 second responses
- **Persistent Storage**: Chat history saved to Supabase
- **Better UX**: Professional interface with proper error handling

## Files Created
- `REBUILD_COMPLIANCE_CHAT_PROMPT.md` - Comprehensive prompt for another LLM

## Key Requirements in Prompt
1. **Mandatory Reading**: CLAUDE.md, /docs folder, existing project structure
2. **MCP Integration**: Use Supabase MCP functions for all database operations
3. **Careful File Creation**: Only create necessary files, avoid duplicates
4. **Architecture Compliance**: Follow Next.js 15.2 best practices
5. **Memory Bank Updates**: Document all changes and decisions

## Database Schema Required
```sql
-- Chat conversations table
-- Chat messages table  
-- AI response cache table
```

## Expected File Structure
```
/app/(app)/ai/compliance-assistant/page.tsx
/features/ai/components/compliance-assistant.tsx
/features/ai/hooks/use-chat-history.ts
/features/ai/services/ai-assistant.ts
/app/api/ai/compliance-assistant/route.ts
```

## Performance Targets
- Initial Load: < 2 seconds
- Message Send: < 500ms  
- AI Response: < 3 seconds average
- Mobile Performance: Works on slow 3G

## Next Steps
1. Use prompt with another LLM to rebuild feature
2. Update sidebar to link to new URL
3. Remove old implementation once new one works
4. Test thoroughly on mobile and desktop

## CLAUDE.md Compliance
- ✅ Read entire files before making changes
- ✅ Ask before editing config files
- ✅ Commit early and often reminder included
- ✅ Look up latest library syntax reminder
- ✅ No dummy implementations allowed
- ✅ Run linting after changes
- ✅ Get plan approval first
- ✅ Break down large tasks

## MCP Integration Reminders
- Use `mcp__supabase__list_projects` first
- Use `mcp__supabase__execute_sql` for database operations
- Use `mcp__supabase__apply_migration` for schema changes

## Impact on Project
- Will replace current problematic chat implementation
- Requires sidebar navigation update (line 89-93 in sidebar.tsx)
- Should significantly improve user experience
- Addresses key performance bottlenecks

## Status
- [x] Comprehensive prompt created
- [ ] Implementation by another LLM pending
- [ ] Sidebar update pending
- [ ] Testing pending
- [ ] Old implementation removal pending