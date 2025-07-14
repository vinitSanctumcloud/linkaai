'use client';
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe with the Publishable Key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51OGwtdGoz9TIRExtLl3aG7GMO2hiaYjeWLZRudSWvMvL1I1TUWjoe42CqE4RNecJ87ULtVph7hdkaRj4UX2Js4vA00J14Srf5A');

interface Plan {
    id: string;
    amount: number; // Amount in USD cents
    interval: string;
    currency: string;
}

interface ApiResponse {
    message: string;
    data: {
        plans: Plan[];
        extra_perks: string[];
    };
}

interface ExchangeRateResponse {
    success: boolean;
    base: string;
    date: string;
    rates: Record<string, number>;
}

interface Coupon {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number; // Percentage (e.g., 10 for 10%) or fixed amount in USD cents
    valid: boolean;
}

const currencies = [
    'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN',
    'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL',
    'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'CNY',
    'COP', 'CRC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP',
    'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD',
    'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS',
    'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR',
    'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD',
    'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU',
    'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK',
    'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG',
    'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK',
    'SGD', 'SHP', 'SLL', 'SOS', 'SRD', 'SSP', 'STN', 'SYP', 'SZL', 'THB',
    'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX',
    'USD', 'UYU', 'UZS', 'VES', 'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XOF',
    'XPF', 'YER', 'ZAR', 'ZMW'
].sort();

const PaymentForm: React.FC = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'paypal' | 'bank-transfer'>('credit-card');
    const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({ USD: 1 });
    const [cardDetails, setCardDetails] = useState({
        fullName: '',
    });
    const [paypalEmail, setPaypalEmail] = useState<string>('');
    const [bankDetails, setBankDetails] = useState({
        accountNumber: '',
        routingNumber: '',
        bankName: '',
        accountHolder: '',
    });
    const [couponCode, setCouponCode] = useState<string>('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [apiData, setApiData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [couponError, setCouponError] = useState<string | null>(null);
    const productId = '1637'; // Define product ID

    // Mock coupon database (replace with API call in production)
    const coupons: Coupon[] = [
        { code: 'SAVE10', discountType: 'percentage', discountValue: 10, valid: true },
        { code: 'FLAT50', discountType: 'fixed', discountValue: 5000, valid: true }, // $50 in cents
        { code: 'INVALID', discountType: 'percentage', discountValue: 0, valid: false },
    ];

    // Exponential backoff for API calls
    const fetchWithBackoff = async (url: string, options: RequestInit, retries: number = 3, delay: number = 1000): Promise<Response> => {
        try {
            const response = await fetch(url, options);
            if (response.status === 429 && retries > 0) {
                const retryAfter = response.headers.get('Retry-After');
                const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : delay;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return fetchWithBackoff(url, options, retries - 1, delay * 2);
            }
            return response;
        } catch (err) {
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchWithBackoff(url, options, retries - 1, delay * 2);
            }
            throw err;
        }
    };

    // Fetch exchange rates with caching
    useEffect(() => {
        const cachedRates = localStorage.getItem('exchangeRates');
        const cacheTimestamp = localStorage.getItem('exchangeRatesTimestamp');
        const cacheValidDuration = 24 * 60 * 60 * 1000; // 24 hours

        if (cachedRates && cacheTimestamp && Date.now() - parseInt(cacheTimestamp) < cacheValidDuration) {
            setExchangeRates(JSON.parse(cachedRates));
            return;
        }

        const fetchExchangeRates = async () => {
            try {
                const apiKey = process.env.NEXT_PUBLIC_EXCHANGERATES_API_KEY || '62184da350a23cc1dedff0389915db3e';
                const response = await fetchWithBackoff(
                    `https://api.exchangeratesapi.io/v1/latest?access_key=${apiKey}`,
                    { method: 'GET' }
                );
                if (!response.ok) {
                    const fallbackResponse = await fetchWithBackoff(
                        `https://latest.currency-api.pages.dev/v1/currencies/usd.json`,
                        { method: 'GET' }
                    );
                    const data: ExchangeRateResponse = await fallbackResponse.json();
                    setExchangeRates({ USD: 1, ...data.rates });
                    localStorage.setItem('exchangeRates', JSON.stringify({ USD: 1, ...data.rates }));
                    localStorage.setItem('exchangeRatesTimestamp', Date.now().toString());
                } else {
                    const data: ExchangeRateResponse = await response.json();
                    if (data.success === false) throw new Error('Failed to fetch exchange rates');
                    setExchangeRates({ USD: 1, ...data.rates });
                    localStorage.setItem('exchangeRates', JSON.stringify({ USD: 1, ...data.rates }));
                    localStorage.setItem('exchangeRatesTimestamp', Date.now().toString());
                }
            } catch (err) {
                setError('Failed to fetch exchange rates. Using default USD.');
                console.error(err);
            }
        };
        fetchExchangeRates();
    }, []);

    // Fetch product plans with dynamic product ID
    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);
                const response = await fetchWithBackoff(
                    `https://api.tagwell.co/api/v4/ai-agent/billing/products/${productId}/plans`,
                    {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
                if (!response.ok) throw new Error('Network response was not ok');
                const data: ApiResponse = await response.json();
                console.log(data);
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
    }, [productId]); // Add productId to dependency array

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (paymentMethod === 'credit-card') {
            if (!cardDetails.fullName.trim()) errors.fullName = 'Full name is required';
        } else if (paymentMethod === 'paypal') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail))
                errors.paypalEmail = 'Invalid email address';
        } else if (paymentMethod === 'bank-transfer') {
            if (!bankDetails.accountNumber) errors.accountNumber = 'Account number is required';
            if (!/^\d{9}$/.test(bankDetails.routingNumber))
                errors.routingNumber = 'Invalid routing number (9 digits required)';
            if (!bankDetails.bankName) errors.bankName = 'Bank name is required';
            if (!bankDetails.accountHolder) errors.accountHolder = 'Account holder name is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (paymentMethod === 'credit-card') {
            setCardDetails((prev) => ({ ...prev, [name]: value }));
        } else if (paymentMethod === 'bank-transfer') {
            setBankDetails((prev) => ({ ...prev, [name]: value }));
        }
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleApplyCoupon = () => {
        const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
        if (!coupon) {
            setCouponError('Invalid coupon code');
            setAppliedCoupon(null);
        } else if (!coupon.valid) {
            setCouponError('Coupon is not valid');
            setAppliedCoupon(null);
        } else {
            setAppliedCoupon(coupon);
            setCouponError(null);
        }
    };

    const calculateDiscountedAmount = (amount: number): number => {
        if (!appliedCoupon) return amount;
        let discountedAmount = amount;
        if (appliedCoupon.discountType === 'percentage') {
            discountedAmount = amount * (1 - appliedCoupon.discountValue / 100);
        } else if (appliedCoupon.discountType === 'fixed') {
            discountedAmount = amount - appliedCoupon.discountValue;
        }
        return Math.max(0, Math.round(discountedAmount));
    };

    const convertAmount = (amount: number): number => {
        const rate = exchangeRates[selectedCurrency] || 1;
        const discountedAmount = calculateDiscountedAmount(amount);
        return Math.round((discountedAmount / 100) * rate * 100); // Convert from cents to currency, apply rate, back to cents
    };

    const formatPrice = (amount: number): string => {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: selectedCurrency,
                currencyDisplay: 'symbol',
            }).format(amount / 100);
        } catch (err) {
            console.error('Error formatting price:', err);
            return `${(amount / 100).toFixed(2)} ${selectedCurrency}`;
        }
    };

    // Create Stripe payment method
    const createPaymentMethod = async () => {
        if (!stripe || !elements) {
            setError('Stripe.js has not loaded yet. Please try again.');
            throw new Error('Stripe.js has not loaded yet.');
        }

        if (paymentMethod === 'credit-card') {
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
                },
            });

            if (error) {
                console.error('Stripe error:', error);
                setFormErrors((prev) => ({ ...prev, cardDetails: error.message || 'Invalid card details' }));
                setError(error.message || 'Invalid card details');
                throw new Error(error.message);
            }

            console.log('Payment method created:', paymentMethod);
            return paymentMethod;
        }
        return null; // For PayPal, bank transfer, or free trial
    };

    // Handle subscription API call
    const createSubscription = async (paymentMethodId: string | null) => {
        if (!selectedPlan) {
            setError('No plan selected. Please choose a plan.');
            return;
        }

        const payload = paymentMethodId
            ? {
                  payment_method: paymentMethodId,
                  plan_id: selectedPlan.id,
                  promo: appliedCoupon?.code || null,
                  is_free_trial_enable: false,
              }
            : {
                  payment_method: null,
                  plan_id: selectedPlan.id,
                  promo: appliedCoupon?.code || null,
                  is_free_trial_enable: true,
              };

        console.log("createSubscription :: payload", payload);
        try {
            const response = await fetchWithBackoff(
                'https://api.tagwell.co/api/v4/ai-agent/subscribe',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            console.log(response);

            if (!response.ok) throw new Error('Subscription creation failed');
            const data = await response.json();
            console.log('Subscription created:', data);
            return data;
        } catch (err) {
            setError(`Failed to create subscription: ${(err as Error).message}`);
            throw err;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setLoading(true);
            setError(null);
            let paymentMethodResponse = null;

            if (paymentMethod === 'credit-card') {
                paymentMethodResponse = await createPaymentMethod();
            }

            await createSubscription(paymentMethodResponse?.id || null);

            const paymentData = {
                paymentMethod,
                cardDetails: paymentMethod === 'credit-card' ? cardDetails : undefined,
                paypalEmail: paymentMethod === 'paypal' ? paypalEmail : undefined,
                bankDetails: paymentMethod === 'bank-transfer' ? bankDetails : undefined,
                selectedPlan: selectedPlan
                    ? {
                          ...selectedPlan,
                          amount: convertAmount(selectedPlan.amount),
                          currency: selectedCurrency,
                      }
                    : null,
                coupon: appliedCoupon,
                currency: selectedCurrency,
            };

            console.log('Processing payment:', paymentData);
            alert('Payment processed and subscription created successfully!');
        } catch (err) {
            console.error('Submission error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-gray-100 dark:bg-gray-900 py-8 md:py-12 min-h-screen flex items-center">
            <style>
                {`
                    .custom-tooltip {
                        background-color: #f97316;
                        color: white;
                        border-radius: 0.5rem;
                        padding: 0.5rem;
                        font-size: 0.875rem;
                        z-index: 50;
                    }
                    .custom-tooltip::after {
                        border-top-color: #f97316;
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
                `}
            </style>
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Secure Payment
                    </h2>

                    {loading && (
                        <div className="flex justify-center items-center mb-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#f97316]"></div>
                        </div>
                    )}
                    {error && (
                        <p className="text-red-500 text-center mb-4 bg-red-50 dark:bg-red-900/50 p-3 rounded-lg">{error}</p>
                    )}

                    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                        <form
                            onSubmit={handleSubmit}
                            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
                        >
                            {/* Currency Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Currency
                                </label>
                                <select
                                    value={selectedCurrency}
                                    onChange={(e) => setSelectedCurrency(e.target.value)}
                                    className="block w-full sm:w-64 rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] dark:bg-gray-700 dark:border-gray-600 dark:text-white transition"
                                >
                                    {currencies.map((currency) => (
                                        <option key={currency} value={currency}>
                                            {currency}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Coupon Code */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Coupon Code
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => {
                                            setCouponCode(e.target.value);
                                            setCouponError(null);
                                        }}
                                        className="block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Enter coupon code"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        className="px-4 py-2 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition disabled:opacity-50"
                                        disabled={loading || !couponCode}
                                    >
                                        Apply
                                    </button>
                                </div>
                                {couponError && <p className="error-text">{couponError}</p>}
                                {appliedCoupon && (
                                    <p className="success-text">
                                        Coupon applied: {appliedCoupon.discountType === 'percentage'
                                            ? `${appliedCoupon.discountValue}% off`
                                            : formatPrice(convertAmount(appliedCoupon.discountValue))}
                                    </p>
                                )}
                            </div>

                            {/* Payment Method Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Payment Method
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {(['credit-card', 'paypal', 'bank-transfer'] as const).map((method) => (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => setPaymentMethod(method)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                paymentMethod === method
                                                    ? 'bg-[#f97316] text-white'
                                                    : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            {method === 'credit-card' ? 'Credit Card' : method === 'paypal' ? 'PayPal' : 'Bank Transfer'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Credit Card Form */}
                            {paymentMethod === 'credit-card' && (
                                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                            className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                                                formErrors.fullName ? 'error-input' : ''
                                            }`}
                                            placeholder="Bonnie Green"
                                            required
                                        />
                                        {formErrors.fullName && (
                                            <p className="error-text">{formErrors.fullName}</p>
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
                                                }}
                                                onChange={() => setFormErrors((prev) => ({ ...prev, cardDetails: '' }))}
                                            />
                                        </div>
                                        {formErrors.cardDetails && (
                                            <p className="error-text">{formErrors.cardDetails}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* PayPal Form */}
                            {paymentMethod === 'paypal' && (
                                <div className="mb-6">
                                    <label
                                        htmlFor="paypal-email"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        PayPal Email*
                                    </label>
                                    <input
                                        type="email"
                                        id="paypal-email"
                                        value={paypalEmail}
                                        onChange={(e) => {
                                            setPaypalEmail(e.target.value);
                                            setFormErrors((prev) => ({ ...prev, paypalEmail: '' }));
                                        }}
                                        className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                                            formErrors.paypalEmail ? 'error-input' : ''
                                        }`}
                                        placeholder="your.email@example.com"
                                        required
                                    />
                                    {formErrors.paypalEmail && (
                                        <p className="error-text">{formErrors.paypalEmail}</p>
                                    )}
                                </div>
                            )}

                            {/* Bank Transfer Form */}
                            {paymentMethod === 'bank-transfer' && (
                                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="account-holder"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                        >
                                            Account Holder*
                                        </label>
                                        <input
                                            type="text"
                                            id="account-holder"
                                            name="accountHolder"
                                            value={bankDetails.accountHolder}
                                            onChange={handleInputChange}
                                            className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                                                formErrors.accountHolder ? 'error-input' : ''
                                            }`}
                                            placeholder="Account holder name"
                                            required
                                        />
                                        {formErrors.accountHolder && (
                                            <p className="error-text">{formErrors.accountHolder}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="bank-name"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                        >
                                            Bank Name*
                                        </label>
                                        <input
                                            type="text"
                                            id="bank-name"
                                            name="bankName"
                                            value={bankDetails.bankName}
                                            onChange={handleInputChange}
                                            className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                                                formErrors.bankName ? 'error-input' : ''
                                            }`}
                                            placeholder="Enter bank name"
                                            required
                                        />
                                        {formErrors.bankName && (
                                            <p className="error-text">{formErrors.bankName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="account-number"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                        >
                                            Account Number*
                                        </label>
                                        <input
                                            type="text"
                                            id="account-number"
                                            name="accountNumber"
                                            value={bankDetails.accountNumber}
                                            onChange={handleInputChange}
                                            className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                                                formErrors.accountNumber ? 'error-input' : ''
                                            }`}
                                            placeholder="Enter account number"
                                            required
                                        />
                                        {formErrors.accountNumber && (
                                            <p className="error-text">{formErrors.accountNumber}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="routing-number"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                        >
                                            Routing Number*
                                        </label>
                                        <input
                                            type="text"
                                            id="routing-number"
                                            name="routingNumber"
                                            value={bankDetails.routingNumber}
                                            onChange={handleInputChange}
                                            className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                                                formErrors.routingNumber ? 'error-input' : ''
                                            }`}
                                            placeholder="Enter routing number"
                                            required
                                        />
                                        {formErrors.routingNumber && (
                                            <p className="error-text">{formErrors.routingNumber}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !stripe || !elements}
                                className="w-full bg-[#f97316] text-white font-medium rounded-lg px-5 py-3 text-sm hover:bg-[#ea580c] focus:outline-none focus:ring-4 focus:ring-[#f97316]/50 dark:bg-[#f97316] dark:hover:bg-[#ea580c] dark:focus:ring-[#f97316]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Pay Now'}
                            </button>
                        </form>

                        <div className="lg:col-span-1 mt-6 lg:mt-0">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Subscription Details
                                </h3>
                                <div className="flex flex-wrap gap-3 mb-4">
                                    {apiData?.data.plans.map((plan) => (
                                        <button
                                            key={plan.id}
                                            type="button"
                                            onClick={() => setSelectedPlan(plan)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                selectedPlan?.id === plan.id
                                                    ? 'bg-[#f97316] text-white'
                                                    : 'bg-gray-100 text-gray-900 dark:bg-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-500'
                                            }`}
                                        >
                                            {plan.interval === 'year' ? 'Yearly' : 'Monthly'} (
                                            {formatPrice(convertAmount(plan.amount))})
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <dl>
                                        <div className="flex items-center justify-between gap-4">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Plan Price
                                            </dt>
                                            <dd className="text-sm font-medium text-gray-900 dark:text-white">
                                                {selectedPlan ? formatPrice(convertAmount(selectedPlan.amount)) : formatPrice(0)}
                                            </dd>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Tax
                                            </dt>
                                            <dd className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatPrice(convertAmount(79900))}
                                            </dd>
                                        </div>

                                        {appliedCoupon && (
                                            <div className="flex items-center justify-between gap-4">
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Coupon Discount
                                                </dt>
                                                <dd className="text-sm font-medium text-green-600 dark:text-green-400">
                                                    -{appliedCoupon.discountType === 'percentage'
                                                        ? `${appliedCoupon.discountValue}%`
                                                        : formatPrice(convertAmount(appliedCoupon.discountValue))}
                                                </dd>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-600">
                                            <dt className="text-sm font-bold text-gray-900 dark:text-white">
                                                Total
                                            </dt>
                                            <dd className="text-sm font-bold text-gray-900 dark:text-white">
                                                {selectedPlan ? formatPrice(convertAmount(selectedPlan.amount + 79900)) : formatPrice(convertAmount(79900))}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                        Included Perks
                                    </h4>
                                    <ul className="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        {apiData?.data.extra_perks.map((perk, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <svg
                                                    className="h-4 w-4 text-[#f97316]"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                {perk}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap justify-center gap-4">
                                <img
                                    className="h-8 w-auto dark:hidden"
                                    src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/paypal.svg"
                                    alt="PayPal"
                                />
                                <img
                                    className="h-8 w-auto hidden dark:flex"
                                    src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/paypal-dark.svg"
                                    alt="PayPal"
                                />
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

                    <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Payment processed by{' '}
                        <a
                            href="https://stripe.com"
                            className="font-medium text-[#f97316] hover:no-underline dark:text-[#f97316]"
                        >
                            Stripe
                        </a>{' '}
                        for{' '}
                        <a
                            href="#"
                            className="font-medium text-[#f97316] hover:no-underline dark:text-[#f97316]"
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