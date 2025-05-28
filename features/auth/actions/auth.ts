'use server'

import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Validation schemas
const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .toLowerCase()
    .trim()
})

const otpSchema = z.object({
  email: z.string().email(),
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers')
})

// Rate limiting helper
function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMinutes: number = 5): boolean {
  const now = Date.now()
  const window = windowMinutes * 60 * 1000
  
  const record = rateLimitStore.get(identifier)
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + window
    })
    return true
  }
  
  if (record.count >= maxAttempts) {
    return false
  }
  
  record.count++
  return true
}

// Get remaining cooldown time
function getRateLimitCooldown(identifier: string): number {
  const record = rateLimitStore.get(identifier)
  if (!record) return 0
  
  const now = Date.now()
  if (now > record.resetTime) return 0
  
  return Math.ceil((record.resetTime - now) / 1000) // Return seconds
}

/**
 * Send OTP to user's email
 */
export async function sendOTP(data: { email: string }) {
  try {
    // Validate input
    const validated = emailSchema.parse(data)
    const { email } = validated
    
    // Check rate limit
    if (!checkRateLimit(`otp_send_${email}`, 3, 5)) {
      const cooldown = getRateLimitCooldown(`otp_send_${email}`)
      return {
        success: false,
        error: `Too many attempts. Please wait ${Math.ceil(cooldown / 60)} minutes before trying again.`,
        cooldownSeconds: cooldown
      }
    }
    
    
    // Get Supabase client
    const supabase = await createServerClient()
    
    // Send OTP
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // OTP will be valid for 5 minutes
        shouldCreateUser: true,
        emailRedirectTo: undefined // We're using OTP code, not magic link
      }
    })
    
    if (error) {
      console.error('Supabase OTP error:', error)
      
      // Handle specific Supabase errors
      if (error.message.includes('rate limit')) {
        return {
          success: false,
          error: 'Too many requests. Please wait a moment and try again.',
          cooldownSeconds: 60
        }
      }
      
      if (error.message.includes('invalid')) {
        return {
          success: false,
          error: 'Invalid email address. Please check and try again.'
        }
      }
      
      return {
        success: false,
        error: 'Failed to send verification code. Please try again.'
      }
    }
    
    return {
      success: true,
      message: 'Verification code sent to your email'
    }
    
  } catch (error) {
    console.error('Send OTP error:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Invalid email address'
      }
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

/**
 * Verify OTP and sign in user
 */
export async function verifyOTP(data: { email: string; otp: string }) {
  try {
    // Validate input
    const validated = otpSchema.parse(data)
    const { email, otp } = validated
    
    // Check rate limit for verification attempts
    if (!checkRateLimit(`otp_verify_${email}`, 5, 5)) {
      const cooldown = getRateLimitCooldown(`otp_verify_${email}`)
      return {
        success: false,
        error: `Too many verification attempts. Please wait ${Math.ceil(cooldown / 60)} minutes.`,
        cooldownSeconds: cooldown
      }
    }
    
    // Get Supabase client
    const supabase = await createServerClient()
    
    // Verify OTP
    const { data: authData, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    })
    
    if (error) {
      console.error('Verify OTP error:', error)
      
      // Handle specific errors
      if (error.message.includes('expired')) {
        return {
          success: false,
          error: 'Verification code has expired. Please request a new one.'
        }
      }
      
      if (error.message.includes('invalid')) {
        return {
          success: false,
          error: 'Invalid verification code. Please check and try again.'
        }
      }
      
      return {
        success: false,
        error: 'Verification failed. Please try again.'
      }
    }
    
    if (!authData.user) {
      return {
        success: false,
        error: 'Authentication failed. Please try again.'
      }
    }
    
    // Check if user needs onboarding
    const { data: userProfile } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('id', authData.user.id)
      .single()
    
    // Check if user has an organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', authData.user.id)
      .single()
    
    // Clear rate limit on successful login
    rateLimitStore.delete(`otp_send_${email}`)
    rateLimitStore.delete(`otp_verify_${email}`)
    
    // Determine redirect path
    let redirectPath = '/dashboard'
    
    if (!userProfile || !userProfile.full_name) {
      redirectPath = '/onboarding/profile'
    } else if (!membership) {
      redirectPath = '/onboarding/organization'
    }
    
    return {
      success: true,
      redirectPath
    }
    
  } catch (error) {
    console.error('Verify OTP error:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Invalid input'
      }
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

/**
 * Resend OTP with enhanced rate limiting
 */
export async function resendOTP(data: { email: string }) {
  try {
    // Validate input
    const validated = emailSchema.parse(data)
    const { email } = validated
    
    // Check resend-specific rate limit (more restrictive)
    if (!checkRateLimit(`otp_resend_${email}`, 2, 10)) {
      const cooldown = getRateLimitCooldown(`otp_resend_${email}`)
      return {
        success: false,
        error: `Too many resend attempts. Please wait ${Math.ceil(cooldown / 60)} minutes.`,
        cooldownSeconds: cooldown
      }
    }
    
    // Use the sendOTP function with the same logic
    const result = await sendOTP({ email })
    
    if (result.success) {
      return {
        ...result,
        message: 'New verification code sent to your email'
      }
    }
    
    return result
    
  } catch (error) {
    console.error('Resend OTP error:', error)
    
    return {
      success: false,
      error: 'Failed to resend verification code. Please try again.'
    }
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createServerClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Sign out error:', error)
    return {
      success: false,
      error: 'Failed to sign out. Please try again.'
    }
  }
  
  // Clear any cookies
  const cookieStore = await cookies()
  cookieStore.delete('sb-access-token')
  cookieStore.delete('sb-refresh-token')
  
  return {
    success: true,
    redirectPath: '/login'
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const supabase = await createServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return profile
}