'use server'

import { signOut } from '@/lib/api/auth'

export async function signOutAction() {
  await signOut()
}