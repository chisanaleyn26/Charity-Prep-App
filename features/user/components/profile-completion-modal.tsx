'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  CheckCircle2, 
  ArrowRight, 
  X,
  Info,
  Star,
  Camera,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUserProfile, type UserProfile } from '@/features/user/hooks/use-user-profile'
import { toast } from 'sonner'

// Validation schema for profile completion
const profileCompletionSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  job_title: z.string().max(100, 'Job title is too long').optional(),
  phone: z.string().regex(/^[\+]?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
})

type ProfileCompletionFormData = z.infer<typeof profileCompletionSchema>

interface ProfileCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  autoShow?: boolean // Show automatically for incomplete profiles
}

const COMPLETION_STEPS = [
  {
    id: 'name',
    title: 'Your Name',
    description: 'How should we address you?',
    icon: User,
    required: true,
    field: 'full_name' as keyof ProfileCompletionFormData
  },
  {
    id: 'role',
    title: 'Job Title',
    description: 'What\'s your role in the organization?',
    icon: Building,
    required: false,
    field: 'job_title' as keyof ProfileCompletionFormData
  },
  {
    id: 'contact',
    title: 'Contact Info',
    description: 'How can we reach you?',
    icon: Phone,
    required: false,
    field: 'phone' as keyof ProfileCompletionFormData
  }
] as const

export function ProfileCompletionModal({ 
  isOpen, 
  onClose, 
  onComplete, 
  autoShow = true 
}: ProfileCompletionModalProps) {
  const router = useRouter()
  const { profile, updateProfile, completionStatus } = useUserProfile()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const form = useForm<ProfileCompletionFormData>({
    resolver: zodResolver(profileCompletionSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      job_title: profile?.job_title || '',
      phone: profile?.phone || '',
      bio: profile?.bio || ''
    }
  })

  // Reset form when profile changes
  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || '',
        job_title: profile.job_title || '',
        phone: profile.phone || '',
        bio: profile.bio || ''
      })
    }
  }, [profile, form])

  // Auto-advance through completed steps
  useEffect(() => {
    if (!isOpen || !profile) return

    const step = COMPLETION_STEPS[currentStep]
    if (step && profile[step.field] && profile[step.field]?.trim()) {
      // This step is already completed, advance to next incomplete step
      const nextIncompleteStep = COMPLETION_STEPS.findIndex((s, index) => {
        if (index <= currentStep) return false
        const value = profile[s.field]
        return !value || !value.trim()
      })
      
      if (nextIncompleteStep !== -1) {
        setCurrentStep(nextIncompleteStep)
      }
    }
  }, [currentStep, profile, isOpen])

  const handleSubmit = async (data: ProfileCompletionFormData) => {
    setIsSubmitting(true)
    try {
      // Clean up empty strings
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key, 
          typeof value === 'string' && value.trim() === '' ? undefined : value
        ])
      ) as Partial<UserProfile>

      const success = await updateProfile(cleanData)
      
      if (success) {
        setShowSuccess(true)
        toast.success('Profile updated successfully!')
        
        // Auto-close after success animation
        setTimeout(() => {
          onComplete()
          onClose()
          setShowSuccess(false)
        }, 1500)
      } else {
        toast.error('Failed to update profile. Please try again.')
      }
    } catch (error) {
      console.error('Profile completion error:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    const currentStepData = COMPLETION_STEPS[currentStep]
    if (currentStepData.required) {
      const value = form.getValues(currentStepData.field)
      if (!value || !value.trim()) {
        form.setError(currentStepData.field, {
          type: 'required',
          message: 'This field is required'
        })
        return
      }
    }

    if (currentStep < COMPLETION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      form.handleSubmit(handleSubmit)()
    }
  }

  const handleSkip = () => {
    if (currentStep < COMPLETION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      form.handleSubmit(handleSubmit)()
    }
  }

  const getStepProgress = () => {
    return ((currentStep + 1) / COMPLETION_STEPS.length) * 100
  }

  const currentStepData = COMPLETION_STEPS[currentStep]
  const StepIcon = currentStepData?.icon

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Profile Complete!</h3>
            <p className="text-sm text-muted-foreground">
              Welcome to Charity Prep. Your profile is now complete.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle>Complete Your Profile</DialogTitle>
                <DialogDescription>
                  Help us personalize your experience
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Step {currentStep + 1} of {COMPLETION_STEPS.length}
              </span>
              <span className="font-medium">{Math.round(getStepProgress())}% complete</span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
          </div>

          {/* Current Step */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {StepIcon && (
                <div className="rounded-full bg-blue-100 p-2">
                  <StepIcon className="h-5 w-5 text-blue-600" />
                </div>
              )}
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  {currentStepData?.title}
                  {currentStepData?.required && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentStepData?.description}
                </p>
              </div>
            </div>

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Step-specific content */}
              {currentStep === 0 && (
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="full_name"
                      className="pl-9"
                      placeholder="Enter your full name"
                      {...form.register('full_name')}
                    />
                  </div>
                  {form.formState.errors.full_name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.full_name.message}
                    </p>
                  )}
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="job_title"
                      className="pl-9"
                      placeholder="e.g., Compliance Officer, Trustee"
                      {...form.register('job_title')}
                    />
                  </div>
                  {form.formState.errors.job_title && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.job_title.message}
                    </p>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        className="pl-9"
                        placeholder="+44 20 1234 5678"
                        {...form.register('phone')}
                      />
                    </div>
                    {form.formState.errors.phone && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      rows={3}
                      placeholder="Tell us a bit about yourself..."
                      {...form.register('bio')}
                    />
                    <p className="text-xs text-muted-foreground">
                      {form.watch('bio')?.length || 0}/500 characters
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      Back
                    </Button>
                  )}
                  {!currentStepData?.required && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleSkip}
                      disabled={isSubmitting}
                    >
                      Skip
                    </Button>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="ml-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : currentStep === COMPLETION_STEPS.length - 1 ? (
                    <>
                      Complete
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Benefits */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              A complete profile helps us personalize your experience and ensures you receive important updates.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  )
}