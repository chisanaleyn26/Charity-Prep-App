'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from './utils'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  action?: string
  completed: boolean
  order: number
}

export interface OnboardingProgress {
  userId: string
  organizationId: string
  currentStep: number
  completedSteps: string[]
  startedAt: Date
  completedAt?: Date
  skipped: boolean
}

export interface HelpArticle {
  id: string
  title: string
  content: string
  category: 'getting-started' | 'compliance' | 'features' | 'troubleshooting' | 'billing'
  tags: string[]
  helpful_count: number
  not_helpful_count: number
  view_count: number
}

export interface TourStep {
  target: string // CSS selector
  title: string
  content: string
  placement: 'top' | 'bottom' | 'left' | 'right'
  action?: {
    label: string
    handler: string
  }
}

// Onboarding steps definition
const ONBOARDING_STEPS: Omit<OnboardingStep, 'completed'>[] = [
  {
    id: 'welcome',
    title: 'Welcome to Charity Prep!',
    description: 'Let\'s get your charity set up for compliance success',
    order: 1
  },
  {
    id: 'organization-details',
    title: 'Complete Organization Details',
    description: 'Add your charity number and basic information',
    action: '/settings/organization',
    order: 2
  },
  {
    id: 'first-dbs',
    title: 'Add Your First DBS Check',
    description: 'Track safeguarding compliance by adding DBS records',
    action: '/compliance/safeguarding',
    order: 3
  },
  {
    id: 'explore-dashboard',
    title: 'Check Your Compliance Score',
    description: 'See how your charity is doing across all compliance areas',
    action: '/dashboard',
    order: 4
  },
  {
    id: 'invite-team',
    title: 'Invite Team Members',
    description: 'Add trustees and staff to collaborate on compliance',
    action: '/settings/team',
    order: 5
  }
]

/**
 * Get user's onboarding progress
 */
export async function getOnboardingProgress(
  organizationId?: string
): Promise<{ progress?: OnboardingProgress; steps?: OnboardingStep[]; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()
    
    const orgId = organizationId || user.current_organization_id
    if (!orgId) {
      return { error: 'No organization selected' }
    }
    
    // Get or create progress
    let { data: progress } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('organization_id', orgId)
      .single()
    
    if (!progress) {
      // Create new progress
      const { data: newProgress } = await supabase
        .from('onboarding_progress')
        .insert({
          user_id: user.id,
          organization_id: orgId,
          current_step: 1,
          completed_steps: [],
          started_at: new Date().toISOString(),
          skipped: false
        })
        .select()
        .single()
      
      progress = newProgress
    }
    
    // Build steps with completion status
    const steps: OnboardingStep[] = ONBOARDING_STEPS.map(step => ({
      ...step,
      completed: progress?.completed_steps?.includes(step.id) || false
    }))
    
    return {
      progress: progress ? {
        ...progress,
        startedAt: new Date(progress.started_at),
        completedAt: progress.completed_at ? new Date(progress.completed_at) : undefined
      } : undefined,
      steps
    }
    
  } catch (error) {
    console.error('Get onboarding progress error:', error)
    return { error: 'Failed to get onboarding progress' }
  }
}

/**
 * Complete onboarding step
 */
export async function completeOnboardingStep(
  stepId: string,
  organizationId?: string
): Promise<{ success?: boolean; nextStep?: OnboardingStep; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()
    
    const orgId = organizationId || user.current_organization_id
    if (!orgId) {
      return { error: 'No organization selected' }
    }
    
    // Get current progress
    const { data: progress } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('organization_id', orgId)
      .single()
    
    if (!progress) {
      return { error: 'Onboarding not started' }
    }
    
    // Update completed steps
    const completedSteps = [...(progress.completed_steps || []), stepId]
    const uniqueSteps = Array.from(new Set(completedSteps))
    
    // Check if all steps completed
    const allCompleted = ONBOARDING_STEPS.every(step => 
      uniqueSteps.includes(step.id)
    )
    
    // Find next step
    const currentStepIndex = ONBOARDING_STEPS.findIndex(s => s.id === stepId)
    const nextStepData = ONBOARDING_STEPS[currentStepIndex + 1]
    
    // Update progress
    const { error } = await supabase
      .from('onboarding_progress')
      .update({
        completed_steps: uniqueSteps,
        current_step: nextStepData ? nextStepData.order : ONBOARDING_STEPS.length,
        completed_at: allCompleted ? new Date().toISOString() : null
      })
      .eq('id', progress.id)
    
    if (error) throw error
    
    // Track completion
    await supabase
      .from('activity_logs')
      .insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'onboarding_step_completed',
        resource_type: 'onboarding',
        resource_id: stepId,
        metadata: { step_title: ONBOARDING_STEPS.find(s => s.id === stepId)?.title }
      })
    
    const nextStep = nextStepData ? {
      ...nextStepData,
      completed: false
    } : undefined
    
    return { success: true, nextStep }
    
  } catch (error) {
    console.error('Complete onboarding step error:', error)
    return { error: 'Failed to complete step' }
  }
}

/**
 * Skip onboarding
 */
