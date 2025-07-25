'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'
import { requestVerification } from '@/services/authService'

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        verify_via: ''
    })
    const [errors, setErrors] = useState<{ email?: string }>({})

    const router = useRouter()

    const validateInput = () => {
        const newErrors: { email?: string } = {}
        if (!formData.email) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateInput()) {
            return
        }

        setIsLoading(true)

        try {
            const result = await requestVerification({
                verify_via: 'email',
                email: formData.email,
            })
            console.log(result, 'Verification Result')
            if (!result.success) {
                toast.error('Verification failed. Please check your input and try again.', {
                    position: "top-right",
                    duration: 2000,
                })
            } else {
                // ✅ Save OTP token and email to localStorage
                localStorage.setItem('otp_token', result.otp_token)
                localStorage.setItem('otp_email', formData.email)

                toast.success(
                    <div className="flex flex-col gap-1">
                        <span>Verification code sent to your email!</span>
                        <span className="text-sm text-gray-600">Please check your email for the code.</span>
                    </div>,
                    {
                        position: "top-right",
                        duration: 2000,
                    }
                )

                setTimeout(() => {
                    router.push('/reset-password')
                }, 5000)
            }
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred. Please try again.',
                {
                    position: "top-right",
                    duration: 2000,
                }
            )
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-6">
                <div>
                    <Link
                        href="/login"
                        className="inline-flex items-center text-orange-600 hover:text-orange-700"
                        aria-label="Back to login page"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Link>
                </div>

                <Card className="border border-gray-200 shadow-lg rounded-2xl bg-white">
                    <CardHeader className="text-center space-y-2">
                        <div className="flex items-center justify-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600" />
                            <span className="ml-2 text-3xl font-bold text-gray-900">Linka</span>
                        </div>
                        <CardTitle className="text-2xl text-gray-900">Forget Password</CardTitle>
                        <CardDescription className="text-gray-600 text-sm">
                            Please enter your email address. We’ll send a verification code.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                                    Enter Your Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    placeholder="you@example.com"
                                    className={`w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 rounded-md border shadow-sm focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-600'
                                        }`}
                                    aria-invalid={!!errors.email}
                                    aria-describedby={errors.email ? 'email-error' : undefined}
                                />
                                {errors.email && (
                                    <p id="email-error" className="text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-orange-600 hover:bg-orange-700 focus-visible:ring-2 focus-visible:ring-orange-500 text-white font-semibold py-2 rounded-md transition-colors"
                                disabled={isLoading}
                                aria-label="Get OTP"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending Verification...
                                    </>
                                ) : (
                                    'Get OTP'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Remember your password?{' '}
                                <Link
                                    href="/login"
                                    className="text-orange-600 hover:text-orange-700 font-medium"
                                    aria-label="Sign in to your account"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}