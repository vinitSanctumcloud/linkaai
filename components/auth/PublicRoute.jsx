'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PublicRoute({ children }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const accessToken = localStorage.getItem('accessToken')

    if (accessToken) {
      // Already logged in, redirect to dashboard
      router.push('/dashboard')
    } else {
      // Not logged in, allow to show login/register
      setIsChecking(false)
    }
  }, [router])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
      </div>
    )
  }

  return <>{children}</>
}
