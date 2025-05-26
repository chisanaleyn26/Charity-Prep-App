# Charity Prep - UX Flow Documentation

## Table of Contents

1. [User Journey Overview](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#user-journey-overview)
2. [Onboarding Flow](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#onboarding-flow)
3. [Daily Usage Flows](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#daily-usage-flows)
4. [Compliance Management Flows](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#compliance-management-flows)
5. [Report Generation Flows](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#report-generation-flows)
6. [AI-Powered Flows](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#ai-powered-flows)
7. [Mobile-Specific Flows](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#mobile-specific-flows)
8. [Critical Error States](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#critical-error-states)
9. [Flow Optimization Principles](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#flow-optimization-principles)

## User Journey Overview

### User Personas & Mental States

**Primary Persona: Sarah, Charity Administrator**

- Wearing multiple hats (finance, HR, compliance)
- Not technical, comfortable with Excel
- Anxious about compliance
- Time-poor, interrupted often
- Checks email constantly

**Secondary Persona: Marcus, Charity Accountant**

- Manages 5-10 charity clients
- Needs bulk operations
- Cares about accuracy
- Wants standardized processes

### Emotional Journey Map

```
Discovery → Skepticism → "Oh shit I need this" → Trial → Quick Win → Trust → Purchase → Relief
    ↓            ↓                ↓                ↓         ↓         ↓         ↓          ↓
"Another    "Is this      "We're not      "Free    "It found  "This   "Worth   "I can
 tool?"      legit?"       ready!"        trial!"   issues!"  works!"  £199!"   breathe!"

```

## Onboarding Flow

### 1. Landing Page → Signup (2 minutes)

```
Landing Page
├── Hero: "Annual Return Stress? Sorted."
├── Risk Calculator: "Enter your year-end date" → Shows deadline + countdown
├── Social Proof: "247 charities already compliant"
└── CTA: "Start Free 30-Day Trial"
    ↓
Email Capture (passwordless)
├── Email field only
├── Auto-detect charity from email domain
├── "Check your email for login link"
└── Show benefits while waiting
    ↓
Magic Link Email
├── Subject: "👉 One click to start your compliance journey"
├── Big button: "Access Charity Prep"
└── P.S. "This link expires in 24 hours"

```

### 2. First Login → Quick Setup (5 minutes)

```
Welcome Screen
├── "Welcome Sarah! Let's get you compliant in 5 minutes"
├── Progress bar showing 3 steps
└── "Skip setup" option (dangerous but available)
    ↓
Step 1: Charity Details
├── Pre-filled from Charity Commission API
├── Confirm/edit: Name, Number, Year End
├── One question: "What's your income band?"
└── Auto-save on every field
    ↓
Step 2: Your Biggest Worry
├── "What keeps you up at night?" (choose one)
│   ├── □ DBS checks expiring
│   ├── □ Overseas spending tracking
│   ├── □ Fundraising compliance
│   └── □ Just everything!
└── Sets initial dashboard focus
    ↓
Step 3: Import Existing Data
├── Big upload zone: "Drag your spreadsheet here"
├── OR: "I'll do this later"
├── Smart detection: "Looks like DBS records!"
└── Preview with magic column matching
    ↓
Dashboard: The "Oh Shit" Moment
├── Risk Score: 47% (red)
├── "3 DBS checks expired" (flashing)
├── "£12,400 overseas spend unrecorded"
└── Big button: "Fix Most Urgent Issue"

```

### 3. Activation: First Value (< 10 minutes)

```
Fix Urgent Issue Flow
├── "Let's fix those expired DBS checks"
├── Simple form with just essentials
├── "Add another" vs "I'm done"
└── Instant score update: 47% → 62%
    ↓
Celebration Screen
├── Confetti animation
├── "You're already more compliant!"
├── Share buttons: "Tell other charities"
└── "What's next?" → Back to dashboard

```

## Daily Usage Flows

### Quick Entry Flow (Mobile-optimized)

```
Mobile Home Screen
├── Big buttons for common actions:
│   ├── "Log DBS Check"
│   ├── "Record Donation"
│   ├── "Add Expense"
│   └── "Check Compliance"
└── Voice note option: "Tell me what happened"
    ↓
Quick DBS Entry
├── Name field (autocomplete from previous)
├── Photo capture: "Snap the certificate"
├── AI extracts: Number, dates
├── One-tap save
└── Success: "Reminder set for 11 months"

```

### Email Forward Flow

```
User forwards receipt to: data-1234@charityprep.uk
    ↓
AI Processing (background)
├── Extract: Amount, vendor, date
├── Categorize: Overseas/UK, type
├── Match to existing records
└── Queue for review
    ↓
Next Login: Review Queue
├── "3 items extracted from your emails"
├── One-click confirm each
├── Or edit if needed
└── Bulk approve all

```

## Compliance Management Flows

### Weekly Compliance Check

```
Friday Email: "Your Weekly Compliance Update"
├── Score change: "72% → 78% ↑"
├── Upcoming: "2 DBS expire this month"
├── Quick wins: "Add 1 more income source for 80%"
└── One-click: "View Full Dashboard"
    ↓
Compliance Dashboard
├── Visual Risk Radar (red/amber/green)
├── Hover for details
├── Click section → Jump to fix
└── "Download Board Report" button

```

### DBS Expiry Management

```
30 Days Before Expiry
├── Email: "John's DBS expires in 30 days"
├── Dashboard: Yellow warning badge
└── Task list: "Upcoming renewals"
    ↓
7 Days Before: Escalation
├── Email: Daily reminders
├── Dashboard: Red warning
├── SMS option: "Text John directly"
└── One-click: "Mark as renewed"
    ↓
Expiry Day
├── Dashboard: Compliance score drops
├── Urgent banner: "Action required"
├── Options:
│   ├── "Record renewal"
│   ├── "Suspend from duties"
│   └── "Add explanation note"

```

### Overseas Spending Flow

```
Add Overseas Activity
├── Country dropdown (with risk flags)
├── Partner: Select existing or add new
├── Amount in local currency
├── Auto-convert to GBP
├── Transfer method chips:
│   ├── Bank Transfer ✓
│   ├── Western Union
│   ├── Crypto (shows warning)
│   └── Cash (requires note)
└── Save → Updates country map view
    ↓
High-Risk Country Warning
├── "Syria is a high-risk destination"
├── Required fields appear:
│   ├── Due diligence completed?
│   ├── Partner verification docs
│   └── Purpose statement
└── Can't save without completing

```

## Report Generation Flows

### Annual Return Generator

```
Annual Return Tab
├── Progress bar: "87% ready"
├── Missing items checklist
├── "Generate Preview" button
└── Deadline countdown: "47 days"
    ↓
Preview Screen (looks like actual form)
├── Side-by-side with official form
├── Pre-filled answers highlighted
├── Missing fields in red
├── Copy buttons for each field
└── "Export All Answers" → CSV
    ↓
Missing Data Prompt
├── "3 fields need attention:"
├── Jump links to fix each
├── "I'll explain later" option
└── Progress updates live

```

### Board Report Generation

```
Create Board Pack
├── Select meeting date
├── Choose sections:
│   ├── ✓ Compliance Summary
│   ├── ✓ Risk Overview
│   ├── ✓ Upcoming Deadlines
│   └── □ Detailed Finances
└── "Generate PDF"
    ↓
AI Processing
├── "Creating your narrative..."
├── Progress spinner
├── 15-30 seconds
└── Preview appears
    ↓
Report Preview
├── Branded with charity logo
├── Professional formatting
├── Editable text areas
├── "Regenerate" sections
└── "Download PDF" / "Email to Trustees"

```

## AI-Powered Flows

### Natural Language Search

```
Search Bar (omnipresent)
├── "Try: Show all DBS expiring in March"
├── Auto-suggestions appear
├── Recent searches below
└── Voice input option
    ↓
Results Page
├── Direct answer: "4 DBS checks expire in March"
├── Listed with days remaining
├── Actions: "Send reminders to all"
└── Related: "View April expirations"

```

### Compliance Q&A

```
Help Button → "Ask anything"
├── Common questions:
│   ├── "Do I need to report Bitcoin?"
│   ├── "What counts as overseas?"
│   └── "When is my deadline?"
├── Type custom question
└── Context-aware (knows current screen)
    ↓
AI Response
├── Clear yes/no when possible
├── Links to relevant regulations
├── "Based on your data..." personalization
└── "Save this answer" option

```

### Smart Document Processing

```
Document Upload
├── Drag zone: "Drop DBS certificates here"
├── Multi-file supported
├── Progress bar per file
└── AI extraction begins
    ↓
Extraction Preview
├── Shows highlighted data on document
├── Extracted fields below
├── Confidence indicators
├── Edit any field
└── "Confirm All" to save
    ↓
Automatic Actions
├── Creates safeguarding record
├── Sets expiry reminder
├── Links document
└── Updates compliance score

```

## Mobile-Specific Flows

### Volunteer Quick Submit

```
Volunteer receives SMS
├── "Submit your DBS check: [link]"
├── Opens mobile-optimized page
├── No login required
└── Big "Take Photo" button
    ↓
Photo Capture
├── Camera opens directly
├── Guide overlay for framing
├── Auto-capture when focused
└── "Retake" or "Use Photo"
    ↓
Confirm Details
├── Shows extracted info
├── Can edit if needed
├── "Submit to [Charity Name]"
└── Success: "Thanks! We'll confirm receipt"

```

### Field Work Entry

```
Offline Mode Banner
├── "No connection - saving locally"
├── Continue working normally
├── Queue icon shows pending: "3"
└── Auto-sync when connected
    ↓
Quick Action Menu (thumb-reachable)
├── FAB button bottom right
├── Radial menu:
│   ├── 📸 Snap receipt
│   ├── ✓ Quick DBS check
│   ├── 💰 Log donation
│   └── 🌍 Overseas spend
└── Each optimized for one-hand use

```

## Critical Error States

### Compliance Deadline Missed

```
Red Alert Banner
├── "Annual Return was due 3 days ago"
├── "Maximum fine: £500/day"
├── Two actions:
│   ├── "Submit Now" → Fast track flow
│   └── "Get Help" → Support chat
└── Cannot dismiss, only minimize

```

### Subscription Expired

```
Limited Access Mode
├── "Your trial ended - upgrade to continue"
├── Can view but not edit
├── Export data still allowed
├── Big "Choose Plan" button
└── "Extend trial" → Email CEO option

```

### Import Failures

```
Import Error Handling
├── "We couldn't understand 3 rows"
├── Shows problematic data
├── Options:
│   ├── Fix and retry
│   ├── Skip these rows
│   └── Get help (shows example)
└── Successful rows already saved

```

## Flow Optimization Principles

### 1. Reduce Cognitive Load

- **One primary action per screen**
- **Smart defaults everywhere**
- **Progressive disclosure**
- **Contextual help, not manuals**

### 2. Design for Interruption

- **Auto-save everything**
- **Resume where left off**
- **No long forms**
- **Email/SMS continuations**

### 3. Mobile-First Critical Paths

- **DBS photo capture**
- **Receipt forwarding**
- **Quick compliance check**
- **Trustee report sharing**

### 4. Celebrate Progress

- **Score increases = dopamine**
- **Weekly wins emails**
- **Comparison to peers**
- **Streak tracking**

### 5. Reduce Anxiety

- **Show deadlines clearly**
- **Explain consequences**
- **Provide escape hatches**
- **Human support option**

### 6. The "Magic" Moments

1. **Email → Data**: "How did it know?!"
2. **Photo → Record**: "It read my certificate!"
3. **Data → Report**: "It wrote my board report!"
4. **Question → Answer**: "It knows my situation!"

## Key Success Metrics

### Onboarding

- Time to first value: < 10 minutes
- Setup completion: > 80%
- Import success rate: > 90%

### Engagement

- Weekly active usage: > 60%
- Mobile usage: > 40%
- AI feature adoption: > 70%

### Retention

- 30-day retention: > 80%
- Annual renewal: > 90%
- Referral rate: > 20%

## Summary

These flows prioritize:

1. **Immediate value** - Show problems within 5 minutes
2. **Low friction** - Passwordless, auto-detect, smart defaults
3. **Mobile-first** - Critical tasks work on phones
4. **AI delight** - Magic moments that save hours
5. **Anxiety reduction** - Clear deadlines, consequences, and fixes

Every flow is designed around the reality that charity admins are interrupted, anxious, and non-technical. The UI should feel like a helpful colleague, not software.