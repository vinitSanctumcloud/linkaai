'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'
import { login } from '@/services/authService'
import PublicRoute from './../../components/auth/PublicRoute'

interface FormData {
  email: string
  password: string
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formData, setFormData] = useState<FormData>({
    email: 'sanctumcloud4@gmail.com',
    password: '123456789'
  })
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Function to fetch AI agent data
  const fetchAiAgentData = useCallback(async (accessToken: string) => {
    try {
      const response = await fetch('https://api.tagwell.co/api/v4/ai-agent/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch AI agent data')
      }

      const aiAgentData = await response.json()
      localStorage.setItem('aiAgentData', JSON.stringify(aiAgentData))
      console.log('AI Agent Data:', aiAgentData)
      return aiAgentData.data;
    } catch (apiError) {
      console.error('Error fetching AI agent data:', apiError)
      toast.error('Failed to fetch AI agent data. Some features may be limited.')
      return null
    }
  }, [])

  // Check for existing token on mount and refresh AI agent data
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      fetchAiAgentData(accessToken)
    }
  }, [fetchAiAgentData])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setIsLoading(true)
      setError(null)

      const { email, password } = formData

      // Client-side validation
      if (!email || !password) {
        setError('Please fill in all fields')
        setIsLoading(false)
        toast.error('Please fill in all fields')
        return
      }

      if (!validateEmail(email)) {
        setError('Please enter a valid email address')
        setIsLoading(false)
        toast.error('Please enter a valid email address')
        return
      }

      try {
        const result = await login({ email, password })
        console.log(result, 'Login Result')

        if (result?.error) {
          setError(result.error)
          toast.error(result.error || 'Invalid credentials. Please try again.')
          setIsLoading(false)
          return
        }

        if (result?.data) {
          const accessToken = result.data.access_token

          if (!accessToken) {
            toast.error('Authentication failed. Please log in again.')
            router.push('/login')
            setIsLoading(false)
            return
          }

          // Store the access token and user data
          localStorage.setItem('accessToken', accessToken)
          if (result.data.user) {
            localStorage.setItem('user', JSON.stringify(result.data.user))
          }

          // Fetch AI agent data
          const aiAgent = await fetchAiAgentData(accessToken)

          if(!aiAgent.has_subscription) {
            router.push('/pricing')
          } else {
            toast.success('Welcome back!')
            router.push('/dashboard')
          }
          router.refresh()
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [formData, router, fetchAiAgentData]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-orange-600 hover:text-orange-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
          </div>

          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600" />
                <span className="ml-2 text-2xl font-bold text-gray-900">EarnLinks.AI</span>
              </div>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to your account to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <div className="text-right">
                    <Link href="/forgot-password" className="text-sm text-orange-600 hover:text-orange-700">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600" role="alert">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-orange-600 hover:text-orange-700 font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicRoute>
  )
}