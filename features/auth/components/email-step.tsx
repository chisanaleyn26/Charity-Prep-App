'use client'

import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ArrowRight, Sparkles } from 'lucide-react'
import { EtherealButton } from '@/components/custom-ui/ethereal-button'
import { EtherealInput } from '@/components/custom-ui/ethereal-input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { LoadingSpinner } from '@/components/common/loading-spinner'

// Email validation schema
const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .max(320, 'Email address is too long')
    .refine((email) => {
      // Basic domain validation
      const domain = email.split('@')[1]
      return domain && domain.includes('.')
    }, 'Please enter a valid email domain')
})

type EmailFormData = z.infer<typeof emailSchema>

interface EmailStepProps {
  onSubmit: (email: string) => Promise<void>
  isLoading?: boolean
  error?: string
  defaultEmail?: string
}

/**
 * Email input step for OTP login flow
 * Handles email validation and submission with enhanced UX
 */
export function EmailStep({ 
  onSubmit, 
  isLoading = false,
  error,
  defaultEmail = ''
}: EmailStepProps) {
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: defaultEmail
    },
    mode: 'onChange'
  })

  const handleSubmit = async (data: EmailFormData) => {
    await onSubmit(data.email.toLowerCase().trim())
  }

  // Common email domain suggestions
  const suggestEmailDomain = (email: string): string | null => {
    if (!email.includes('@') || email.endsWith('@')) return null
    
    const [localPart, domain] = email.split('@')
    if (!domain || domain.includes('.')) return null
    
    const commonDomains = [
      { pattern: /^gm/i, suggestion: 'gmail.com' },
      { pattern: /^ya/i, suggestion: 'yahoo.com' },
      { pattern: /^hot/i, suggestion: 'hotmail.com' },
      { pattern: /^out/i, suggestion: 'outlook.com' },
      { pattern: /^icl/i, suggestion: 'icloud.com' },
      { pattern: /^pr/i, suggestion: 'protonmail.com' },
    ]
    
    const match = commonDomains.find(d => d.pattern.test(domain))
    return match ? `${localPart}@${match.suggestion}` : null
  }

  const emailValue = form.watch('email')
  const suggestion = suggestEmailDomain(emailValue)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-[#B1FA63]/20 mb-2">
          <Mail className="h-6 w-6 text-[#B1FA63]" />
        </div>
        <h2 className="text-2xl font-semibold text-[#243837]">
          Sign in to Charity Prep
        </h2>
        <p className="text-[#616161]">
          We'll send you a verification code
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit(handleSubmit)(e)
        }} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#243837]">
                  Email address
                </FormLabel>
                <FormControl>
                  <EtherealInput
                    type="email"
                    placeholder="your@charity.org"
                    disabled={isLoading}
                    autoComplete="email"
                    autoFocus
                    {...field}
                    variant={error || form.formState.errors.email ? 'error' : 'default'}
                  />
                </FormControl>
                <FormMessage />
                
                {/* Email suggestion */}
                {suggestion && suggestion !== emailValue && (
                  <p className="text-sm text-[#616161] mt-1">
                    Did you mean{' '}
                    <button
                      type="button"
                      onClick={() => {
                        form.setValue('email', suggestion)
                        form.clearErrors('email')
                      }}
                      className="text-[#B1FA63] hover:underline font-medium"
                    >
                      {suggestion}
                    </button>
                    ?
                  </p>
                )}
                
                {/* Server error */}
                {error && (
                  <p className="text-sm text-red-500 mt-1">{error}</p>
                )}
              </FormItem>
            )}
          />

          <EtherealButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" variant="dark" />
                <span>Sending code...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </EtherealButton>
        </form>
      </Form>

      {/* Features */}
      <div className="border-t border-gray-200 pt-6">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-1 rounded-full bg-[#B1FA63]/20 mt-0.5">
              <Sparkles className="h-4 w-4 text-[#B1FA63]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#243837]">No password needed</p>
              <p className="text-sm text-[#616161]">Sign in securely with just your email</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-1 rounded-full bg-[#B1FA63]/20 mt-0.5">
              <Mail className="h-4 w-4 text-[#B1FA63]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#243837]">Quick verification</p>
              <p className="text-sm text-[#616161]">Enter the 6-digit code we email you</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}