'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true) // Track token checking state

  useEffect(() => {
    // Ensure this runs only on the client side
    if (typeof window === 'undefined') return

    const accessToken = localStorage.getItem('accessToken')

    if (!accessToken) {
      // Redirect to login if no valid token
      router.push('/login')
    } else {
      // Token exists, allow rendering children
      setIsChecking(false)
    }
  }, [router]) // Dependency on router for navigation

  // Show a loading state while checking the token
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
      </div>
    )
  }

  // Render children if token is valid
  return <>{children}</>
}