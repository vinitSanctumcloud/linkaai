'use client'
import { useEffect, useRef, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Palette, Download, CreditCard, Key, EyeOff, Eye, CheckCircle2, Circle, AlertTriangle, Loader2, UserCircle, Phone, Check, X, Infinity, Shield } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger, AlertDialogAction, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa';
import { format, isValid } from 'date-fns';
import { API } from '@/config/api';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { initializeAuthState } from '@/store/slices/authSlice';

function safeFormatDate(dateInput: string | number | Date, formatString = 'PP') {
  const date = new Date(dateInput);
  if (!isValid(date)) {
    console.error('Invalid date provided:', dateInput);
    return '';
  }
  try {
    return format(date, formatString);
  } catch (e) {
    console.error(`Error formatting date: ${e}`);
    return '';
  }
}

// === INTERFACES ===
interface Settings {
  id: string;
  agentName: string;
  brandColor: string;
  voiceEnabled: boolean;
  customUrl?: string;
  welcomeMessage?: string;
  instructions?: string;
  avatarUrl?: string;
  chatLimit?: number;
}

interface Subscription {
  subscription_status: string;
  subscription_type: string;
  start_date: number;
  current_period_end: number;
  subscription_platform: string;
  hosted_invoice_url: string;
  currency: {
    currency_symbol: string;
  };
  plan: {
    amount: number;
    interval: string;
  };
  product: {
    product_name: string;
  };
}

interface PaymentMethodResponse {
  payment_method_id: string;
  brand: string;
  last_4: string;
  expiry_month: number;
  expiry_year: number;
}

interface TokenInfo {
  products: any;
  totalTokenPurchase: number;
  tokenBalance: number;
  isActiveMember: boolean;
}

interface Currency {
  id: number;
  currency_code: string;
  currency_name: string;
  currency_symbol: string;
  smallest_unit: number;
}

interface TokenPlan {
  id: number;
  stripePriceId: string | null;
  amount: number;
  token: number;
  tokenText: string;
  shortDescription: string | null;
  longDescription: string | null;
  isDefault: boolean;
  currency: Currency;
}

interface SubscriptionHistory {
  payment_id: number;
  created_at: string;
  period_start: string;
  period_end: string;
  stripe_invoice_id: string;
  amount_paid: number;
  pdf_url: string;
  type: string;
}

interface Meta {
  total: number;
  limit: number;
  has_next: boolean;
  current_page: number;
  next_page_url: string | null;
  previous_page_url: string | null;
}

interface BookingHistoryResponse {
  subscriptions: SubscriptionHistory[];
  meta: Meta;
}

interface PaymentData {
  price_id: number;
  payment_method_id?: string;
}

