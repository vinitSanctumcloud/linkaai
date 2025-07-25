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

// Define stricter type for aiAgentData
interface AiAgentData {
  has_subscription: boolean;
  [key: string]: any;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: 'sanctumcloud4@gmail.com',
    password: 'Sun@1122',
  });
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading, error, accessToken, aiAgentData } = useSelector((state: RootState) => state.auth);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Enforce light theme on mount
  useEffect(() => {
    // Remove dark class from html element
    document.documentElement.classList.remove('dark');
    // Optionally reset theme in localStorage if your app uses it
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
        toast.success('Welcome back!');
        router.push('/dashboard');
      }
      router.refresh();
    }
  }, [aiAgentData, router]);

  // Display error toast and clear error
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const { email, password } = formData;

      // Client-side validation
      if (!email || !password) {
        setError('Please fill in all fields')
        setIsLoading(false)
        toast.error('Please fill in all fields', {
          position: "top-right",
          duration: 2000,
        })
        return
      }

      if (!validateEmail(email)) {
        setError('Please enter a valid email address')
        setIsLoading(false)
        toast.error('Please enter a valid email address', {
          position: "top-right",
          duration: 2000,
        })
        return
      }

      // Dispatch login action
      await dispatch(login({ email, password }));
    },
    [formData, dispatch]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        /* Override dark mode styles */
        html.dark [data-login-page] {
          background: linear-gradient(to bottom right, #fef7e6, #ffffff) !important;
          color: #111827 !important;
        }
        html.dark [data-login-page] .card {
          background: rgba(255, 255, 255, 0.9) !important;
          color: #111827 !important;
        }
      `}</style>
      <div
        data-login-page
        className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4 light"
      >
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
          </div>

          <Card className="card border-0 shadow-2xl bg-white/90 backdrop-blur-sm fade-in">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center">
                <Image src={logo} alt="Logo" width={128} height={32} className="h-auto" priority />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome back</CardTitle>
              <CardDescription className="text-gray-600">Sign in to your account to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="w-full border-gray-300 transition-colors duration-200 bg-white text-gray-900"
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
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
                    className="w-full border-gray-300 transition-colors duration-200 bg-white text-gray-900"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <div className="text-right">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-orange-600 hover:text-orange-700 transition-colors duration-200"
                    >
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
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 rounded-md transition-colors duration-200"
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
                  <Link
                    href="/signup"
                    className="text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
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