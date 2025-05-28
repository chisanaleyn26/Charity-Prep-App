import { Suspense } from 'react'
import { LoginFormOTP } from '@/features/auth/components/login-form-otp'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginFormOTP />
      </Suspense>
    </div>
  )
}

// Loading skeleton to prevent layout shift
function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 animate-pulse">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="text-center space-y-2">
            <div className="inline-block w-16 h-16 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          
          {/* Form skeleton */}
          <div className="space-y-4">
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
          
          {/* Footer skeleton */}
          <div className="h-px bg-gray-200"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
        </div>
      </div>
    </div>
  )
}