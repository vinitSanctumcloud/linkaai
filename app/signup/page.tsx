'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, ArrowLeft, EyeOff, Eye } from 'lucide-react'
import PublicRoute from './../../components/auth/PublicRoute'
import { signup } from '@/store/slices/authSlice' // Import the signup thunk from the auth slice
import { AppDispatch, RootState } from '@/store' // Adjust the path to your store
import { clearError } from '@/store/slices/authSlice'

interface FormData {
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirmation: string
  user_varient: 'CREATOR' | 'BRAND' | ''
  creator_industry: string
  accept_aggrements: boolean
  creator_handle?: string | null
  business_name?: string
}

interface FormErrors {
  [key: string]: string
}

export default function SignupPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector((state: RootState) => state.auth.isLoading)
  const error = useSelector((state: RootState) => state.auth.error)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    user_varient: 'CREATOR',
    creator_industry: 'get_paid_seamlessly',
    accept_aggrements: false,
    creator_handle: '',
    business_name: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateInput = useCallback(() => {
    const newErrors: FormErrors = {}

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Please enter a valid email address'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters'
    if (formData.password !== formData.password_confirmation)
      newErrors.password_confirmation = 'Passwords do not match'
    if (!formData.accept_aggrements)
      newErrors.accept_aggrements = 'You must accept the agreements'
    if (formData.user_varient === 'CREATOR' && !formData.creator_handle?.trim())
      newErrors.creator_handle = 'Creator handle is required'
    if (formData.user_varient === 'BRAND' && !formData.business_name?.trim())
      newErrors.business_name = 'BRAND name is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleChange = useCallback((field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }, [])

  const togglePasswordVisibility = () => setShowPassword(!showPassword)
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateInput()) {
        const errorMessage = Object.values(errors)[0] || 'Please fix the form errors before submitting.'
        toast.error(errorMessage, {
          position: 'top-right',
          duration: 2000,
        })
        return
      }

      try {
        const result = await dispatch(signup(formData)).unwrap()
        toast.success(result.message || 'Account created successfully!')
        router.push('/')
      } catch (error: any) {
        const errorMessage = error || 'An unexpected error occurred during signup. Please try again.'
        toast.error(errorMessage, {
          position: 'top-right',
          duration: 2000,
        })
      }
    },
    [formData, dispatch, router, validateInput, errors]
  )

  // Display error from Redux state if it exists
  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: 'top-right',
        duration: 2000,
      })
      dispatch(clearError())
    }
  }, [error, dispatch])

  return (
    <PublicRoute>
      <style jsx global>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeIn 0.5s ease-out forwards;
          animation-delay: 0.1s;
        }
        @media (prefers-reduced-motion: no-preference) {
          .fade-in {
            animation-play-state: running;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-3xl space-y-6">
          <div className="flex items-center">
            <Link
              href="/"
              className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors duration-200 group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to home</span>
            </Link>
          </div>

          <Card className="border-0 shadow-2xl rounded-xl bg-white/90 backdrop-blur-sm fade-in">
            <CardHeader className="text-center space-y-3 px-6 py-8 sm:px-10 sm:py-10">
              <div className="flex items-center justify-center">
                <img src="./Linklogo.png" alt="Logo" className="h-20 w-auto" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
                Create your account
              </CardTitle>
              <CardDescription className="text-gray-600 text-sm sm:text-base">
                Launch your personalized AI Agent that talks, recommends, and earns for you
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 md:p-8">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6"
                noValidate
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                      First Name
                    </Label>
                    <Input
                      id="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleChange('first_name', e.target.value.trim())}
                      required
                      className={`w-full border-gray-300 transition-colors duration-200 ${errors.first_name ? 'border-red-500' : ''}`}
                      aria-invalid={!!errors.first_name}
                      aria-describedby={errors.first_name ? 'first_name-error' : undefined}
                    />
                    {errors.first_name && (
                      <p id="first_name-error" className="text-xs text-red-600 font-medium">
                        {errors.first_name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                      Last Name
                    </Label>
                    <Input
                      id="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleChange('last_name', e.target.value.trim())}
                      required
                      className={`w-full border-gray-300 transition-colors duration-200 ${errors.last_name ? 'border-red-500' : ''}`}
                      aria-invalid={!!errors.last_name}
                      aria-describedby={errors.last_name ? 'last_name-error' : undefined}
                    />
                    {errors.last_name && (
                      <p id="last_name-error" className="text-xs text-red-600 font-medium">
                        {errors.last_name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value.trim().toLowerCase())}
                    required
                    className={`w-full border-gray-300 transition-colors duration-200 ${errors.email ? 'border-red-500' : ''}`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-xs text-red-600 font-medium">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        required
                        minLength={8}
                        className={`w-full pr-10 border-gray-300 transition-colors duration-200 ${errors.password ? 'border-red-500' : ''}`}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p id="password-error" className="text-xs text-red-600 font-medium">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password_confirmation"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.password_confirmation}
                        onChange={(e) => handleChange('password_confirmation', e.target.value)}
                        required
                        minLength={8}
                        className={`w-full pr-10 border-gray-300 transition-colors duration-200 ${errors.password_confirmation ? 'border-red-500' : ''}`}
                        aria-invalid={!!errors.password_confirmation}
                        aria-describedby={errors.password_confirmation ? 'password_confirmation-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password_confirmation && (
                      <p id="password_confirmation-error" className="text-xs text-red-600 font-medium">
                        {errors.password_confirmation}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <Label className="text-sm font-medium text-gray-700 block">
                    I am a:
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'CREATOR', label: 'Creator' },
                      { value: 'BRAND', label: 'Brand' },
                      { value: '', label: 'Just Exploring' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                          formData.user_varient === option.value
                            ? 'border-orange-300 bg-orange-50 shadow-sm'
                            : 'border-gray-200 hover:border-orange-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="user_varient"
                          value={option.value}
                          checked={formData.user_varient === option.value}
                          onChange={(e) => handleChange('user_varient', e.target.value)}
                          className="h-4 w-4 text-orange-600 border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {(formData.user_varient === 'CREATOR' || formData.user_varient === 'BRAND' || formData.user_varient === '') && (
                  <div className="space-y-3 pt-1">
                    {formData.user_varient === 'CREATOR' && (
                      <div className="mt-3">
                        <Label className="text-sm font-medium text-gray-700 block">
                          Enter Social Media URL
                        </Label>
                        <Input
                          type="text"
                          name="creator_handle"
                          value={formData.creator_handle || ''}
                          onChange={(e) => handleChange('creator_handle', e.target.value)}
                          className={`w-full mt-3 border-gray-300 transition-colors duration-200 ${errors.creator_handle ? 'border-red-500' : ''}`}
                          aria-invalid={!!errors.creator_handle}
                          aria-describedby={errors.creator_handle ? 'creator_handle-error' : undefined}
                        />
                        {errors.creator_handle && (
                          <p id="creator_handle-error" className="text-xs text-red-600 font-medium">
                            {errors.creator_handle}
                          </p>
                        )}
                      </div>
                    )}
                    {formData.user_varient === 'BRAND' && (
                      <div className="mt-3 grid">
                        <Label className="text-sm font-medium text-gray-700 block">
                          Enter Brand name
                        </Label>
                        <Input
                          id="business_name"
                          type="text"
                          value={formData.business_name}
                          onChange={(e) => handleChange('business_name', e.target.value.trim())}
                          className={`w-full mt-3 border-gray-300 transition-colors duration-200 ${errors.business_name ? 'border-red-500' : ''}`}
                          aria-invalid={!!errors.business_name}
                          aria-describedby={errors.business_name ? 'business_name-error' : undefined}
                        />
                        {errors.business_name && (
                          <p id="business_name-error" className="text-xs text-red-600 font-medium">
                            {errors.business_name}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-start space-x-3 pt-2">
                  <input
                    type="checkbox"
                    id="accept_aggrements"
                    checked={formData.accept_aggrements}
                    onChange={(e) => handleChange('accept_aggrements', e.target.checked)}
                    className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded"
                    required
                  />
                  <Label htmlFor="accept_aggrements" className="text-xs sm:text-sm text-gray-600">
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      className="text-orange-600 hover:text-orange-700 underline transition-colors duration-200"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="text-orange-600 hover:text-orange-700 underline transition-colors duration-200"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                  {errors.accept_aggrements && (
                    <p id="accept_aggrements-error" className="text-xs text-red-600 font-medium">
                      {errors.accept_aggrements}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !formData.accept_aggrements}
                  className={`w-full mt-2 py-3 text-sm font-medium text-white rounded-lg transition-all duration-200 ${
                    isLoading || !formData.accept_aggrements
                      ? 'bg-orange-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      Creating account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200 hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicRoute>
  )
}