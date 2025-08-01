'use client';

import { useEffect, useState } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X } from 'lucide-react';
import { ApiResponse, Coupon, PlanDetails } from './types';
import { applyCoupon, createSubscription, fetchFreeTrialStatus, fetchProductData } from '@/services/pricingService';

interface PaymentFormProps {
  productId: string;
  freeTrial: boolean;
  trialWithoutCC: boolean;
  accountId: string;
  onClose: () => void;
  setFreeSubscriptionStatus: (status: boolean) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  productId,
  freeTrial,
  trialWithoutCC,
  accountId,
  onClose,
  setFreeSubscriptionStatus,
}) => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productData, freeTrialStatus] = await Promise.all([
          fetchProductData(productId),
          fetchFreeTrialStatus(),
        ]);
        setApiData(productData);
        setSelectedPlan(productData.data.plans.find(plan => plan.interval === 'year') || productData.data.plans[0]);
        setFreeSubscriptionStatus(freeTrialStatus);
      } catch (err: any) {
        setError('Failed to fetch product details or free trial status. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      const coupon = await applyCoupon(couponCode, selectedPlan?.id);
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
      case 'percentage':
        discountedAmount = amount * (1 - appliedCoupon.discountValue / 100);
        discountDescription = `${appliedCoupon.discountValue}% off`;
        break;
      case 'fixed':
        discountedAmount = amount - appliedCoupon.discountValue;
        discountDescription = formatPrice(appliedCoupon.discountValue);
        break;
      case 'free_trial':
        discountedAmount = amount;
        discountDescription = `Free trial for ${appliedCoupon.duration} month${appliedCoupon.duration! > 1 ? 's' : ''}`;
        break;
      case 'custom':
        discountedAmount = amount;
        discountDescription = appliedCoupon.customDetails || 'Custom discount applied';
        break;
      default:
        discountDescription = 'No discount applied';
    }
    return { discountedAmount: Math.max(0, Math.round(discountedAmount)), discountDescription };
  };

  const formatPrice = (amount: number) => {
    const amountInDollars = amount / 100;
    return `$${amountInDollars.toFixed(2)}`;
  };

  const createPaymentMethod = async () => {
    if (!stripe || !elements) {
      throw new Error('Stripe.js has not loaded yet.');
    }
    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);
    if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
      setError('Card elements not found. Please refresh the page.');
      throw new Error('Card elements not found');
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardNumberElement,
      billing_details: { name: cardDetails.fullName || 'Unknown' },
    });
    if (error) {
      setFormErrors(prev => ({ ...prev, cardDetails: error.message || 'Invalid card details' }));
      setError(error.message || 'Invalid card details');
      throw new Error(error.message);
    }
    return paymentMethod;
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
      let paymentMethod = null;
      if (!trialWithoutCC) {
        paymentMethod = await createPaymentMethod();
      }
      await createSubscription(paymentMethod?.id || null, selectedPlan?.id || '', appliedCoupon?.discountType === 'free_trial' || trialWithoutCC);
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

      {/* {apiData?.data.product && (
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
      )} */}

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
            </>
          )}

          <button
            type="submit"
            disabled={loading || couponLoading || (!trialWithoutCC && (!stripe || !elements))}
            className="w-full bg-[#f97316] text-white font-medium rounded-lg px-5 py-3.5 text-sm hover:bg-[#ea580c] focus:outline-none focus:ring-4 focus:ring-[#f97316]/50 dark:bg-[#f97316] dark:hover:bg-[#ea580c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : trialWithoutCC ? 'Start Free Trial' : 'Pay Now'}
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

export default PaymentForm;