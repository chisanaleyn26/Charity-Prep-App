/**
 * Authentication and Authorization Error System
 * 
 * Provides standardized error types for consistent error handling
 * across the application. Each error includes:
 * - Specific error code for programmatic handling
 * - User-friendly message
 * - Technical details for debugging
 * - Suggested actions for resolution
 */

export enum AuthErrorCode {
  // Authentication errors (401)
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Authorization errors (403)
  NO_ORGANIZATION = 'NO_ORGANIZATION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND',
  SUBSCRIPTION_REQUIRED = 'SUBSCRIPTION_REQUIRED',
  SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED',
  
  // State consistency errors
  AUTH_STATE_MISMATCH = 'AUTH_STATE_MISMATCH',
  ORGANIZATION_MISMATCH = 'ORGANIZATION_MISMATCH',
}

export interface AuthErrorDetails {
  code: AuthErrorCode
  message: string
  userMessage: string
  technicalDetails?: Record<string, any>
  suggestedAction?: string
  redirectTo?: string
}

export class AuthError extends Error {
  public readonly code: AuthErrorCode
  public readonly userMessage: string
  public readonly technicalDetails?: Record<string, any>
  public readonly suggestedAction?: string
  public readonly redirectTo?: string
  
  constructor(details: AuthErrorDetails) {
    super(details.message)
    this.name = 'AuthError'
    this.code = details.code
    this.userMessage = details.userMessage
    this.technicalDetails = details.technicalDetails
    this.suggestedAction = details.suggestedAction
    this.redirectTo = details.redirectTo
  }
  
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      suggestedAction: this.suggestedAction,
      redirectTo: this.redirectTo,
    }
  }
}

// Predefined error factories for common scenarios
export const AuthErrors = {
  notAuthenticated: () => new AuthError({
    code: AuthErrorCode.NOT_AUTHENTICATED,
    message: 'User is not authenticated',
    userMessage: 'Please sign in to continue',
    suggestedAction: 'Sign in with your email',
    redirectTo: '/login'
  }),
  
  sessionExpired: () => new AuthError({
    code: AuthErrorCode.SESSION_EXPIRED,
    message: 'Authentication session has expired',
    userMessage: 'Your session has expired. Please sign in again.',
    suggestedAction: 'Sign in again to continue',
    redirectTo: '/login?reason=session_expired'
  }),
  
  noOrganization: (userId: string) => new AuthError({
    code: AuthErrorCode.NO_ORGANIZATION,
    message: 'User has no organization membership',
    userMessage: 'You need to create or join an organization to continue',
    technicalDetails: { userId },
    suggestedAction: 'Create your charity organization',
    redirectTo: '/onboarding'
  }),
  
  organizationNotFound: (orgId: string) => new AuthError({
    code: AuthErrorCode.ORGANIZATION_NOT_FOUND,
    message: `Organization ${orgId} not found or access denied`,
    userMessage: 'The organization could not be found',
    technicalDetails: { organizationId: orgId },
    suggestedAction: 'Return to dashboard',
    redirectTo: '/dashboard'
  }),
  
  insufficientPermissions: (requiredRole: string, currentRole: string) => new AuthError({
    code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
    message: `Insufficient permissions. Required: ${requiredRole}, Current: ${currentRole}`,
    userMessage: 'You don\'t have permission to perform this action',
    technicalDetails: { requiredRole, currentRole },
    suggestedAction: 'Contact your organization administrator',
  }),
  
  subscriptionRequired: (feature: string) => new AuthError({
    code: AuthErrorCode.SUBSCRIPTION_REQUIRED,
    message: `Subscription required for feature: ${feature}`,
    userMessage: 'This feature requires an active subscription',
    technicalDetails: { feature },
    suggestedAction: 'Upgrade your subscription',
    redirectTo: '/settings/billing'
  }),
  
  authStateMismatch: (serverState: any, clientState: any) => new AuthError({
    code: AuthErrorCode.AUTH_STATE_MISMATCH,
    message: 'Authentication state mismatch between server and client',
    userMessage: 'There was a problem with your session. Please refresh the page.',
    technicalDetails: { serverState, clientState },
    suggestedAction: 'Refresh the page',
  }),
}

// Type guard to check if an error is an AuthError
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError
}

// Helper to extract error details for API responses
export function getAuthErrorResponse(error: AuthError): {
  error: {
    code: string
    message: string
    suggestedAction?: string
    redirectTo?: string
  }
  status: number
} {
  const status = error.code.includes('AUTHENTICATED') ? 401 : 403
  
  return {
    error: {
      code: error.code,
      message: error.userMessage,
      suggestedAction: error.suggestedAction,
      redirectTo: error.redirectTo,
    },
    status
  }
}