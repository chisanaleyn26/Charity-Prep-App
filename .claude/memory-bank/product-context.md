# Product Context

## Project Overview
Charity Prep is a SaaS platform helping UK charities comply with the new Charities (Annual Return) Regulations 2024. These regulations expand reporting requirements from 16 to 26+ questions for financial years ending after January 1, 2025, creating urgent demand for specialized compliance software.

## Core Features
- **Compliance Tracking**: Real-time scoring across safeguarding, overseas operations, and fundraising
- **AI-Powered Import**: Email forwarding and document OCR for automatic data extraction
- **Annual Return Generator**: Maps data to official form fields with one-click export
- **Board Report Generation**: AI-generated narratives for trustee meetings
- **Multi-Charity Support**: Advisor portal for managing multiple organizations

## Architecture
- **Frontend**: Next.js 15.2 with Server Components by default, Zustand for UI state only
- **Backend**: Supabase (PostgreSQL with RLS, Auth, Realtime, Storage)
- **AI Integration**: Gemini 2.5 Flash via OpenRouter for document extraction and report generation
- **Deployment**: Vercel with Edge Functions
- **Design System**: Shadcn UI with Ethereal theme (Inchworm #B1FA63 primary)

## Technology Stack
- **Next.js 15.2**: App Router with Server Components and Server Actions
- **TypeScript**: Strict mode with Zod validation
- **Supabase**: Database, auth, storage, realtime updates
- **Zustand**: Minimal client-side UI state management
- **Tailwind CSS**: Styling with Ethereal design system
- **OpenRouter**: AI service integration

## Updates
[2025-01-26 09:00:00] - Initial project documentation review and memory bank creation