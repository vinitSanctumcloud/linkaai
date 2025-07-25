'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { resetPassword } from '@/services/authService'

export default function ResetPasswordPage() {
    const [formData, setFormData] = useState({
        password: '',
        password_confirmation: '',
        otp: '',
    })

    const [email, setEmail] = useState('')
    const [otpToken, setOtpToken] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    // ✅ Load email and otp_token from localStorage on mount
    useEffect(() => {
        const storedEmail = localStorage.getItem('otp_email')
        const storedToken = localStorage.getItem('otp_token')

        if (!storedEmail || !storedToken) {
            toast.error('Missing verification data. Please request a new code.', {
                position: "top-right",
                duration: 2000,
            })
            router.push('/forgot-password')
            return
        }

        setEmail(storedEmail)
        setOtpToken(storedToken)
        const timeoutId = setTimeout(() => {
            localStorage.removeItem('otp_email')
            localStorage.removeItem('otp_token')
            toast.info('Verification data has expired. Please request a new code.', {
                position: "top-right",
                duration: 2000,
            })
            router.push('/forgot-password')
        }, 30000) // 60 minutes

        // Cleanup timeout on component unmount
        return () => clearTimeout(timeoutId)
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long', {
                position: "top-right",
                duration: 2000,
            })
            return
        }

        if (formData.password !== formData.password_confirmation) {
            toast.error('Passwords do not match', {
                position: "top-right",
                duration: 2000,
            })
            return
        }

        if (formData.otp.length !== 6) {
            toast.error('Please enter the 6-digit OTP', {
                position: "top-right",
                duration: 2000,
            })
            return
        }

        setIsLoading(true)
        try {
            const result = await resetPassword({
                email,
                otp: formData.otp,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
                security_token: otpToken, // Include the OTP token
                verify_via: 'email', // Assuming email verification
            })
            if (result.success === false) {
                toast.error(result.message || 'Login failed. Please check your credentials and try again.', {
                    position: "top-right",
                    duration: 2000,
                })
            } else {
                localStorage.removeItem('otp_email') // Clear email from localStorage
                localStorage.removeItem('otp_token') // Clear OTP token from localStorage
                toast.success(
                    <div className="flex flex-col gap-1">
                        <span>Reset Password SuccessFull!</span>
                        {/* <span className="text-sm text-gray-600">Welcome back to EarnLinks.AI</span> */}
                    </div>,
                    {
                        position: "top-right",
                        duration: 2000,
                    }
                )
                router.push('/login') // Redirect to dashboard or home page
            }
        } catch (err) {
            toast.error('Something went wrong. Please try again.', {
                position: "top-right",
                duration: 2000,
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-6">
                <Card className="border border-gray-200 shadow-lg rounded-2xl bg-white">
                    <CardHeader className="text-center space-y-2">
                        <div className="flex items-center justify-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600" />
                            <span className="ml-2 text-3xl font-bold text-gray-900">Linka</span>
                        </div>
                        <CardTitle className="text-2xl text-gray-900">Reset Password</CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                            Enter a new password and the 6-digit code sent to your email.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    type="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    type="password"
                                    id="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password_confirmation: e.target.value })
                                    }
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="otp">OTP</Label>
                                <Input
                                    type="text"
                                    id="otp"
                                    value={formData.otp}
                                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                    inputMode="numeric"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-md"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
