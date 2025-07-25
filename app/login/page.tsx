'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { login, fetchAiAgentData, clearError } from '@/store/slices/authSlice';
import PublicRoute from '@/components/auth/PublicRoute';
import { RootState, AppDispatch } from '@/store';
import Image from 'next/image';
import logo from '@/public/Linklogo.png';

// Define FormData interface
interface FormData {
  email: string;
  password: string;
}

// Define Errors interface for form validation
interface Errors {
  email?: string;
  password?: string;
}

// Define stricter type for aiAgentData
interface AiAgentData {
  has_subscription: boolean;
  [key: string]: any;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading, error, accessToken, aiAgentData } = useSelector((state: RootState) => state.auth);

  const validateForm = (): Errors => {
    const newErrors: Errors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Enforce light theme on mount
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  // Fetch AI agent data if accessToken exists on mount
  useEffect(() => {
    if (accessToken && !aiAgentData && !isLoading) {
      dispatch(fetchAiAgentData(accessToken));
    }
  }, [accessToken, aiAgentData, dispatch, isLoading]);

  // Handle redirection based on aiAgentData
  useEffect(() => {
    if (aiAgentData) {
      const typedAiAgentData = aiAgentData as AiAgentData;
      if (!typedAiAgentData.has_subscription) {
        router.push('/pricing');
      } else {
        toast.success('Welcome back!', { position: 'top-right' });
        router.push('/dashboard');
      }
      router.refresh();
    }
  }, [aiAgentData, router]);

  // Display error toast and clear error
  useEffect(() => {
    if (error) {
      toast.error(error, { position: 'top-right', duration: 3000 });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);

      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      setErrors({});
      await dispatch(login(formData));
      setIsSubmitting(false);
    },
    [formData, dispatch]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  return (
    <PublicRoute>
      <style jsx global>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
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
        html.dark [data-login-page] {
          background: linear-gradient(to bottom right, #fef7e6, #ffffff) !important;
          color: #111827 !important;
        }
        html.dark [data-login-page] .card {
          background: rgba(255, 255, 255, 0.95) !important;
          color: #111827 !important;
        }
        .input-error {
          border-color: #ef4444 !important;
        }
        .input-error:focus {
          ring-color: #ef4444 !important;
        }
      `}</style>
      <div
        data-login-page
        className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4 sm:p-6 lg:p-8 light"
        role="main"
        aria-labelledby="login-title"
      >
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-start">
            <Link
              href="/"
              className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors duration-200 text-sm sm:text-base"
              aria-label="Back to home page"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
          </div>

          <Card className="card border-0 shadow-2xl bg-white/95 backdrop-blur-sm fade-in">
            <CardHeader className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <Image src={logo} alt="Company Logo" width={128} height={32} className="h-auto" priority />
              </div>
              <CardTitle id="login-title" className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome back
              </CardTitle>
              <CardDescription className="text-gray-600 text-sm sm:text-base">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6" noValidate aria-describedby="form-error">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full border-gray-300 transition-colors duration-200 bg-white text-gray-900 ${errors.email ? 'input-error' : ''}`}
                    placeholder="Enter your email"
                    disabled={isLoading || isSubmitting}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-sm text-red-600" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className={`w-full border-gray-300 transition-colors duration-200 bg-white text-gray-900 ${errors.password ? 'input-error' : ''}`}
                    placeholder="Enter your password"
                    disabled={isLoading || isSubmitting}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  {errors.password && (
                    <p id="password-error" className="text-sm text-red-600" role="alert">
                      {errors.password}
                    </p>
                  )}
                  <div className="text-right">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-orange-600 hover:text-orange-700 transition-colors duration-200"
                      aria-label="Forgot your password?"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {error && (
                  <p id="form-error" className="text-sm text-red-600" role="alert">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 rounded-md transition-colors duration-200 disabled:opacity-50"
                  disabled={isLoading || isSubmitting}
                  aria-busy={isLoading || isSubmitting}
                >
                  {isLoading || isSubmitting ? (
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
                  <Link
                    href="/signup"
                    className="text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
                    aria-label="Sign up for a new account"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicRoute>
  );
}