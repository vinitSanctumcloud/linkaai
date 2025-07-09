// 'use client'

// import { useEffect, useState, useCallback } from 'react'
// import { signIn } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { toast } from 'sonner'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
// import { Loader2, ArrowLeft } from 'lucide-react'
// import ReCAPTCHA from 'react-google-recaptcha'

// import { signup } from '@/services/authService'

// interface FormData {
//   first_name: string
//   last_name: string
//   email: string
//   password: string
//   password_confirmation: string
//   user_varient: 'CREATOR' | 'BUSINESS' | 'NEITHER'
//   creator_industry: string
//   accept_aggrements: boolean
//   creator_handle?: string
//   business_name?: string
// }

// interface FormErrors {
//   [key: string]: string
// }

// export default function SignupPage() {
//   const router = useRouter()
//   const [isLoading, setIsLoading] = useState(false)
//   const [formData, setFormData] = useState<FormData>({
//     first_name: '',
//     last_name: '',
//     email: '',
//     password: '',
//     password_confirmation: '',
//     user_varient: 'CREATOR',
//     creator_industry: 'get_paid_seamlessly',
//     accept_aggrements: false,
//     creator_handle: '',
//     business_name: '',
//   })
//   const [errors, setErrors] = useState<FormErrors>({})

//   const validateInput = useCallback(() => {
//     const newErrors: FormErrors = {}

//     if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
//     if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required'
//     if (!formData.email) newErrors.email = 'Email is required'
//     else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
//       newErrors.email = 'Please enter a valid email address'
//     if (!formData.password) newErrors.password = 'Password is required'
//     else if (formData.password.length < 8)
//       newErrors.password = 'Password must be at least 8 characters'
//     if (formData.password !== formData.password_confirmation)
//       newErrors.password_confirmation = 'Passwords do not match'
//     if (!formData.accept_aggrements) newErrors.accept_aggrements = 'You must accept the agreements'
//     if (formData.user_varient === 'CREATOR' && !formData.creator_handle?.trim())
//       newErrors.creator_handle = 'Creator handle is required'
//     if (formData.user_varient === 'BUSINESS' && !formData.business_name?.trim())
//       newErrors.business_name = 'Business handle is required'


//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }, [formData])

//   const handleChange = useCallback((field: keyof FormData, value: any) => {
//     setFormData((prev) => ({ ...prev, [field]: value }))
//     setErrors((prev) => ({ ...prev, [field]: '' }))
//   }, [])

//   const handleSubmit = useCallback(async (e: { preventDefault: () => void }) => {
//     e.preventDefault();

//     if (!validateInput()) {
//       toast.error('Please fix the form errors before submitting.');
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const result = await signup(formData);
//       console.log('Signup result:', result);

//       if (result.data.access_token) {
//         toast.success(result.message || 'Account created successfully!');
//         router.push('/login');
//       } else {
//         console.warn('Signup response missing access_token:', result);
//         toast.error(result.message || 'Signup failed: No access token received. Please try again.');
//       }
//     } catch (error) {
//       const errorMessage =
//         error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
//           ? error.message
//           : 'An unexpected error occurred during signup. Please try again.';
//       toast.error(errorMessage);
//       console.error('Signup error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [formData, router, validateInput]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
//       <div className="w-full max-w-2xl space-y-6">
//         <div className="flex items-center">
//           <Link
//             href="/"
//             className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors duration-200 group"
//           >
//             <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
//             <span className="text-sm font-medium">Back to home</span>
//           </Link>
//         </div>