export async function skipOnboarding(
  organizationId?: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()
    
    const orgId = organizationId || user.current_organization_id
    if (!orgId) {
      return { error: 'No organization selected' }
    }
    
    const { error } = await supabase
      .from('onboarding_progress')
      .update({
        skipped: true,
        completed_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('organization_id', orgId)
    
    if (error) throw error
    
    return { success: true }
    
  } catch (error) {
    console.error('Skip onboarding error:', error)
    return { error: 'Failed to skip onboarding' }
  }
}

/**
 * Get help articles
 */
export async function getHelpArticles(
  options?: {
    category?: HelpArticle['category']
    search?: string
    limit?: number
  }
): Promise<{ articles?: HelpArticle[]; error?: string }> {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('help_articles')
      .select('*')
      .eq('published', true)
    
    if (options?.category) {
      query = query.eq('category', options.category)
    }
    
    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`)
    }
    
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    // Order by relevance (view count and helpful ratio)
    query = query.order('view_count', { ascending: false })
    
    const { data: articles, error } = await query
    
    if (error) throw error
    
    return { articles: articles || [] }
    
  } catch (error) {
    console.error('Get help articles error:', error)
    return { error: 'Failed to get help articles' }
  }
}

/**
 * Get help article by ID
 */
export async function getHelpArticle(
  articleId: string
): Promise<{ article?: HelpArticle; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Increment view count
    await supabase.rpc('increment_article_views', {
      p_article_id: articleId
    })
    
    const { data: article, error } = await supabase
      .from('help_articles')
      .select('*')
      .eq('id', articleId)
      .eq('published', true)
      .single()
    
    if (error) throw error
    
    return { article }
    
  } catch (error) {
    console.error('Get help article error:', error)
    return { error: 'Failed to get article' }
  }
}

/**
 * Rate help article
 */
export async function rateHelpArticle(
  articleId: string,
  helpful: boolean
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()
    
    // Check if already rated
    const { data: existing } = await supabase
      .from('help_article_ratings')
      .select('*')
      .eq('article_id', articleId)
      .eq('user_id', user.id)
      .single()
    
    if (existing) {
      // Update existing rating
      await supabase
        .from('help_article_ratings')
        .update({ helpful })
        .eq('id', existing.id)
    } else {
      // Create new rating
      await supabase
        .from('help_article_ratings')
        .insert({
          article_id: articleId,
          user_id: user.id,
          helpful
        })
    }
    
    // Update article counts
    if (helpful) {
      await supabase.rpc('increment_helpful_count', {
        p_article_id: articleId
      })
    } else {
      await supabase.rpc('increment_not_helpful_count', {
        p_article_id: articleId
      })
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('Rate help article error:', error)
    return { error: 'Failed to rate article' }
  }
}

/**
 * Get interactive tour for a page
 */
export async function getPageTour(
  page: string
): Promise<{ tour?: TourStep[]; error?: string }> {
  const tours: Record<string, TourStep[]> = {
    dashboard: [
      {
        target: '.compliance-score',
        title: 'Your Compliance Score',
        content: 'This shows your overall compliance health. Click for detailed breakdown.',
        placement: 'bottom'
      },
      {
        target: '.quick-actions',
        title: 'Quick Actions',
        content: 'Common tasks are always one click away',
        placement: 'left'
      },
      {
        target: '.alerts-panel',
        title: 'Important Alerts',
        content: 'Never miss critical compliance deadlines',
        placement: 'top'
      }
    ],
    safeguarding: [
      {
        target: '.add-dbs-button',
        title: 'Add DBS Records',
        content: 'Click here to add new DBS checks for staff and volunteers',
        placement: 'left',
        action: {
          label: 'Add First DBS',
          handler: 'openAddDBS'
        }
      },
      {
        target: '.dbs-table',
        title: 'DBS Overview',
        content: 'All your DBS records in one place. We\'ll alert you before they expire.',
        placement: 'top'
      }
    ],
    import: [
      {
        target: '.import-methods',
        title: 'Multiple Import Options',
        content: 'Upload CSVs, forward emails, or scan documents',
        placement: 'bottom'
      },
      {
        target: '.ai-mapping',
        title: 'AI-Powered Mapping',
        content: 'Our AI automatically maps your data to the right fields',
        placement: 'right'
      }
    ]
  }
  
  const tour = tours[page]
  if (!tour) {
    return { error: 'No tour available for this page' }
  }
  
  return { tour }
}

/**
 * Create contextual help widget data
 */
export async function getContextualHelp(
  context: string
): Promise<{ 
  tips?: string[]
  articles?: HelpArticle[]
  videoUrl?: string
  error?: string 
}> {
  const contextHelp: Record<string, any> = {
    'dbs-expiry': {
      tips: [
        'DBS checks typically last 3 years',
        'Set up email reminders 30 days before expiry',
        'Consider using the DBS Update Service for automatic renewals'
      ],
      videoUrl: 'https://help.charityprep.uk/videos/dbs-management'
    },
    'overseas-risk': {
      tips: [
        'High-risk countries require additional documentation',
        'Keep records of all money transfers',
        'Document the purpose and beneficiaries clearly'
      ]
    },
    'major-donor': {
      tips: [
        'Donations over £25,000 require special reporting',
        'Anonymous donations over £25,000 need extra checks',
        'Keep correspondence with major donors'
      ]
    }
  }
  
  const help = contextHelp[context]
  if (!help) {
    return { error: 'No contextual help available' }
  }
  
  // Get related articles
  const { articles } = await getHelpArticles({
    search: context.replace('-', ' '),
    limit: 3
  })
  
  return {
    tips: help.tips,
    articles,
    videoUrl: help.videoUrl
  }
}