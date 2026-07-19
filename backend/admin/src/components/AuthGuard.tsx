'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { LoadingSpinner } from '@/components'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { token, loadToken } = useAuthStore()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    loadToken()
    setIsReady(true)
  }, [loadToken])

  useEffect(() => {
    if (isReady) {
      if (!token && pathname !== '/login') {
        router.push('/login')
      } else if (token && pathname === '/login') {
        router.push('/dashboard')
      }
    }
  }, [isReady, token, pathname, router])

  if (!isReady) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-gray-950">
        <LoadingSpinner className="scale-150" />
      </div>
    )
  }

  // If no token and not on login page, don't render children while redirecting
  if (!token && pathname !== '/login') {
    return null
  }

  // If on login page, render without Sidebar/TopBar
  if (pathname === '/login') {
    return <>{children}</>
  }

  // Render Dashboard layout with Sidebar/TopBar
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
