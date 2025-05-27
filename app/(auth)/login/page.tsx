import { LoginForm } from '@/features/auth/components/login-form'
import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}

// Loading skeleton to prevent layout shift
function LoginFormSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[400px] bg-gray-200 rounded-lg"></div>
    </div>
  )
}