//         <Card className="border-0 shadow-lg rounded-xl overflow-hidden bg-white">
//           <CardHeader className="text-center space-y-3 px-6 py-8 sm:px-10 sm:py-10 bg-gradient-to-r from-orange-50 to-orange-100">
//             <div className="flex items-center justify-center">
//               <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
//                 <span className="text-white font-bold text-lg">EL</span>
//               </div>
//               <span className="ml-3 text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">EarnLinks.AI</span>
//             </div>
//             <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
//               Create your account
//             </CardTitle>
//             <CardDescription className="text-gray-600 text-sm sm:text-base">
//               Join thousands of creators and businesses getting paid seamlessly
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="p-4 sm:p-6 md:p-8">
//             <form
//               onSubmit={handleSubmit}
//               className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6"
//               noValidate
//             >
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">
//                     First Name
//                   </Label>
//                   <Input
//                     id="first_name"
//                     type="text"
//                     value={formData.first_name}
//                     onChange={(e) => handleChange('first_name', e.target.value.trim())}
//                     required
//                     className={`w-full ${errors.first_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
//                     aria-invalid={!!errors.first_name}
//                     aria-describedby={errors.first_name ? 'first_name-error' : undefined}
//                   />
//                   {errors.first_name && (
//                     <p id="first_name-error" className="text-xs text-red-600 font-medium">
//                       {errors.first_name}
//                     </p>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">
//                     Last Name
//                   </Label>
//                   <Input
//                     id="last_name"
//                     type="text"
//                     value={formData.last_name}
//                     onChange={(e) => handleChange('last_name', e.target.value.trim())}
//                     required
//                     className={`w-full ${errors.last_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
//                     aria-invalid={!!errors.last_name}
//                     aria-describedby={errors.last_name ? 'last_name-error' : undefined}
//                   />
//                   {errors.last_name && (
//                     <p id="last_name-error" className="text-xs text-red-600 font-medium">
//                       {errors.last_name}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="email" className="text-sm font-medium text-gray-700">
//                   Email
//                 </Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => handleChange('email', e.target.value.trim().toLowerCase())}
//                   required
//                   className={`w-full ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
//                   aria-invalid={!!errors.email}
//                   aria-describedby={errors.email ? 'email-error' : undefined}
//                 />
//                 {errors.email && (
//                   <p id="email-error" className="text-xs text-red-600 font-medium">
//                     {errors.email}
//                   </p>
//                 )}
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="password" className="text-sm font-medium text-gray-700">
//                     Password
//                   </Label>
//                   <Input
//                     id="password"
//                     type="password"
//                     value={formData.password}
//                     onChange={(e) => handleChange('password', e.target.value)}
//                     required
//                     minLength={8}
//                     className={`w-full ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
//                     aria-invalid={!!errors.password}
//                     aria-describedby={errors.password ? 'password-error' : undefined}
//                   />
//                   {errors.password && (
//                     <p id="password-error" className="text-xs text-red-600 font-medium">
//                       {errors.password}
//                     </p>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">
//                     Confirm Password
//                   </Label>
//                   <Input
//                     id="password_confirmation"
//                     type="password"
//                     value={formData.password_confirmation}
//                     onChange={(e) => handleChange('password_confirmation', e.target.value)}
//                     required
//                     minLength={8}
//                     className={`w-full ${errors.password_confirmation ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
//                     aria-invalid={!!errors.password_confirmation}
//                     aria-describedby={errors.password_confirmation ? 'password_confirmation-error' : undefined}
//                   />
//                   {errors.password_confirmation && (
//                     <p id="password_confirmation-error" className="text-xs text-red-600 font-medium">
//                       {errors.password_confirmation}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="space-y-3 pt-1">
//                 <Label className="text-sm font-medium text-gray-700 block">
//                   I am a:
//                 </Label>
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                   {[
//                     { value: 'CREATOR', label: 'Creator' },
//                     { value: 'BUSINESS', label: 'Business/Brand' },
//                     { value: 'NEITHER', label: 'Just Exploring' },
//                   ].map((option) => (
//                     <label
//                       key={option.value}
//                       className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${formData.user_varient === option.value
//                         ? 'border-orange-300 bg-orange-50 shadow-sm'
//                         : 'border-gray-200 hover:border-orange-200'
//                         }`}
//                     >
//                       <input
//                         type="radio"
//                         name="user_varient"
//                         value={option.value}
//                         checked={formData.user_varient === option.value}
//                         onChange={(e) => handleChange('user_varient', e.target.value)}
//                         className="h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"
//                       />
//                       <span className="text-sm font-medium text-gray-700">
//                         {option.label}
//                       </span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {(formData.user_varient === 'CREATOR' || formData.user_varient === 'BUSINESS') && (
//                 <div className="space-y-3 pt-1">
//                   {/* Conditional Text Field */}
//                   {formData.user_varient === 'CREATOR' && (
//                     <div className="mt-3">
//                       <Label className="text-sm font-medium text-gray-700 block">
//                         Enter your Social handle Name
//                       </Label>
//                       <Input
//                         type="text"
//                         name="creator_handle"
//                         value={formData.creator_handle || ''}
//                         onChange={(e) => handleChange('creator_handle', e.target.value)}
//                         required

//                         className={`w-full mt-3 ${errors.creator_handle ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
//                         aria-invalid={!!errors.creator_handle}
//                         aria-describedby={errors.creator_handle ? 'creator_handle -error' : undefined}
//                       />
//                     </div>
//                   )}
//                   {formData.user_varient === 'BUSINESS' && (
//                     <div className="mt-3 grid">
//                       <Label className="text-sm font-medium text-gray-700 block">
//                         Business name
//                       </Label>
//                       <Input
//                         id="business_name"
//                         type="text"
//                         value={formData.business_name}
//                         onChange={(e) => handleChange('business_name', e.target.value.trim())}
//                         required
//                         className={`w-full mt-3 ${errors.business_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
//                         aria-invalid={!!errors.business_name}
//                         aria-describedby={errors.business_name ? 'business_name-error' : undefined}
//                       />
//                       {errors.business_name && (
//                         <p id="business_name-error" className="text-xs text-red-600 font-medium">
//                           {errors.business_name}
//                         </p>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )}

//               <div className="flex items-start space-x-3 pt-2">
//                 <input
//                   type="checkbox"
//                   id="accept_aggrements"
//                   checked={formData.accept_aggrements}
//                   onChange={(e) => handleChange('accept_aggrements', e.target.checked)}
//                   className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
//                   required
//                 />
//                 <Label htmlFor="accept_aggrements" className="text-xs sm:text-sm text-gray-600">
//                   I agree to the{' '}
//                   <Link
//                     href="/terms"
//                     className="text-orange-600 hover:text-orange-700 underline transition-colors duration-200"
//                   >
//                     Terms of Service
//                   </Link>{' '}
//                   and{' '}
//                   <Link
//                     href="/privacy"
//                     className="text-orange-600 hover:text-orange-700 underline transition-colors duration-200"
//                   >
//                     Privacy Policy
//                   </Link>
//                 </Label>
//                 {errors.accept_aggrements && (
//                   <p id="accept_aggrements-error" className="text-xs text-red-600 font-medium">
//                     {errors.accept_aggrements}
//                   </p>
//                 )}
//               </div>

//               <Button
//                 type="submit"
//                 disabled={isLoading || !formData.accept_aggrements}
//                 className={`w-full mt-2 py-3 text-sm font-medium text-white rounded-lg transition-all duration-200 ${isLoading || !formData.accept_aggrements
//                   ? 'bg-orange-300 cursor-not-allowed'
//                   : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg'
//                   }`}
//               >
//                 {isLoading ? (
//                   <div className="flex items-center justify-center">
//                     <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
//                     Creating account...
//                   </div>
//                 ) : (
//                   'Create Account'
//                 )}
//               </Button>
//             </form>

//             <div className="mt-6 text-center text-sm text-gray-600">
//               Already have an account?{' '}
//               <Link
//                 href="/login"
//                 className="text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200 hover:underline"
//               >
//                 Sign in
//               </Link>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }