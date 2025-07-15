'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './PaymentForm.css'; // Import minimal external CSS for react-datepicker and pseudo-elements

// Initialize Stripe with the Publishable Key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51OGwtdGoz9TIRExtLl3aG7GMO2hiaYjeWLZRudSWvMvL1I1TUWjoe42CqE4RNecJ87ULtVph7hdkaRj4UX2Js4vA00J14Srf5A');

// Dynamically import DatePicker with SSR disabled
const DatePicker = dynamic(() => import('react-datepicker'), { ssr: false });

interface Plan {
    id: string;
    amount: number; // Amount in USD cents
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
        plans: Plan[];
        extra_perks: string[];
        product: Product;
    };
}

interface Coupon {
    code: string;
    discountType: 'percentage' | 'fixed' | 'free_trial' | 'custom';
    discountValue: number; // Percentage (e.g., 10 for 10%) or fixed amount in USD cents
    description?: string; // Optional description from API
    duration?: number; // For free_trial, duration in months
    customDetails?: string; // For custom coupon types
    message?: string; // Error message if invalid
}

const PaymentForm: React.FC = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [cardDetails, setCardDetails] = useState<{
        fullName: string;
    }>({
        fullName: '',
    });
    const [couponCode, setCouponCode] = useState<string>('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [apiData, setApiData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Partial<Record<'fullName' | 'cardDetails', string>>>({});
    const [couponError, setCouponError] = useState<string | null>(null);
    const [couponLoading, setCouponLoading] = useState<boolean>(false);

    // Fetch product data
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('productId');

        const fetchProductData = async () => {
            try {
                setLoading(true);
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    throw new Error('No access token found');
                }
                const response = await fetch(
                    `https://api.tagwell.co/api/v4/ai-agent/billing/products/${productId}/plans`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`,
                        },
                    }
                );
                if (!response.ok) throw new Error('Network response was not ok');
                const data: ApiResponse = await response.json();
                console.log("fetchProductData :: plans :: ", data);
                setApiData(data);
                setSelectedPlan(data.data.plans.find(plan => plan.currency === 'USD') || data.data.plans[0]);
            } catch (err) {
                setError('Failed to fetch product details. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
    }, []);

    const validateForm = (): boolean => {
        const errors: Partial<Record<'fullName' | 'cardDetails', string>> = {};

        if (!cardDetails.fullName.trim()) errors.fullName = 'Full name is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setCardDetails((prev) => ({ ...prev, [name]: value }));
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleApplyCoupon = async (): Promise<void> => {
        if (!couponCode) {
            setCouponError('Please enter a coupon code');
            return;
        }

        setCouponLoading(true);
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('No access token found');
            }
            const response = await fetch('https://api.tagwell.co/api/v4/ai-agent/coupons/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
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
            console.error(err);
        } finally {
            setCouponLoading(false);
        }
    };

    const calculateDiscountedAmount = (amount: number): { discountedAmount: number; discountDescription: string } => {
        if (!appliedCoupon || !selectedPlan) {
            return { discountedAmount: amount, discountDescription: 'No discount applied' };
        }

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
                discountedAmount = amount; // No immediate discount, but trial period applies
                discountDescription = `Free trial for ${appliedCoupon.duration} month${appliedCoupon.duration! > 1 ? 's' : ''}`;
                break;
            case 'custom':
                discountedAmount = amount; // Custom logic handled separately
                discountDescription = appliedCoupon.customDetails || 'Custom discount applied';
                break;
            default:
                discountDescription = 'No discount applied';
        }

        return {
            discountedAmount: Math.max(0, Math.round(discountedAmount)),
            discountDescription,
        };
    };

    const formatPrice = (amount: number): string => {
        const amountInDollars = amount / 100; // Convert cents to dollars
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                currencyDisplay: 'symbol',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(amountInDollars);
        } catch (err) {
            console.error('Error formatting price:', err);
            return `$${amountInDollars.toFixed(2)}`;
        }
    };

    // Create Stripe payment method
    const createPaymentMethod = async () => {
        if (!stripe || !elements) {
            setError('Stripe.js has not loaded yet. Please try again.');
            throw new Error('Stripe.js has not loaded yet.');
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            setError('Card element not found. Please refresh the page.');
            throw new Error('Card Element not found');
        }

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
                name: cardDetails.fullName || 'Unknown',
            }
        });

        if (error) {
            console.error('Stripe error:', error);
            setFormErrors((prev) => ({ ...prev, cardDetails: error.message || 'Invalid card details' }));
            setError(error.message || 'Invalid card details');
            throw new Error(error.message);
        }

        return paymentMethod;
    };

    // Handle subscription API call
    const createSubscription = async (paymentMethodId: string | null) => {
        if (!selectedPlan) {
            setError('No plan selected. Please choose a plan.');
            throw new Error('No plan selected');
        }

        console.log("selectedPlan :: ", selectedPlan);

        const payload = {
            payment_method: paymentMethodId,
            plan_id: selectedPlan.id,
            is_free_trial_enable: appliedCoupon?.discountType === 'free_trial',
        };

        console.log("payload :: ", payload);

        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('No access token found');
            }
            const response = await fetch('https://api.tagwell.co/api/v4/ai-agent/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${accessToken}`,
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            });

            console.log(response);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Subscription creation failed');
            }

            const data = await response.json();
            console.log('Subscription created:', data);
            return data;
        } catch (err: any) {
            setError(`Failed to create subscription: ${err.message}`);
            throw err;
        }
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!validateForm()) return;
        if (!stripe || !elements) {
            setError('Stripe.js has not loaded yet. Please try again.');
            return;
        }
        
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('No access token found');
            }

            setLoading(true);
            setError(null);

            const paymentMethod = await createPaymentMethod();
            console.log("paymentMethod: ", paymentMethod);

            await createSubscription(paymentMethod?.id || null);

            const paymentData = {
                paymentMethod: 'credit-card',
                cardDetails: { fullName: cardDetails.fullName },
                selectedPlan: selectedPlan
                    ? {
                          ...selectedPlan,
                          amount: calculateDiscountedAmount(selectedPlan.amount).discountedAmount,
                      }
                    : null,
                coupon: appliedCoupon,
            };

            const response = await fetch('https://api.tagwell.co/api/v4/ai-agent/billing/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(paymentData),
            });

            if (!response.ok) throw new Error('Payment processing failed');
            console.log('Payment processed:', await response.json());
            alert('Payment processed and subscription created successfully!');
        } catch (err: any) {
            setError(err.message || 'Payment processing failed. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-gray-50 dark:bg-gray-900 py-12 md:py-16 min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                        Complete Your Subscription
                    </h2>

                    {loading && (
                        <div className="flex justify-center items-center mb-8">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-custom-orange"></div>
                        </div>
                    )}
                    {error && (
                        <p className="text-custom-error text-center mb-6 bg-red-50 dark:bg-red-900/50 p-4 rounded-lg">{error}</p>
                    )}

                    {/* Product Details */}
                    {apiData?.data.product && (
                        <div className="mb-10 border-b border-gray-200 dark:border-gray-700 pb-8">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="w-full md:w-1/3">
                                    <img
                                        src={apiData.data.product.image}
                                        alt={apiData.data.product.name}
                                        className="w-full rounded-xl object-cover shadow-md"
                                    />
                                </div>
                                <div className="w-full md:w-2/3">
                                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                        {apiData.data.product.name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                        {apiData.data.product.description}
                                    </p>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                                        What’s Included
                                    </h4>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        {apiData.data.extra_perks.map((perk, index) => (
                                            <li key={index} className="flex items-center gap-3">
                                                <svg
                                                    className="h-5 w-5 text-custom-orange flex-shrink-0"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                                                        clipRule="evenodd"
                                                    />
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
                        <form
                            onSubmit={handleSubmit}
                            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
                        >
                            {/* Coupon Code */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Coupon Code
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => {
                                            setCouponCode(e.target.value);
                                            setCouponError(null);
                                        }}
                                        className="block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-custom-orange focus:ring-custom-orange dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300"
                                        placeholder="Enter coupon code"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        className="px-5 py-3 bg-custom-orange text-white rounded-lg hover:bg-custom-orange-hover transition disabled:opacity-50 text-sm font-medium"
                                        disabled={couponLoading || !couponCode}
                                    >
                                        {couponLoading ? 'Applying...' : 'Apply'}
                                    </button>
                                </div>
                                {couponError && <p className="text-custom-error text-xs mt-1">{couponError}</p>}
                                {appliedCoupon && (
                                    <p className="text-custom-success text-xs mt-1">
                                        Coupon applied: {appliedCoupon.description || calculateDiscountedAmount(selectedPlan?.amount || 0).discountDescription}
                                    </p>
                                )}
                            </div>

                            {/* Credit Card Form */}
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Payment Details
                            </h3>
                            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label
                                        htmlFor="full_name"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        Full Name (as on card)*
                                    </label>
                                    <input
                                        type="text"
                                        id="full_name"
                                        name="fullName"
                                        value={cardDetails.fullName}
                                        onChange={handleInputChange}
                                        className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-custom-orange focus:ring-custom-orange dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 ${formErrors.fullName ? 'border-custom-error shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
                                        placeholder="Bonnie Green"
                                        required
                                    />
                                    {formErrors.fullName && (
                                        <p className="text-custom-error text-xs mt-1">{formErrors.fullName}</p>
                                    )}
                                </div>
                                <div>
                                    <label
                                        htmlFor="card-element"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        Card Details*
                                    </label>
                                    <div className="stripe-card">
                                        <CardElement
                                            id="card-element"
                                            options={{
                                                style: {
                                                    base: {
                                                        fontSize: '14px',
                                                        color: '#374151',
                                                        '::placeholder': {
                                                            color: '#9ca3af',
                                                        },
                                                    },
                                                    invalid: {
                                                        color: '#ef4444',
                                                    },
                                                },
                                                hidePostalCode: true, // Disable ZIP code input
                                            }}
                                            onChange={() => setFormErrors((prev) => ({ ...prev, cardDetails: '' }))}
                                        />
                                    </div>
                                    {formErrors.cardDetails && (
                                        <p className="text-custom-error text-xs mt-1">{formErrors.cardDetails}</p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || couponLoading || !stripe || !elements}
                                className="w-full bg-custom-orange text-white font-medium rounded-lg px-5 py-3.5 text-sm hover:bg-custom-orange-hover focus:outline-none focus:ring-4 focus:ring-custom-orange/50 dark:bg-custom-orange dark:hover:bg-custom-orange-hover dark:focus:ring-custom-orange/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Pay Now'}
                            </button>
                        </form>

                        <div className="lg:col-span-1 mt-8 lg:mt-0">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Subscription Details
                                </h3>
                                <div className="flex flex-wrap gap-3 mb-6">
                                    {apiData?.data.plans.map((plan) => (
                                        <button
                                            key={plan.id}
                                            type="button"
                                            onClick={() => setSelectedPlan(plan)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-transform duration-300 ${selectedPlan?.id === plan.id
                                                ? 'bg-custom-orange text-white'
                                                : 'bg-gray-100 text-gray-900 dark:bg-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-500 hover:-translate-y-0.5'
                                                }`}
                                        >
                                            {plan.interval === 'year' ? 'Yearly' : 'Monthly'} (
                                            {formatPrice(plan.amount)})
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <dl>
                                        <div className="flex items-center justify-between gap-4">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Plan Price
                                            </dt>
                                            <dd className="text-sm font-medium text-gray-900 dark:text-white">
                                                {selectedPlan ? formatPrice(selectedPlan.amount) : formatPrice(0)}
                                            </dd>
                                        </div>

                                        {appliedCoupon && (
                                            <div className="flex items-center justify-between gap-4">
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Coupon Discount
                                                </dt>
                                                <dd className="text-sm font-medium text-green-600 dark:text-green-400">
                                                    -{calculateDiscountedAmount(selectedPlan?.amount || 0).discountDescription}
                                                </dd>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-3 dark:border-gray-600">
                                            <dt className="text-sm font-bold text-gray-900 dark:text-white">
                                                Total
                                            </dt>
                                            <dd className="text-sm font-bold text-gray-900 dark:text-white">
                                                {selectedPlan ? formatPrice(calculateDiscountedAmount(selectedPlan.amount).discountedAmount) : formatPrice(0)}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap justify-center gap-4">
                                <img
                                    className="h-8 w-auto dark:hidden"
                                    src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/visa.svg"
                                    alt="Visa"
                                />
                                <img
                                    className="h-8 w-auto hidden dark:flex"
                                    src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/visa-dark.svg"
                                    alt="Visa"
                                />
                                <img
                                    className="h-8 w-auto dark:hidden"
                                    src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/mastercard.svg"
                                    alt="Mastercard"
                                />
                                <img
                                    className="h-8 w-auto hidden dark:flex"
                                    src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/mastercard-dark.svg"
                                    alt="Mastercard"
                                />
                            </div>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        Payment processed by{' '}
                        <a
                            href="https://stripe.com"
                            className="font-medium text-custom-orange hover:no-underline dark:text-custom-orange"
                        >
                            Stripe
                        </a>{' '}
                        for{' '}
                        <a
                            href="#"
                            className="font-medium text-custom-orange hover:no-underline dark:text-custom-orange"
                        >
                            Flowbite LLC
                        </a>{' '}
                        - United States Of America
                    </p>
                </div>
            </div>
        </section>
    );
};

// Wrap the PaymentForm with Elements provider
const WrappedPaymentForm: React.FC = () => (
    <Elements stripe={stripePromise}>
        <PaymentForm />
    </Elements>
);

export default WrappedPaymentForm;