'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, Sparkles, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { API } from '@/config/api';

interface Plan {
  name: string;
  monthlyPrice: number | string;
  yearlyPrice: number | string;
  standardPerks: string[];
  extra_perks: string[];
  freeTrial: boolean;
  freeTrialDays: number;
  isPopular: boolean;
  trialWithoutCC: boolean;
  product_id: string;
  accountId: string;
  isSubscribed: boolean;
}

interface PlanDetails {
  id: string;
  amount: number;
  interval: string;
  currency: string;
}

interface Product {
  name: string;
  description: string;
  image: string;
  features: string[];
}

interface ApiResponse {
  message: string;
  data: {
    plans: PlanDetails[];
    extra_perks: string[];
    product: Product;
  };
}

interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_trial' | 'custom';
  discountValue: number;
  description?: string;
  duration?: number;
  customDetails?: string;
  message?: string;
}

interface PaymentMethod {
  payment_method_id: string;
  billing_details: {
    name: string | null;
  };
  card: {
    brand: string;
    last_4: string;
    expiry_month: number;
    expiry_year: number;
  };
}

const PaymentForm: React.FC<{
  productId: string;
  freeTrial: boolean;
  trialWithoutCC: boolean;
  accountId: string;
  onClose: () => void;
  setFreeSubscriptionStatus: (status: boolean) => void;
}> = ({ productId, freeTrial, trialWithoutCC, accountId, onClose, setFreeSubscriptionStatus }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardDetails, setCardDetails] = useState({ fullName: '' });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanDetails | null>(null);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<'fullName' | 'cardNumber' | 'cardExpiry' | 'cardCvc', string>>>({});
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [useExistingCard, setUseExistingCard] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) throw new Error('No access token found');

        // Fetch product data
        const productResponse = await fetch(
          API.GET_PLAN(productId),
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
        if (!productResponse.ok) throw new Error('Network response was not ok');
        const data: ApiResponse = await productResponse.json();
        setApiData(data);
        setSelectedPlan(data.data.plans.find(plan => plan.interval === 'year') || data.data.plans[0]);

        // Fetch free subscription status
        const freeTrialResponse = await fetch(API.GET_FREE_TRIAL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!freeTrialResponse.ok) {
          const errorData = await freeTrialResponse.json();
          throw new Error(errorData.message || 'Failed to fetch free trial status');
        }
        const freeTrialData = await freeTrialResponse.json();
        setFreeSubscriptionStatus(freeTrialData.data.allow_platform_free_trial);
        console.log('checkIfFreeSubscripation :: ', freeTrialData);

        // Fetch payment method
        const paymentMethodResponse = await fetch(API.GET_PAYMENT_METHOD, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!paymentMethodResponse.ok) {
          const errorData = await paymentMethodResponse.json();
          throw new Error(errorData.message || 'Failed to fetch payment method');
        }
        const paymentMethodData = await paymentMethodResponse.json();
        if (paymentMethodData.message === 'Success.' && paymentMethodData.data.payment_method) {
          setPaymentMethod(paymentMethodData.data.payment_method);
          setUseExistingCard(true);
          setCardDetails({ fullName: paymentMethodData.data.payment_method.billing_details.name || '' });
        }
      } catch (err) {
        setError('Failed to fetch product details or free trial status. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [productId, setFreeSubscriptionStatus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      setCouponError('Please enter a coupon code');
      return;
    }
    setCouponLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('No access token found');
      const response = await fetch(API.APPLY_COUPON, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify({ promotional_code: couponCode, plan_id: selectedPlan?.id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid coupon code');
      }
      const coupon: Coupon = await response.json();
      if (coupon.message === 'Success') {
        setCouponError(null);
        setAppliedCoupon(coupon);
      } else {
        setAppliedCoupon(null);
        setCouponError(coupon.message || 'Coupon is not valid');
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to apply coupon. Please try again.');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const calculateDiscountedAmount = (amount: number) => {
    if (!appliedCoupon || !selectedPlan) return { discountedAmount: amount, discountDescription: 'No discount applied' };
    let discountedAmount = amount;
    let discountDescription = '';
    switch (appliedCoupon.discountType) {
      case 'percentage': discountedAmount = amount * (1 - appliedCoupon.discountValue / 100); discountDescription = `${appliedCoupon.discountValue}% off`; break;
      case 'fixed': discountedAmount = amount - appliedCoupon.discountValue; discountDescription = formatPrice(appliedCoupon.discountValue); break;
      case 'free_trial': discountedAmount = amount; discountDescription = `Free trial for ${appliedCoupon.duration} month${appliedCoupon.duration! > 1 ? 's' : ''}`; break;
      case 'custom': discountedAmount = amount; discountDescription = appliedCoupon.customDetails || 'Custom discount applied'; break;
      default: discountDescription = 'No discount applied';
    }
    return { discountedAmount: Math.max(0, Math.round(discountedAmount)), discountDescription };
  };

  const formatPrice = (amount: number) => {
    const amountInDollars = amount / 100;
    return `$${amountInDollars.toFixed(2)}`;
  };

  const handleUseExistingCard = () => {
    if (paymentMethod && !useExistingCard) {
      setUseExistingCard(true);
      setCardDetails({ fullName: paymentMethod.billing_details.name || '' });
      // Pre-fill card number with last 4 digits (for display only, actual card number isn't stored)
      // Note: Stripe Elements don't allow pre-filling card numbers, so we clear them
      // const cardNumberElement = elements?.getElement(CardNumberElement);
      // const cardExpiryElement = elements?.getElement(CardExpiryElement);
      // const cardCvcElement = elements?.getElement(CardCvcElement);
      // cardNumberElement?.clear();
      // cardExpiryElement?.clear();
      // cardCvcElement?.clear();
    } else {
      setUseExistingCard(false);
      setCardDetails({ fullName: '' });
      // Clear card elements if switching to new card
      const cardNumberElement = elements?.getElement(CardNumberElement);
      const cardExpiryElement = elements?.getElement(CardExpiryElement);
      const cardCvcElement = elements?.getElement(CardCvcElement);
      cardNumberElement?.clear();
      cardExpiryElement?.clear();
      cardCvcElement?.clear();
    }
  };

  const createPaymentMethod = async () => {
    if (useExistingCard && paymentMethod) {
      return paymentMethod.payment_method_id;
    }
    if (!stripe || !elements) {
      setError('Stripe.js has not loaded yet. Please try again.');
      throw new Error('Stripe.js has not loaded yet.');
    }
    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);
    if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
      setError('Card elements not found. Please refresh the page.');
      throw new Error('Card elements not found');
    }

    const { error, paymentMethod: newPaymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardNumberElement,
      billing_details: { name: cardDetails.fullName || 'Unknown' }
    });
    if (error) {
      setFormErrors(prev => ({ ...prev, cardDetails: error.message || 'Invalid card details' }));
      setError(error.message || 'Invalid card details');
      throw new Error(error.message);
    }
    return newPaymentMethod.id;
  };

  const createSubscription = async (paymentMethodId: string | null) => {
    if (!selectedPlan) {
      setError('No plan selected. Please choose a plan.');
      throw new Error('No plan selected');
    }

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) throw new Error('No access token found');

    const payload = {
      payment_method: paymentMethodId,
      plan_id: selectedPlan.id,
      is_free_trial_enable: appliedCoupon?.discountType === 'free_trial' || trialWithoutCC
    };

    try {
      const response = await fetch(API.SUBSCRIBE_PLAN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Subscription creation failed');
      }
      return await response.json();
    } catch (err: any) {
      setError(`Failed to create subscription: ${err.message}`);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError('Stripe.js has not loaded yet. Please try again.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      let paymentMethodId = null;
      if (!trialWithoutCC) {
        paymentMethodId = await createPaymentMethod();
      }
      await createSubscription(paymentMethodId || null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: { fontSize: '14px', color: '#374151', '::placeholder': { color: '#9ca3af' } },
      invalid: { color: '#ef4444' },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-10 w-full max-w-4xl relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >
        <X className="h-6 w-6" />
      </button>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        Complete Your Subscription
      </h2>

      {loading && (
        <div className="flex justify-center items-center mb-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#f97316]"></div>
        </div>
      )}
      {error && <p className="error-text text-center mb-6 bg-red-50 dark:bg-red-900/50 p-4 rounded-lg">{error}</p>}

      {apiData?.data.product && (
        <div className="mb-10 border-b border-gray-200 dark:border-gray-700 pb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <img src={apiData.data.product.image} alt={apiData.data.product.name} className="w-full rounded-xl object-cover shadow-md" />
            </div>
            <div className="w-full md:w-2/3">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{apiData.data.product.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{apiData.data.product.description}</p>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">What’s Included</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                {apiData.data.extra_perks.map((perk, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-[#f97316]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Coupon Code</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value); setCouponError(null); }}
                className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 ${couponError ? 'error-input' : ''}`}
                placeholder="Enter coupon code"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-5 py-3 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition disabled:opacity-50 text-sm font-medium"
                disabled={couponLoading || !couponCode}
              >
                {couponLoading ? 'Applying...' : 'Apply'}
              </button>
            </div>
            {couponError && <p className="error-text">{couponError}</p>}
            {appliedCoupon && <p className="success-text">Coupon applied: {appliedCoupon.description || calculateDiscountedAmount(selectedPlan?.amount || 0).discountDescription}</p>}
          </div>

          {!trialWithoutCC && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Details</h3>
              {paymentMethod && (
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={useExistingCard}
                      onChange={handleUseExistingCard}
                      className="form-radio text-[#f97316]"
                    />
                    Use existing card ({paymentMethod.card.brand.toUpperCase()} ending in {paymentMethod.card.last_4})
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={!useExistingCard}
                      onChange={() => setUseExistingCard(false)}
                      className="form-radio text-[#f97316]"
                    />
                    Add new card
                  </label>
                </div>
              )}
              {!useExistingCard && (
                <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name (as on card)*</label>
                    <input
                      type="text"
                      id="full_name"
                      name="fullName"
                      value={cardDetails.fullName}
                      onChange={handleInputChange}
                      className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 ${formErrors.fullName ? 'error-input' : ''}`}
                      placeholder="Bonnie Green"
                      required
                    />
                    {formErrors.fullName && <p className="error-text">{formErrors.fullName}</p>}
                  </div>
                  <div>
                    <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card Number*</label>
                    <div className="stripe-card">
                      <CardNumberElement id="card-number" options={cardElementOptions} onChange={() => setFormErrors(prev => ({ ...prev, cardNumber: '' }))} />
                    </div>
                    {formErrors.cardNumber && <p className="error-text">{formErrors.cardNumber}</p>}
                  </div>
                  <div>
                    <label htmlFor="card-expiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiration Date*</label>
                    <div className="stripe-card">
                      <CardExpiryElement id="card-expiry" options={cardElementOptions} onChange={() => setFormErrors(prev => ({ ...prev, cardExpiry: '' }))} />
                    </div>
                    {formErrors.cardExpiry && <p className="error-text">{formErrors.cardExpiry}</p>}
                  </div>
                  <div>
                    <label htmlFor="card-cvc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CVC*</label>
                    <div className="stripe-card">
                      <CardCvcElement id="card-cvc" options={cardElementOptions} onChange={() => setFormErrors(prev => ({ ...prev, cardCvc: '' }))} />
                    </div>
                    {formErrors.cardCvc && <p className="error-text">{formErrors.cardCvc}</p>}
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading || couponLoading || (!trialWithoutCC && (!stripe || !elements && !useExistingCard))}
            className="w-full bg-[#f97316] text-white font-medium rounded-lg px-5 py-3.5 text-sm hover:bg-[#ea580c] focus:outline-none focus:ring-4 focus:ring-[#f97316]/50 dark:bg-[#f97316] dark:hover:bg-[#ea580c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : trialWithoutCC ? 'Start Free Trial' : useExistingCard ? 'Subscribe with Existing Card' : 'Pay Now'}
          </button>
        </form>

        <div className="lg:col-span-1 mt-8 lg:mt-0">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subscription Details</h3>
            <div className="flex flex-wrap gap-3 mb-6">
              {apiData?.data.plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-transform duration-300 ${selectedPlan?.id === plan.id ? 'bg-[#f97316] text-white' : 'bg-gray-100 text-gray-900 dark:bg-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-500 hover:-translate-y-0.5'}`}
                >
                  {plan.interval === 'year' ? 'Yearly' : 'Monthly'} ({formatPrice(plan.amount)})
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <dl>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan Price</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{selectedPlan ? formatPrice(selectedPlan.amount) : formatPrice(0)}</dd>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Coupon Discount</dt>
                    <dd className="text-sm font-medium text-[#10b981] dark:text-[#10b981]">-{calculateDiscountedAmount(selectedPlan?.amount || 0).discountDescription}</dd>
                  </div>
                )}

                {trialWithoutCC && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Trial</dt>
                    <dd className="text-sm font-medium text-[#10b981] dark:text-[#10b981]">No Credit Card Required</dd>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-3 dark:border-gray-600">
                  <dt className="text-sm font-bold text-gray-900 dark:text-white">Total</dt>
                  <dd className="text-sm font-bold text-gray-900 dark:text-white">{selectedPlan && !trialWithoutCC ? formatPrice(calculateDiscountedAmount(selectedPlan.amount).discountedAmount) : 'Free'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {!trialWithoutCC && (
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <img className="h-8 w-auto dark:hidden" src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/visa.svg" alt="Visa" />
              <img className="h-8 w-auto hidden dark:flex" src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/visa-dark.svg" alt="Visa" />
              <img className="h-8 w-auto dark:hidden" src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/mastercard.svg" alt="Mastercard" />
              <img className="h-8 w-auto hidden dark:flex" src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/mastercard-dark.svg" alt="Mastercard" />
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Payment processed by{' '}
        <a href="https://stripe.com" className="font-medium text-[#f97316] hover:no-underline dark:text-[#f97316]">Stripe</a>{' '}
        for{' '}
        <a href="#" className="font-medium text-[#f97316] hover:no-underline dark:text-[#f97316]">Flowbite LLC</a>{' '}
        - United States Of America
      </p>
    </div>
  );
};

// The rest of the PricingPage component remains unchanged
export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState('month');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [freeSubscriptionStatus, setFreeSubscriptionStatus] = useState<boolean | null>(null);
  const [subscriptionMessage, setSubscriptionMessage] = useState<string | null>(null);
  const [subscribedProductId, setSubscribedProductId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setLoading(true);
        // Fetch free trial status
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('No access token found');
        }

        const freeTrialResponse = await fetch(API.GET_FREE_TRIAL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!freeTrialResponse.ok) {
          const errorData = await freeTrialResponse.json();
          throw new Error(errorData.message || 'Failed to fetch free trial status');
        }

        const freeTrialData = await freeTrialResponse.json();
        console.log('Free Trial Data:', freeTrialData);
        setFreeSubscriptionStatus(freeTrialData.data.allow_platform_free_trial);

        // If allow_platform_free_trial is false, store the product_id from free_trial_details
        if (!freeTrialData.data.allow_platform_free_trial && freeTrialData.data.free_trial_details) {
          setSubscribedProductId(freeTrialData.data.free_trial_details.product_id);
          console.log('Subscribed Product ID:', freeTrialData.data.free_trial_details.product_id);
        } else {
          console.log('No subscribed product or free trial is allowed');
        }

        const response = await fetch(API.PLAN_LIST, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pricing data');
        }

        const responseData = await response.json();
        console.log(responseData);

        const processedPlans = responseData.data.products.map((product: any) => ({
          name: product.product_name,
          monthlyPrice: product.plans.find((plan: any) => plan.interval === 'month')?.amount / 100 || 'N/A',
          yearlyPrice: product.plans.find((plan: any) => plan.interval === 'year')?.amount / 100 || 'N/A',
          standardPerks: product.standard_perks || [],
          extra_perks: product.extra_perks || [],
          freeTrial: product.is_free_trial_enable || false,
          freeTrialDays: product.free_trial_days || 0,
          isPopular: product.product_name === 'AI Pro',
          trialWithoutCC: product.trial_without_cc || false,
          product_id: product.product_id,
          accountId: responseData.data.connected_account_id,
          isSubscribed: freeTrialData.data.allow_platform_free_trial == false && freeTrialData.data.free_trial_details?.product_id === product.stripe_id,
        }));

        console.log(processedPlans);
        setPlans(processedPlans);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchPricingData();
  }, []);

  useEffect(() => {
    if (selectedPlan && isModalOpen) {
      const accountId = selectedPlan.accountId;
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        console.error('Stripe publishable key is not defined');
        return;
      }
      setStripePromise(loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, {
        stripeAccount: accountId
      }));
    }
  }, [selectedPlan, isModalOpen]);

  const handlePlanSelect = async (plan: Plan) => {
    // Prevent subscription if the plan is already subscribed
    // if (plan.isSubscribed) {
    //   setSubscriptionMessage('You are already subscribed to this plan. Please contact support to make changes.');
    //   return;
    // }
    try {
      setLoading(true);
      setSubscriptionMessage(null);

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setSubscriptionMessage('No access token found. Please log in and try again.');
        return;
      }

      // // Free trial status is already fetched on page load, so we can use freeSubscriptionStatus
      // if (freeSubscriptionStatus === true) {
      //   setSubscriptionMessage('You are eligible for a free trial.');
      // } else if (freeSubscriptionStatus === false) {
      //   setSubscriptionMessage('You already have an active free subscription or are not eligible. Please cancel it or contact support to proceed.');
      //   return;
      // }

      setSelectedPlan(plan);
      setIsModalOpen(true);
    } catch (err: any) {
      setSubscriptionMessage(err.message || 'Failed to check free trial status. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
    setStripePromise(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button
            asChild
            variant="outline"
            className="inline-flex items-center gap-2 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
              Back
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
              <div className="flex space-x-8">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-80 h-96"></div>
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <p className="text-xl text-red-600 dark:text-red-400 font-medium">Error: {error}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Please try again later or{' '}
                <Link href="/contact" className="text-orange-600 hover:underline font-medium">
                  contact us
                </Link>
                .
              </p>
              <Button
                variant="outline"
                className="mt-4 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <motion.h2
                className="text-4xl font-bold text-gray-900 dark:text-white"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Simple, Transparent Pricing
              </motion.h2>
              <motion.p
                className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Choose the plan that fits your needs. Scale as you grow with no hidden fees.
              </motion.p>
            </div>

            {subscriptionMessage && (
              <div className="p-8 text-center">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <p className="text-xl text-red-600 dark:text-red-400 font-medium">{subscriptionMessage}</p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    <Link href="/contact" className="text-orange-600 hover:underline font-medium">
                      Contact support
                    </Link>{' '}
                    for assistance.
                  </p>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  className={`relative transition-all hover:scale-[1.02] ${plan.isPopular ? 'md:-mt-4' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <Card
                    className={`p-6 rounded-2xl shadow-lg h-full flex flex-col ${plan.isPopular
                      ? 'bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800 border-2 border-orange-500'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                      }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-semibold tracking-wide shadow-md">
                          MOST POPULAR
                        </span>
                      </div>
                    )}
                    {/* {plan.isSubscribed && (
                      <div className="absolute -top-3 right-2">
    <span className="bg-green-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide shadow-md">
      SUBSCRIBED
    </span>
                      </div>
                    )} */}
                    <CardContent className="pt-0 flex flex-col flex-grow">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                        <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {typeof plan.monthlyPrice === 'number' ? `$${plan.monthlyPrice.toFixed(2)}/month` : plan.monthlyPrice} or{' '}
                          {typeof plan.yearlyPrice === 'number' ? `$${plan.yearlyPrice.toFixed(2)}/year` : plan.yearlyPrice}
                        </div>
                        <p className="text-sm text-orange-600 font-medium">
                          Cancel Anytime
                        </p>
                        {plan.freeTrial && billingInterval === 'month' && (
                          <p className="text-sm text-orange-600 font-medium">
                            {plan.freeTrialDays}-day free trial
                            {plan.trialWithoutCC && ' - No Credit Card Required for Trial'}
                          </p>
                        )}
                      </div>
                      <ul className="space-y-3 mb-6 flex-grow">
                        {[...plan.extra_perks].map((perk, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{perk}</span>
                          </li>
                        ))}
                      </ul>
                      {/* {plan.isSubscribed ? (
                        <Button
                          className="w-full py-5 text-base font-medium bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed"
                          disabled
                        >
                          Already Subscribed
                        </Button>
                      ) : (
                        <Button
                          className={`w-full py-5 text-base font-medium ${plan.isPopular
                            ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200 dark:shadow-orange-800/50'
                            : 'bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white'
                            }`}
                          onClick={() => handlePlanSelect(plan)}
                          disabled={loading}
                        >
                          {loading ? 'Checking...' : plan.freeTrial && billingInterval === 'month' ? `${plan.freeTrialDays} Day Trial` : 'Subscribe'}
                        </Button>
                      )} */}
                      <Button
                        className={`w-full py-5 text-base font-medium ${plan.isPopular
                          ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200 dark:shadow-orange-800/50'
                          : 'bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white'
                          }`}
                        onClick={() => handlePlanSelect(plan)}
                        disabled={loading} // Disable button while loading
                      >
                        {loading ? 'Checking...' : plan.freeTrial && billingInterval === 'month' && plan.isSubscribed === false ? `${plan.freeTrialDays} Day Trial` : 'Subscribe'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <motion.div
                className="inline-block bg-white dark:bg-gray-800 rounded-lg shadow-sm px-6 py-4 border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <p className="text-gray-600 dark:text-gray-400">
                  All plans include unlimited affiliate links and 24/7 automated responses
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Need something custom?{' '}
                  <Link href="/contact" className="text-orange-600 hover:underline font-medium">
                    Contact us
                  </Link>{' '}
                  for enterprise solutions.
                </p>
              </motion.div>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && selectedPlan && stripePromise && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="relative w-full max-w-4xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Elements stripe={stripePromise}>
                <PaymentForm
                  productId={selectedPlan.product_id}
                  freeTrial={selectedPlan.freeTrial}
                  trialWithoutCC={selectedPlan.trialWithoutCC}
                  accountId={selectedPlan.accountId}
                  onClose={closeModal}
                  setFreeSubscriptionStatus={setFreeSubscriptionStatus}
                />
              </Elements>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-tooltip::after {
          border-top-color: #f97316;
        }

        .react-datepicker {
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          width: 100%;
          font-family: 'Inter', sans-serif;
        }

        .react-datepicker__header {
          background-color: #f97316;
          color: white;
          border-bottom: none;
          border-radius: 0.5rem 0.5rem 0 0;
          padding: 1rem;
        }

        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #f97316;
          color: white;
        }

        .react-datepicker__day:hover {
          background-color: #ea580c;
          color: white;
        }

        .react-datepicker__month-select,
        .react-datepicker__year-select {
          background-color: #fff;
          color: #000;
          border-radius: 0.25rem;
          padding: 0.25rem;
          font-size: 0.875rem;
        }

        .error-input {
          border-color: #ef4444 !important;
        }

        .error-text {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .success-text {
          color: #10b981;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .stripe-card {
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.75rem;
          background-color: #ffffff;
        }

        .dark .stripe-card {
          background-color: #1f2937;
          border-color: #4b5563;
        }
      `}</style>
    </div>
  );
}