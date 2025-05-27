import { redirect } from 'next/navigation'
import { LoginForm } from '@/features/auth/components/login-form'
import { Suspense } from 'react'

export default function LoginPage() {
  // Auto-login in dev mode
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_AUTO_LOGIN === 'true') {
    redirect('/api/dev-auto-login')
  }

  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm showDevBypass={true} />
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