'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { FormErrorBoundary } from '@/components/common/error-boundary'
import { EtherealCard, EtherealCardHeader, EtherealCardTitle, EtherealCardDescription, EtherealCardContent } from '@/components/custom-ui/ethereal-card'
import { EtherealButton } from '@/components/custom-ui/ethereal-button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Mail, Sparkles, Loader2 } from 'lucide-react'

// Enhanced validation schema
const loginFormSchema = z.object({
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
    .refine((email) => {
      // Prevent common typos
      const commonTypos = ['gmial.com', 'yahooo.com', 'hotmial.com', 'outlok.com']
      const domain = email.split('@')[1]
      return !commonTypos.includes(domain)
    }, 'Please check your email address for typos')
})

type LoginFormData = z.infer<typeof loginFormSchema>

export function LoginFormEnhanced() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: ''
    },
    mode: 'onBlur' // Validate on blur for better UX
  })

  const handleFormSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)

    try {
      // Call the sign-in server action
      const { signIn } = await import('@/lib/api/auth')
      const result = await signIn({ email: data.email })

      if (result.error) {
        // Handle specific error types
        if (result.error.includes('Invalid email')) {
          form.setError('email', { 
            type: 'manual', 
            message: 'This email address is not valid' 
          })
        } else if (result.error.includes('rate limit')) {
          toast.error('Too many requests. Please wait a moment before trying again.')
        } else if (result.error.includes('domain')) {
          form.setError('email', { 
            type: 'manual', 
            message: 'Email domain not allowed. Please use your organization email.' 
          })
        } else {
          toast.error(result.error)
        }
      } else {
        toast.success('Magic link sent! Check your email to sign in.')
        // Redirect to verify page
        router.push('/verify?email=' + encodeURIComponent(data.email))
      }
    } catch (err) {
      console.error('Login error:', err)
      
      // Handle different types of errors
      if (err instanceof Error) {
        if (err.message.includes('Network')) {
          toast.error('Network error. Please check your connection and try again.')
        } else if (err.message.includes('timeout')) {
          toast.error('Request timed out. Please try again.')
        } else {
          toast.error('Something went wrong. Please try again.')
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Email suggestions for common domains
  const suggestEmailCorrection = (email: string) => {
    const commonDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
      'icloud.com', 'aol.com', 'protonmail.com'
    ]
    const [localPart, domain] = email.split('@')
    
    if (!domain) return null
    
    // Find closest match using simple string similarity
    const suggestions = commonDomains.filter(d => 
      Math.abs(d.length - domain.length) <= 2 &&
      d.startsWith(domain[0])
    )
    
    return suggestions.length > 0 ? `${localPart}@${suggestions[0]}` : null
  }

  const emailValue = form.watch('email')
  const emailSuggestion = emailValue && emailValue.includes('@') ? 
    suggestEmailCorrection(emailValue) : null

  return (
    <FormErrorBoundary onError={(error) => console.error('Login form error:', error)}>
      <EtherealCard variant="elevated">
        <EtherealCardHeader className="text-center">
          <div className="inline-flex p-3 rounded-full bg-[#B1FA63]/20 mb-4 mx-auto">
            <Mail className="h-6 w-6 text-[#B1FA63]" />
          </div>
          <EtherealCardTitle className="text-3xl">Welcome back</EtherealCardTitle>
          <EtherealCardDescription className="text-base">
            Enter your email to receive a magic link. No password needed!
          </EtherealCardDescription>
        </EtherealCardHeader>
        <EtherealCardContent>
          <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#243837]">
                    Email address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your@charity.org"
                      disabled={isSubmitting}
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  
                  {/* Email suggestion */}
                  {emailSuggestion && emailSuggestion !== emailValue && (
                    <div className="text-sm text-[#616161] mt-1">
                      Did you mean{' '}
                      <button
                        type="button"
                        onClick={() => form.setValue('email', emailSuggestion)}
                        className="text-[#B1FA63] hover:underline"
                      >
                        {emailSuggestion}
                      </button>?
                    </div>
                  )}
                </FormItem>
              )}
            />

            <EtherealButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting || !form.formState.isValid}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending magic link...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Send Magic Link
                </>
              )}
            </EtherealButton>

            <div className="text-center text-sm text-[#616161]">
              <p>
                Don&apos;t have an account?{' '}
                <a href="/login" className="text-[#B1FA63] hover:underline">
                  Start your free trial
                </a>
              </p>
            </div>
          </form>
        </Form>
      </EtherealCardContent>
    </EtherealCard>
    </FormErrorBoundary>
  )
}