export default function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { aiAgentData, user } = useSelector((state: RootState) => state.auth);
  const { agent } = useSelector((state: RootState) => state.agents);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    agentName: '',
    brandColor: '#FF6B35',
    voiceEnabled: true,
    customUrl: '',
    welcomeMessage: '',
    instructions: '',
    avatarUrl: '',
    newPassword: '',
    chatLimit: 0,
  });
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState('');
  const [email_verified, setIsEmailVerified] = useState(false);
  const [phone_number_verified, setIsPhoneVerified] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentCardDetails, setPaymentCardDetails] = useState<PaymentMethodResponse | null>(null);
  const [tokendetails, setTokenDetails] = useState<TokenInfo | null>(null);
  const [bookingHistory, setBookingHistory] = useState<BookingHistoryResponse | null>(null);
  const [password_confirmation, setPassword_confirmation] = useState("");
  const [loading, setLoading] = useState(true);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [emailSecurityToken, setEmailSecurityToken] = useState('');
  const [phoneSecurityToken, setPhoneSecurityToken] = useState('');
  const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
  const [showPhoneOtpModal, setShowPhoneOtpModal] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugError, setSlugError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize auth state only once on mount
  useEffect(() => {
    dispatch(initializeAuthState()).then(() => {
      if (agent?.ai_agent_slug) {
        setFormData(prev => ({ ...prev, customUrl: agent.ai_agent_slug }));
      }
    });
  }, [dispatch, agent?.ai_agent_slug]);

  // Sync local states with Redux user state
  useEffect(() => {
    if (user) {
      const userEmail = user.email || '';
      const userPhone = user.phone_number || '';
      const userEmailVerified = user.email_verified || false;
      const userPhoneVerified = user.phone_number_verified || false;

      // Only update states if they differ to prevent infinite loop
      if (
        email !== userEmail ||
        phone !== userPhone ||
        email_verified !== userEmailVerified ||
        phone_number_verified !== userPhoneVerified
      ) {
        setEmail(userEmail);
        setPhone(userPhone);
        setIsEmailVerified(userEmailVerified);
        setIsPhoneVerified(userPhoneVerified);

        // Update localStorage
        localStorage.setItem('user', JSON.stringify({
          email: userEmail,
          phone_number: userPhone,
          email_verified: userEmailVerified,
          phone_number_verified: userPhoneVerified,
        }));
      }
    } else {
      // Fallback to localStorage if user is not yet loaded
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setEmail(storedUser.email || '');
      setPhone(storedUser.phone_number || '');
      setIsEmailVerified(storedUser.email_verified || false);
      setIsPhoneVerified(storedUser.phone_number_verified || false);
    }
  }, [user, email, phone, email_verified, phone_number_verified]);

   useEffect(() => {
    const checkSlugAvailability = async () => {
      if (formData.customUrl && formData.customUrl !== agent?.ai_agent_slug) {

        console.log(formData.customUrl, "dada")
        setIsCheckingSlug(true);
        setSlugError('');
        try {
          const response = await fetch(API.SLUG_AVAILABILITY(formData.customUrl), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          });

          const data = await response.json();
          console.log(data, "data")
          setIsSlugAvailable(data.data.is_available);
          if (!data.data.is_available) {
            setSlugError('This URL is not available');
          }
        } catch (error) {
          console.error('Error checking slug availability:', error);
          setSlugError('Error checking URL availability');
          setIsSlugAvailable(false);
        } finally {
          setIsCheckingSlug(false);
        }
      } else {
        setIsSlugAvailable(null);
        setSlugError('');
      }
    };

    const debounce = setTimeout(checkSlugAvailability, 500);
    return () => clearTimeout(debounce);
  }, [formData.customUrl, agent?.ai_agent_slug]);

  const handleSave = async () => {
    if (!isSlugAvailable && formData.customUrl !== agent?.ai_agent_slug) {
      toast.error('Please select an available URL', {
        position: "top-right",
        duration: 2000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API.UPDATE_SLUG, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          ai_agent_slug: formData.customUrl
        }),
      });

      if (response.ok) {
        toast.success('Agent URL updated successfully!', {
          position: "top-right",
          duration: 2000,
        });
        dispatch(initializeAuthState()); // Refresh auth state to get updated agent data
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update agent URL', {
          position: "top-right",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error updating slug:', error);
      toast.error('An error occurred while updating agent URL.', {
        position: "top-right",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // === API FUNCTIONS ===
  const fetchSubscriptionDetails = async () => {
    try {
      const res = await fetch(API.SUBSCRIPTION_DETIALS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      const data = await res.json();
      return data.data.subscription || null;
    } catch (error) {
      console.error('Failed to fetch subscription details:', error);
      return null;
    }
  };

  const fetchPaymentDetails = async () => {
    try {
      const res = await fetch(API.PAYMENT_METHOD, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      const data = await res.json();
      if (data.message === 'Success.') {
        return {
          payment_method_id: data.data.payment_method.payment_method_id,
          brand: data.data.payment_method.card.brand,
          last_4: data.data.payment_method.card.last_4,
          expiry_month: data.data.payment_method.card.expiry_month,
          expiry_year: data.data.payment_method.card.expiry_year,
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch payment details:', error);
      return null;
    }
  };

  const fetchTokenDetails = async () => {
    try {
      const res = await fetch(API.GET_TOKEN_PLAN, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      const data = await res.json();
      return data.message === 'Success' ? data.data : null;
    } catch (error) {
      console.error('Failed to fetch token details:', error);
      return null;
    }
  };

  const fetchBillingHistory = async (page = 1) => {
    try {
      const res = await fetch(`${API.BILLING_HISTORY}?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      const data = await res.json();
      return data.message === 'Success' ? data.data : null;
    } catch (error) {
      console.error('Failed to fetch billing history:', error);
      return null;
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [subscriptionData, paymentData, tokenData, billingData] = await Promise.all([
          fetchSubscriptionDetails(),
          fetchPaymentDetails(),
          fetchTokenDetails(),
          fetchBillingHistory(),
        ]);

        setSubscription(subscriptionData);
        setPaymentCardDetails(paymentData);
        setTokenDetails(tokenData);
        setBookingHistory(billingData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('An error occurred while fetching data.', {
          position: "top-right",
          duration: 2000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Password strength checker
  useEffect(() => {
    let strength = 0;
    if (formData.newPassword.length >= 8) strength++;
    if (/[A-Z]/.test(formData.newPassword)) strength++;
    if (/[0-9]/.test(formData.newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(formData.newPassword)) strength++;
    setPasswordStrength(strength);
  }, [formData.newPassword]);


  const handleVerifyEmail = async () => {
    if (!newEmail && !email) {
      toast.error('Please enter an email address', {
        position: "top-right",
        duration: 2000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API.VERIFY_EMAIL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          email: newEmail || email,
          verify_via: 'email'
        })
      });
      const data = await response.json();

      if (response.ok) {
        setEmailSecurityToken(data?.data?.otp_token);
        setShowEmailOtpModal(true);
        toast.success('Verification OTP sent to your email!', {
          position: "top-right",
          duration: 2000,
        });
      } else {
        toast.error(data.error || 'Failed to initiate email verification', {
          position: "top-right",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error initiating email verification:', error);
      toast.error('An error occurred while sending email OTP.', {
        position: "top-right",
        duration: 2000,
      });
    }
    setIsLoading(false);
  };

  const handleVerifyPhone = async () => {
    const phoneValue = inputRef.current?.value?.trim();

    if (!phoneValue) {
      toast.error('Please enter a phone number', {
        position: "top-right",
        duration: 2000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API.VERIFY_MOBILE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          country_code: '+91',
          phone_number: phoneValue,
          verify_via: 'phone',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPhone(phoneValue);
        setPhoneSecurityToken(data?.data?.otp_token);
        setShowPhoneOtpModal(true);
        toast.success('Verification OTP sent to your phone!', {
          position: "top-right",
          duration: 2000,
        });
      } else {
        toast.error(data.error || 'Failed to initiate phone verification', {
          position: "top-right",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error initiating phone verification:', error);
      toast.error('An error occurred while sending phone OTP.', {
        position: "top-right",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailOtpSubmit = async () => {
    if (otpEmail.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP', {
        position: "top-right",
        duration: 2000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API.EMAIL_VERIFY_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          otp: otpEmail,
          security_token: emailSecurityToken,
          verify_via: 'email'
        })
      });
      const data = await response.json();

      if (response.ok) {
        setIsEmailVerified(true);
        setShowEmailOtpModal(false);
        setOtpEmail('');
        const updatedEmail = newEmail || email;
        setEmail(updatedEmail);
        localStorage.setItem('user', JSON.stringify({
          email: updatedEmail,
          phone_number: phone,
          email_verified: true,
          phone_number_verified,
        }));
        // Re-initialize auth state to sync with server
        dispatch(initializeAuthState());
        toast.success('Email verified successfully!', {
          position: "top-right",
          duration: 2000,
        });
      } else {
        toast.error(data.error || 'Invalid OTP. Please try again.', {
          position: "top-right",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error verifying email OTP:', error);
      toast.error('An error occurred while verifying email OTP.', {
        position: "top-right",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneOtpSubmit = async () => {
    if (otpPhone.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP', {
        position: "top-right",
        duration: 2000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API.MOBILE_VERIFY_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          otp: otpPhone,
          security_token: phoneSecurityToken,
          verify_via: 'phone'
        })
      });
      const data = await response.json();

      if (response.ok) {
        setIsPhoneVerified(true);
        setShowPhoneOtpModal(false);
        setOtpPhone('');
        localStorage.setItem('user', JSON.stringify({
          email,
          phone_number: phone,
          email_verified,
          phone_number_verified: true,
        }));
        // Re-initialize auth state to sync with server
        dispatch(initializeAuthState());
        toast.success('Phone verified successfully!', {
          position: "top-right",
          duration: 2000,
        });
      } else {
        toast.error(data.error || 'Invalid OTP. Please try again.', {
          position: "top-right",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error verifying phone OTP:', error);
      toast.error('An error occurred while verifying phone OTP.', {
        position: "top-right",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPasswordError('');
    setConfirmPasswordError('');

    if (!currentPassword) {
      setCurrentPasswordError('Current password is required');
      return;
    }
    if (formData.newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }
    if (passwordStrength < 3) {
      setConfirmPasswordError('Password must be at least 8 characters and include an uppercase letter and a number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API.CHANGE_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          old_password: currentPassword,
          password: formData.newPassword,
          password_confirmation,
        }),
      });

      if (response.ok) {
        toast.success('Password updated successfully!', {
          position: "top-right",
          duration: 2000,
        });
        setCurrentPassword('');
        setFormData({ ...formData, newPassword: '' });
        setConfirmPassword('');
        setPasswordStrength(0);
      } else {
        const error = await response.json();
        if (error.error.includes('current password')) {
          setCurrentPasswordError(error.error);
        } else {
          setConfirmPasswordError(error.error || 'Failed to update password');
        }
      }
    } catch (error) {
      setConfirmPasswordError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetTraining = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reset-training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        toast.success('Agent training reset successfully!', {
          position: "top-right",
          duration: 2000,
        });
        const settingsResponse = await fetch('/api/settings', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        if (settingsResponse.ok) {
          const data = await settingsResponse.json();
          setSettings(data);
          setFormData({
            agentName: data.agentName || '',
            brandColor: data.brandColor || '#FF6B35',
            voiceEnabled: data.voiceEnabled ?? true,
            customUrl: data.customUrl || '',
            welcomeMessage: data.welcomeMessage || '',
            instructions: data.instructions || '',
            avatarUrl: data.avatarUrl || '',
            newPassword: '',
            chatLimit: data.chatLimit || 0,
          });
          setAvatarPreview(data.avatarUrl || '');
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to reset agent training', {
          position: "top-right",
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error('An error occurred while resetting agent training.', {
        position: "top-right",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/clear-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        toast.success('Chat history cleared successfully!', {
          position: "top-right",
          duration: 2000,
        });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to clear chat history', {
          position: "top-right",
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error('An error occurred while clearing chat history.', {
        position: "top-right",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        toast.success('Account deletion request sent. You will be logged out.', {
          position: "top-right",
          duration: 2000,
        });
        localStorage.removeItem('user'); // Clear user data on deletion
        window.location.href = '/logout';
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete account', {
          position: "top-right",
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error('An error occurred while deleting account.', {
        position: "top-right",
        duration: 2000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchPage = async (page: number) => {
    setLoading(true);
    const data = await fetchBillingHistory(page);
    if (data) {
      setBookingHistory(data);
    }
    setLoading(false);
  };

  const fetchPreviousPage = () => {
    const prevPage = bookingHistory?.meta?.current_page
      ? bookingHistory.meta.current_page - 1
      : 1;

    if (prevPage >= 1) {
      fetchPage(prevPage);
    }
  };

  const fetchNextPage = () => {
    const nextPage = bookingHistory?.meta?.current_page
      ? bookingHistory.meta.current_page + 1
      : 2;

    fetchPage(nextPage);
  };

  const handlePurchaseTokens = async (priceId: number) => {
    setIsLoading(true);
    console.log(priceId)
    let payload: PaymentData = { price_id: priceId };
    if (paymentCardDetails) {
      payload = { ...payload, payment_method_id: paymentCardDetails?.payment_method_id };
    }

    try {
      const response = await fetch(API.PURCHASE_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Tokens purchased successfully!', {
          position: "top-right",
          duration: 2000,
        });
        const tokenData = await fetchTokenDetails();
        if (tokenData) {
          setTokenDetails(tokenData);
          fetchPage(1);
        }
      } else {
        toast.error(data.error || 'Failed to purchase tokens', {
          position: "top-right",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      toast.error('An error occurred while purchasing tokens. Please try again.', {
        position: "top-right",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://earnlinks.ai';
  const chatUrl = formData.customUrl ? `${baseUrl}/liveagent/${formData.customUrl}` : '';


  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Customize your AI agent and account preferences</p>
          </div>

          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="agent" className="space-y-6">
          <TabsList className="xl:w-fit w-full flex gap-2">
            <TabsTrigger value="agent" className="flex-1 flex items-center justify-center">
              <Palette className="w-5 h-5" />
              <span className="ml-2 hidden md:inline">Agent</span>
            </TabsTrigger>

            <TabsTrigger value="account" className="flex-1 flex items-center justify-center">
              <UserCircle className="w-5 h-5" />
              <span className="ml-2 hidden md:inline">Account</span>
            </TabsTrigger>

            <TabsTrigger value="subscription" className="flex-1 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
              <span className="ml-2 hidden md:inline">Subscription</span>
            </TabsTrigger>

            <TabsTrigger value="verification" className="flex-1 flex items-center justify-center">
              <Phone className="w-5 h-5" />
              <span className="ml-2 hidden md:inline">Phone & Email</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verification" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Email Verification</CardTitle>
                  <CardDescription>Manage and verify your email address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">{email || 'No email provided'}</p>
                    <span className={`text-sm font-medium ${email_verified ? 'text-green-600' : 'text-red-600'}`}>
                      {email_verified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    {!email_verified && (
                      <>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="max-w-xs border px-2 py-1 rounded"
                        />
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={handleVerifyEmail}
                          disabled={isLoading || (!newEmail && !email)}
                        >
                          {isLoading ? 'Sending...' : 'Verify Now'}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Phone Verification</CardTitle>
                  <CardDescription>Manage and verify your phone number</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">{phone || 'No phone number provided'}</p>
                    <span className={`text-sm font-medium ${phone_number_verified ? 'text-green-600' : 'text-red-600'}`}>
                      {phone_number_verified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    {!phone_number_verified && (
                      <>
                        <Input
                          type="tel"
                          placeholder="Enter phone number"
                          ref={inputRef}
                          className="max-w-xs border px-2 py-1 rounded"
                        />
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={handleVerifyPhone}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Sending...' : 'Verify Now'}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Email OTP Modal */}
            {showEmailOtpModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="border-0 shadow-lg w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Verify Email</CardTitle>
                    <CardDescription>Enter the 6-digit OTP sent to your email</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="otpEmail">OTP</Label>
                      <Input
                        id="otpEmail"
                        type="text"
                        value={otpEmail}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtpEmail(value);
                        }}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        className="text-center tracking-widest"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowEmailOtpModal(false);
                          setOtpEmail('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleEmailOtpSubmit}
                        disabled={isLoading || otpEmail.length !== 6}
                      >
                        {isLoading ? 'Verifying...' : 'Verify'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Phone OTP Modal */}
            {showPhoneOtpModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="border-0 shadow-lg w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Verify Phone</CardTitle>
                    <CardDescription>Enter the 6-digit OTP sent to your phone</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="otpPhone">OTP</Label>
                      <Input
                        id="otpPhone"
                        type="text"
                        value={otpPhone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtpPhone(value);
                        }}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        className="text-center tracking-widest"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowPhoneOtpModal(false);
                          setOtpPhone('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handlePhoneOtpSubmit}
                        disabled={isLoading || otpPhone.length !== 6}
                      >
                        {isLoading ? 'Verifying...' : 'Verify'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="subscription" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    Subscription
                    <div
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${subscription?.subscription_status
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-600 border-red-200'
                        }`}
                    >
                      {subscription?.subscription_status ? (
                        <>
                          <Check className="w-4 h-4" />
                          Active
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Inactive
                        </>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Plan Name</p>
                        <p className="text-base font-medium text-gray-800">
                          {subscription?.product.product_name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Subscription Type</p>
                        <p className="text-base font-medium text-gray-800 capitalize">
                          {subscription?.subscription_type || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Plan Billing</p>
                        <p className="text-base font-medium text-gray-800">
                          {(subscription?.currency?.currency_symbol || '$') +
                            (subscription?.plan?.amount != null
                              ? (subscription.plan.amount / 100).toFixed(2)
                              : '0.00')}{' '}
                          / {subscription?.plan?.interval || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Start Date</p>
                        <p className="text-base font-medium text-gray-800">
                          {subscription?.start_date
                            ? new Date(subscription.start_date * 1000).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Next Billing</p>
                        <p className="text-base font-medium text-gray-800">
                          {subscription?.current_period_end
                            ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Platform</p>
                        <p className="text-base font-medium text-gray-800">
                          {subscription?.subscription_platform || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <a
                      href={subscription?.hosted_invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center w-full border text-sm border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      View Invoice
                    </a>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg rounded-2xl p-4">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800">Tokens / Credits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-bold text-green-600">{tokendetails?.tokenBalance}</p>
                    <p className="text-lg text-gray-800 font-semibold">/ {tokendetails?.totalTokenPurchase}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${tokendetails?.tokenBalance !== undefined &&
                          tokendetails?.totalTokenPurchase !== undefined &&
                          tokendetails?.totalTokenPurchase > 0
                          ? (tokendetails.tokenBalance / tokendetails.totalTokenPurchase) * 100
                          : 0
                          }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Tokens are used for AI-Agent chat  credits, blog scans and product rec expansion                  
                    </p>
                  <p className="text-sm text-gray-500"> 1 Token = 1 Credit </p>
                </CardContent>
              </Card>
              <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-800">Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Card Brand</p>
                    <div className="flex items-center gap-2">
                      {paymentCardDetails?.brand === 'visa' ? (
                        <FaCcVisa className="h-5 w-5 text-blue-600" />
                      ) : paymentCardDetails?.brand === 'mastercard' ? (
                        <FaCcMastercard className="h-5 w-5 text-red-600" />
                      ) : paymentCardDetails?.brand === 'amex' ? (
                        <FaCcAmex className="h-5 w-5 text-blue-500" />
                      ) : (
                        <CreditCard className="h-4 w-4 text-gray-400" />
                      )}
                      <p className="text-base font-medium text-gray-800 capitalize">
                        {paymentCardDetails?.brand
                          ? `${paymentCardDetails.brand.charAt(0).toUpperCase() + paymentCardDetails.brand.slice(1)}`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Card Ending</p>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <p className="text-base font-medium text-gray-800">
                        {paymentCardDetails?.last_4 ? `•••• ${paymentCardDetails.last_4}` : '•••• ••••'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Expires</p>
                    <p className="text-base font-medium text-gray-800">
                      {paymentCardDetails?.expiry_month && paymentCardDetails?.expiry_year
                        ? `${String(paymentCardDetails.expiry_month).padStart(2, '0')}/${String(
                          paymentCardDetails.expiry_year
                        ).slice(-2)}`
                        : 'MM/YY'}
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Update Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="border border-gray-200 rounded-lg shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-800">Purchase More Tokens</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {tokendetails?.products?.plans?.map((plan: TokenPlan, index: number) => {
                    const perToken = (plan.amount / plan.token).toFixed(2);
                    const isPopular = index === 1;

                    return (
                      <div
                        key={plan.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-yellow-400 transition-colors relative"
                      >
                        {isPopular && (
                          <div className="absolute top-0 right-0 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                            POPULAR
                          </div>
                        )}
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-gray-800">{plan.token} Tokens</h3>
                          <p className="text-sm text-gray-500">{plan.shortDescription || 'Ideal plan'}</p>
                          <p className="text-xl font-bold text-gray-900">
                            {plan.currency?.currency_symbol || '$'}
                            {plan.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">${perToken} per token</p>
                          <Button
                            className="w-full mt-2 bg-yellow-400 hover:bg-yellow-500 text-white"
                            onClick={() => handlePurchaseTokens(plan.id)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="flex items-center">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </div>
                            ) : (
                              'Select'
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-800">Billing History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookingHistory?.subscriptions && bookingHistory.subscriptions.length > 0 ? (
                        bookingHistory.subscriptions.map((item: SubscriptionHistory) => (
                          <tr key={item.payment_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {safeFormatDate(item.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.stripe_invoice_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {`${safeFormatDate(item.period_start)}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              ${(item.amount_paid / 100).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${subscription?.subscription_status
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : 'bg-red-50 text-red-600 border-red-200'
                                  }`}
                              >
                                {subscription?.subscription_status ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4" />
                                    Inactive
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <a href={item.pdf_url} target="_blank" rel="noopener noreferrer">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                              </a>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 bg-gray-50">
                            No bills available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 gap-4">
                  <div className="text-sm text-gray-500">
                    Showing{' '}
                    <span className="font-medium">
                      {(bookingHistory?.meta?.current_page ? bookingHistory.meta.current_page - 1 : 0) *
                        (bookingHistory?.meta?.limit ?? 0) +
                        1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(
                        (bookingHistory?.meta?.current_page ?? 1) * (bookingHistory?.meta?.limit ?? 0),
                        bookingHistory?.meta?.total ?? 0
                      )}
                    </span>{' '}
                    of <span className="font-medium">{bookingHistory?.meta?.total ?? 0}</span> entries
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300"
                      disabled={!bookingHistory?.meta?.previous_page_url}
                      onClick={() => fetchPreviousPage()}
                    >
                      Previous
                    </Button>
                    {Array.from({
                      length: Math.ceil((bookingHistory?.meta?.total ?? 0) / (bookingHistory?.meta?.limit ?? 1)),
                    }).map((_, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className={`border-gray-300 ${bookingHistory?.meta?.current_page === index + 1 ? 'bg-gray-100' : ''}`}
                        onClick={() => fetchPage(index + 1)}
                      >
                        {index + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300"
                      disabled={!bookingHistory?.meta?.has_next}
                      onClick={() => fetchNextPage()}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agent" className="space-y-6">
            <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <CardTitle>Configure Agent</CardTitle>
                <CardDescription>Customize the visual appearance of your AI agent interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="brandColor">Brand Color</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="brandColor"
                        type="color"
                        value={formData.brandColor}
                        onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                        className="w-16 h-10 p-1 border rounded cursor-pointer transition-all duration-300 hover:scale-105"
                      />
                      <Input
                        value={formData.brandColor}
                        onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                        placeholder="#FF6B35"
                        className="flex-1 transition-all duration-300 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      Primary color used for buttons, accents, and interactive elements.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Color Preview</Label>
                    <div
                      className="w-full h-20 rounded-lg border flex items-center justify-center text-white font-medium transition-all duration-500"
                      style={{ backgroundColor: formData.brandColor }}
                    >
                      {formData.agentName || 'AI Assistant'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="customUrl">Custom URL</Label>
                      <span className="text-xs text-gray-500">Only lowercase letters and numbers</span>
                    </div>

                    <div className="flex items-center relative">
                      {/* Static base URL part */}
                      <div className="flex items-center bg-gray-50 px-3 py-2 border border-gray-300 rounded-l-md text-sm text-gray-600">
                        {baseUrl}/liveagent/
                      </div>

                      {/* Editable part with visual emphasis */}
                      <div className="relative flex-1">
                        <Input
                          id="customUrl"
                          type="text"
                          value={formData.customUrl}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customUrl: e.target.value.toLowerCase().replace(/[^a-zA-Z0-9-]/g, ''),
                            })
                          }
                          // placeholder="yourname"
                          className="w-full pl-3 pr-10 py-2 border-l-0 rounded-l-none border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                          style={{
                            backgroundColor: formData.customUrl ? '#FFF5F0' : 'white',
                            borderColor: formData.customUrl ? '#FFD1B8' : '#D1D5DB',
                            boxShadow: formData.customUrl ? '0 0 0 1px #FFD1B8' : 'none'
                          }}
                        />

                        {/* Edit indicator label */}
                        {!formData.customUrl && (
                          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 text-sm">edit here</span>
                          </div>
                        )}

                        {/* Status icons */}
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {isCheckingSlug && (
                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                          )}
                          {isSlugAvailable === true && !isCheckingSlug && (
                            <Check className="h-5 w-5 text-green-500" />
                          )}
                          {isSlugAvailable === false && !isCheckingSlug && (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Validation messages */}
                    {slugError && (
                      <p className="text-sm text-red-500 flex items-center mt-1">
                        <X className="h-4 w-4 mr-1" /> {slugError}
                      </p>
                    )}

                    {chatUrl && isSlugAvailable && (
                      <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-200">
                        <p className="text-sm text-gray-700 flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                          <span>Your live agent URL is ready:</span>
                          <span className="font-medium text-orange-600 ml-1 underline">{chatUrl}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chatLimit">Limit Visitor Chat Sessions</Label>
                    <div className="relative">
                      <Input
                        id="chatLimit"
                        type="number"
                        value={formData.chatLimit}
                        onChange={(e) =>
                          setFormData({ ...formData, chatLimit: parseInt(e.target.value) || 0 })
                        }
                        placeholder="e.g. 5"
                        className="w-full transition-all duration-300 focus:ring-2 focus:ring-orange-500"
                        min={0}
                      />
                      {formData.chatLimit > 0 && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Check className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {formData.chatLimit > 0 ? (
                        <span className="flex items-center">
                          <Shield className="h-4 w-4 mr-1 text-orange-500" />
                          Visitors limited to {formData.chatLimit} chat session{formData.chatLimit !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Infinity className="h-4 w-4 mr-1 text-gray-400" />
                          No limit on visitor chat sessions
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Manage your account details and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-medium text-orange-900 mb-2">Account Features</h3>
                  <div className="space-y-2 text-sm text-orange-700">
                    <div className="flex items-center justify-between">
                      <span>Unlimited affiliate links</span>
                      <span className="text-green-600 font-medium">✓ Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>AI-powered recommendations</span>
                      <span className="text-green-600 font-medium">✓ Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Custom branding</span>
                      <span className="text-green-600 font-medium">✓ Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Advanced analytics dashboard</span>
                      <span className="text-green-600 font-medium">✓ Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Priority support</span>
                      <span className="text-blue-600 font-medium">Upgrade available</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-2xl p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 rounded-full bg-blue-100 transition-colors duration-200">
                        <Key className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-xl tracking-tight">Password & Security</h3>
                        <p className="text-sm text-gray-600 mt-1">Keep your account secure with a strong password</p>
                      </div>
                    </div>
                    <form className="space-y-6" onSubmit={handlePasswordChange}>
                      <div className="space-y-3">
                        <Label
                          htmlFor="currentPassword"
                          className="text-sm font-medium text-gray-900 flex items-center justify-between"
                        >
                          Current Password
                          {currentPasswordError && (
                            <span className="text-red-500 text-xs font-medium">{currentPasswordError}</span>
                          )}
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrent ? 'text' : 'password'}
                            placeholder="Enter current password"
                            className="pr-10 h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            value={currentPassword}
                            onChange={(e) => {
                              setCurrentPassword(e.target.value);
                              setCurrentPasswordError('');
                            }}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            onClick={() => setShowCurrent(!showCurrent)}
                            aria-label={showCurrent ? 'Hide password' : 'Show password'}
                          >
                            {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="newPassword" className="text-sm font-medium text-gray-900">
                          New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNew ? 'text' : 'password'}
                            placeholder="Create new password (min 8 characters)"
                            className="pr-10 h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            onClick={() => setShowNew(!showNew)}
                            aria-label={showNew ? 'Hide password' : 'Show password'}
                          >
                            {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-3">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 rounded-full transition-colors duration-200 ${passwordStrength >= i ? 'bg-green-500' : 'bg-gray-200'}`}
                            ></div>
                          ))}
                        </div>
                        <ul className="text-xs text-gray-600 space-y-2 mt-3">
                          <li className="flex items-center">
                            {formData.newPassword.length >= 8 ? (
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 mr-2 text-gray-300" />
                            )}
                            At least 8 characters
                          </li>
                          <li className="flex items-center">
                            {/[A-Z]/.test(formData.newPassword) ? (
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 mr-2 text-gray-300" />
                            )}
                            Contains uppercase letter
                          </li>
                          <li className="flex items-center">
                            {/[0-9]/.test(formData.newPassword) ? (
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 mr-2 text-gray-300" />
                            )}
                            Contains number
                          </li>
                          <li className="flex items-center">
                            {/[^A-Za-z0-9]/.test(formData.newPassword) ? (
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 mr-2 text-gray-300" />
                            )}
                            Contains special character
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="confirmPassword"
                          className="text-sm font-medium text-gray-900 flex items-center justify-between"
                        >
                          Confirm New Password
                          {confirmPasswordError && (
                            <span className="text-red-500 text-xs font-medium">{confirmPasswordError}</span>
                          )}
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            className="pr-10 h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              setConfirmPasswordError('');
                              setPassword_confirmation(e.target.value);
                            }}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            onClick={() => setShowConfirm(!showConfirm)}
                            aria-label={showConfirm ? 'Hide password' : 'Show password'}
                          >
                            {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={passwordStrength < 3 || !currentPassword || !confirmPassword}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Updating...
                          </div>
                        ) : (
                          'Update Password'
                        )}
                      </Button>
                    </form>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6 bg-white">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 rounded-full bg-red-50">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-lg">Account Actions</h3>
                        <p className="text-sm text-gray-500">Critical actions with permanent consequences</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Reset Options</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-1">Reset Agent Training</p>
                            <p className="text-sm text-gray-600 mb-2">
                              Clear all custom instructions and reset your AI agent to factory settings.
                            </p>
                            <Button
                              variant="outline"
                              className="w-full border-red-200 text-red-600 hover:bg-red-50"
                              onClick={handleResetTraining}
                              disabled={isLoading}
                            >
                              Reset Training Data
                            </Button>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Clear All History</p>
                            <p className="text-sm text-gray-600 mb-2">
                              Permanently delete your chat history and interaction logs.
                            </p>
                            <Button
                              variant="outline"
                              className="w-full border-red-200 text-red-600 hover:bg-red-50"
                              onClick={handleClearHistory}
                              disabled={isLoading}
                            >
                              Clear History
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Delete Account</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Permanently remove your account and all associated data from our systems. This action is
                          irreversible.
                        </p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full border-red-200 text-red-600 hover:bg-red-50"
                              disabled={isLoading || isDeleting}
                            >
                              Delete My Account
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your account and remove all
                                your data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={handleAccountDeletion}
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <div className="flex items-center">
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                  </div>
                                ) : (
                                  'Delete Account'
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}