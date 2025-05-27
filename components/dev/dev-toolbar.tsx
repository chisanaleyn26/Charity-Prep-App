'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface DevToolbarProps {
  user?: {
    email: string
    role: string
  }
}

export function DevToolbar({ user }: DevToolbarProps) {
  const pathname = usePathname()
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-3 rounded-lg shadow-lg z-50 text-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="font-mono">DEV MODE</span>
        </div>
        
        {user && (
          <div className="border-l border-gray-600 pl-4">
            <span className="text-gray-300">{user.email}</span>
            <span className="text-gray-400 ml-2">({user.role})</span>
          </div>
        )}
        
        <div className="border-l border-gray-600 pl-4 flex gap-2">
          <Link 
            href="/api/dev-logout"
            className="text-red-400 hover:text-red-300"
          >
            Logout
          </Link>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        {pathname}
      </div>
    </div>
  )
}