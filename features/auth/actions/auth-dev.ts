'use server'

import { z } from 'zod'
import { cookies } from 'next/headers'

// Development mode OTP store (in-memory)
const devOTPStore = new Map<string, { otp: string; expiresAt: number }>()

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

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Development version of sendOTP that works without Supabase
 */
export async function sendOTPDev(data: { email: string }) {
  try {
    // Validate input
    const validated = emailSchema.parse(data)
    const { email } = validated
    
    // Generate OTP
    const otp = generateOTP()
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes
    
    // Store OTP
    devOTPStore.set(email, { otp, expiresAt })
    
    // Log OTP for development
    console.log(`
    ========================================
    🔐 DEVELOPMENT MODE - OTP AUTHENTICATION
    ========================================
    Email: ${email}
    OTP Code: ${otp}
    Expires in: 5 minutes
    ========================================
    In production, this would be sent via email.
    `)
    
    return {
      success: true,
      message: 'Verification code sent (check console)',
      devMode: true,
      devOTP: otp // Only in dev mode for testing
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
 * Development version of verifyOTP
 */
export async function verifyOTPDev(data: { email: string; otp: string }) {
  try {
    // Validate input
    const validated = otpSchema.parse(data)
    const { email, otp } = validated
    
    // Check OTP
    const storedData = devOTPStore.get(email)
    
    if (!storedData) {
      return {
        success: false,
        error: 'No verification code found. Please request a new one.'
      }
    }
    
    if (Date.now() > storedData.expiresAt) {
      devOTPStore.delete(email)
      return {
        success: false,
        error: 'Verification code has expired. Please request a new one.'
      }
    }
    
    if (storedData.otp !== otp) {
      return {
        success: false,
        error: 'Invalid verification code. Please check and try again.'
      }
    }
    
    // Clear OTP
    devOTPStore.delete(email)
    
    // Set dev auth cookie
    const cookieStore = await cookies()
    cookieStore.set('dev-auth-email', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    return {
      success: true,
      redirectPath: '/dashboard'
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
 * Development version of resendOTP
 */
export async function resendOTPDev(data: { email: string }) {
  return sendOTPDev(data)
}

/**
 * Development sign out
 */
export async function signOutDev() {
  const cookieStore = await cookies()
  cookieStore.delete('dev-auth-email')
  
  return {
    success: true,
    redirectPath: '/login'
  }
}