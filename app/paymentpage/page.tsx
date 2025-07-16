'use client';
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements, CardCvcElement, CardExpiryElement, CardNumberElement } from '@stripe/react-stripe-js';
import './PaymentForm.css'; // Import the provided CSS

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
    stripeAccount: process.env.STRIPE_ACCOUNT_ID!
});

interface Plan {
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
        plans: Plan[];
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

interface InitialFormData {
    name: string;
    email: string;
    phone: string;
    phoneCode: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
}

const PaymentForm: React.FC = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [cardDetails, setCardDetails] = useState({ fullName: '' });
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [apiData, setApiData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Partial<Record<'fullName' | 'cardNumber' | 'cardExpiry' | 'cardCvc' | 'name' | 'email' | 'phone' | 'phoneCode' | 'address' | 'city' | 'country' | 'zipCode', string>>>({});
    const [couponError, setCouponError] = useState<string | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [initialFormData, setInitialFormData] = useState<InitialFormData>({
        name: '',
        email: '',
        phone: '',
        phoneCode: '',
        address: '',
        city: '',
        country: '',
        zipCode: '',
    });

    const handleContinue = () => {
        if (validateInitialForm()) {
            setShowPaymentForm(true);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('productId');

        const fetchProductData = async () => {
            try {
                setLoading(true);
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) throw new Error('No access token found');
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
                setApiData(data);
                setSelectedPlan(data.data.plans.find(plan => plan.currency === 'USD') || data.data.plans[0]);
            } catch (err) {
                setError('Failed to fetch product details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
    }, []);

    const validateInitialForm = (): boolean => {
        const errors: Partial<Record<'name' | 'email' | 'phone' | 'phoneCode' | 'address' | 'city' | 'country' | 'zipCode', string>> = {};
        if (!initialFormData.name.trim()) errors.name = 'Name is required';
        if (!initialFormData.email.trim()) errors.email = 'Email is required';
        if (!initialFormData.phone.trim()) errors.phone = 'Phone is required';
        if (!initialFormData.phoneCode.trim()) errors.phoneCode = 'Phone code is required';
        if (!initialFormData.address.trim()) errors.address = 'Address is required';
        if (!initialFormData.city.trim()) errors.city = 'City is required';
        if (!initialFormData.country.trim()) errors.country = 'Country is required';
        if (!initialFormData.zipCode.trim()) errors.zipCode = 'Zip Code is required';
        setFormErrors(prev => ({ ...prev, ...errors }));
        return Object.keys(errors).length === 0;
    };

    const handleInitialInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInitialFormData(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

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
            const response = await fetch('https://api.tagwell.co/api/v4/ai-agent/coupons/apply', {
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

    const createPaymentMethod = async () => {
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
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardNumberElement,
            billing_details: { name: cardDetails.fullName || 'Unknown' }
        });
        if (error) {
            setFormErrors(prev => ({ ...prev, cardDetails: error.message || 'Invalid card details' }));
            setError(error.message || 'Invalid card details');
            throw new Error(error.message);
        }
        return paymentMethod;
    };

    const createSubscription = async (paymentMethodId: string | null) => {
        if (!selectedPlan) {
            setError('No plan selected. Please choose a plan.');
            throw new Error('No plan selected');
        }
        const payload = { payment_method: paymentMethodId, plan_id: selectedPlan.id, is_free_trial_enable: appliedCoupon?.discountType === 'free_trial' };
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) throw new Error('No access token found');
            const response = await fetch('https://api.tagwell.co/api/v4/ai-agent/subscribe', {
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
        if (!validateInitialForm()) return;
        if (!stripe || !elements) {
            setError('Stripe.js has not loaded yet. Please try again.');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const paymentMethod = await createPaymentMethod();
            await createSubscription(paymentMethod?.id || null);
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

    if (!showPaymentForm) {
        return (
            <section className="bg-gray-50 py-12 md:py-16 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-xl p-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Active Plan</h2>
                        {loading && (
                            <div className="flex justify-center items-center mb-6">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#f97316]"></div>
                            </div>
                        )}
                        {error && <p className="error-text bg-red-50 p-4 rounded-lg">{error}</p>}
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={initialFormData.name}
                                    onChange={handleInitialInputChange}
                                    className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] transition-all duration-300 ${formErrors.name ? 'error-input' : ''}`}
                                    placeholder="John Doe"
                                    required
                                />
                                {formErrors.name && <p className="error-text">{formErrors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={initialFormData.email}
                                    onChange={handleInitialInputChange}
                                    className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] transition-all duration-300 ${formErrors.email ? 'error-input' : ''}`}
                                    placeholder="test@gmail.com"
                                    required
                                />
                                {formErrors.email && <p className="error-text">{formErrors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Code</label>
                                <input
                                    type="text"
                                    name="phoneCode"
                                    value={initialFormData.phoneCode}
                                    onChange={handleInitialInputChange}
                                    className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] transition-all duration-300 ${formErrors.phoneCode ? 'error-input' : ''}`}
                                    placeholder="+1"
                                    required
                                />
                                {formErrors.phoneCode && <p className="error-text">{formErrors.phoneCode}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={initialFormData.phone}
                                    onChange={handleInitialInputChange}
                                    className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] transition-all duration-300 ${formErrors.phone ? 'error-input' : ''}`}
                                    placeholder="9876543210"
                                    required
                                />
                                {formErrors.phone && <p className="error-text">{formErrors.phone}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={initialFormData.address}
                                    onChange={handleInitialInputChange}
                                    className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] transition-all duration-300 ${formErrors.address ? 'error-input' : ''}`}
                                    placeholder="123 Main St"
                                    required
                                />
                                {formErrors.address && <p className="error-text">{formErrors.address}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={initialFormData.city}
                                    onChange={handleInitialInputChange}
                                    className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] transition-all duration-300 ${formErrors.city ? 'error-input' : ''}`}
                                    placeholder="Rajkot"
                                    required
                                />
                                {formErrors.city && <p className="error-text">{formErrors.city}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={initialFormData.country}
                                    onChange={handleInitialInputChange}
                                    className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] transition-all duration-300 ${formErrors.country ? 'error-input' : ''}`}
                                    placeholder="India"
                                    required
                                />
                                {formErrors.country && <p className="error-text">{formErrors.country}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={initialFormData.zipCode}
                                    onChange={handleInitialInputChange}
                                    className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] transition-all duration-300 ${formErrors.zipCode ? 'error-input' : ''}`}
                                    placeholder="12345"
                                    required
                                />
                                {formErrors.zipCode && <p className="error-text">{formErrors.zipCode}</p>}
                            </div>
                            <button
                                type="button"
                                onClick={handleContinue}
                                className="w-full bg-[#f97316] text-white font-medium rounded-lg px-5 py-3.5 text-sm hover:bg-[#ea580c] focus:outline-none focus:ring-4 focus:ring-[#f97316]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!initialFormData.name || !initialFormData.email || !initialFormData.phone || !initialFormData.phoneCode || !initialFormData.address || !initialFormData.city || !initialFormData.country || !initialFormData.zipCode}
                            >
                                Continue Free trial registration
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-gray-50 dark:bg-gray-900 py-12 md:py-16 min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-10">
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

                            <button
                                type="submit"
                                disabled={loading || couponLoading || !stripe || !elements}
                                className="w-full bg-[#f97316] text-white font-medium rounded-lg px-5 py-3.5 text-sm hover:bg-[#ea580c] focus:outline-none focus:ring-4 focus:ring-[#f97316]/50 dark:bg-[#f97316] dark:hover:bg-[#ea580c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Pay Now'}
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

                                        <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-3 dark:border-gray-600">
                                            <dt className="text-sm font-bold text-gray-900 dark:text-white">Total</dt>
                                            <dd className="text-sm font-bold text-gray-900 dark:text-white">{selectedPlan ? formatPrice(calculateDiscountedAmount(selectedPlan.amount).discountedAmount) : formatPrice(0)}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap justify-center gap-4">
                                <img className="h-8 w-auto dark:hidden" src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/visa.svg" alt="Visa" />
                                <img className="h-8 w-auto hidden dark:flex" src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/visa-dark.svg" alt="Visa" />
                                <img className="h-8 w-auto dark:hidden" src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/mastercard.svg" alt="Mastercard" />
                                <img className="h-8 w-auto hidden dark:flex" src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/mastercard-dark.svg" alt="Mastercard" />
                            </div>
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
            </div>
        </section>
    );
};

const WrappedPaymentForm: React.FC = () => (
    <Elements stripe={stripePromise}>
        <PaymentForm />
    </Elements>
);

export default WrappedPaymentForm;