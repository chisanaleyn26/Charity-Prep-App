import { Suspense } from 'react'
import { VerifyMessage } from '@/features/auth/components/verify-message'

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyMessage />
    </Suspense>
  )
}