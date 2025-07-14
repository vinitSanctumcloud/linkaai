'use client'
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

// Comprehensive list of ISO 4217 currencies
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
    const [paymentMethod, setPaymentMethod] = useState('credit-card');
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({ USD: 1 });
    const [cardDetails, setCardDetails] = useState({
        fullName: '',
        cardNumber: '',
        expiryDate: null as Date | null,
        cvv: '',
    });
    const [paypalEmail, setPaypalEmail] = useState('');
    const [bankDetails, setBankDetails] = useState({
        accountNumber: '',
        routingNumber: '',
        bankName: '',
        accountHolder: '',
    });
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [apiData, setApiData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [couponError, setCouponError] = useState<string | null>(null);

    // Mock coupon database (replace with API call in production)
    const coupons: Coupon[] = [
        { code: 'SAVE10', discountType: 'percentage', discountValue: 10, valid: true },
        { code: 'FLAT50', discountType: 'fixed', discountValue: 5000, valid: true }, // $50 in cents
        { code: 'INVALID', discountType: 'percentage', discountValue: 0, valid: false },
    ];

    // Exponential backoff for API calls
    const fetchWithBackoff = async (url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> => {
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
            const apiKey = '62184da350a23cc1dedff0389915db3e';
            try {
                // Try the first API
                const response = await fetchWithBackoff(
                    `https://api.exchangerate-api.com/v4/latest/USD`,
                    { method: 'GET' }
                );

                if (!response.ok) throw new Error('First API failed');

                const data = await response.json();
                if (!data.rates) throw new Error('Invalid response format');

                // Ensure USD is always 1
                const rates = { USD: 1, ...data.rates };
                setExchangeRates(rates);
                localStorage.setItem('exchangeRates', JSON.stringify(rates));
                localStorage.setItem('exchangeRatesTimestamp', Date.now().toString());
            } catch (err) {
                console.error('First API failed, trying fallback:', err);
                try {
                    // Fallback API
                    const fallbackResponse = await fetchWithBackoff(
                        `https://api.exchangeratesapi.io/v1/latest?access_key=${apiKey}`,
                        { method: 'GET' }
                    );

                    const fallbackData = await fallbackResponse.json();
                    if (!fallbackData.rates) throw new Error('Invalid fallback response');

                    const rates = { USD: 1, ...fallbackData.rates };
                    setExchangeRates(rates);
                    localStorage.setItem('exchangeRates', JSON.stringify(rates));
                    localStorage.setItem('exchangeRatesTimestamp', Date.now().toString());
                } catch (fallbackErr) {
                    console.error('Fallback API failed:', fallbackErr);
                    setError('Failed to fetch exchange rates. Using default USD.');
                    setExchangeRates({ USD: 1 });
                }
            }
        };
        fetchExchangeRates();
    }, []);

    // Fetch product data
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('productId');
        console.log(productId)
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
                console.log(data)
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

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (paymentMethod === 'credit-card') {
            if (!cardDetails.fullName.trim()) errors.fullName = 'Full name is required';
            if (!/^\d{16}$/.test(cardDetails.cardNumber.replace(/\D/g, '')))
                errors.cardNumber = 'Invalid card number (16 digits required)';
            if (!cardDetails.expiryDate) errors.expiryDate = 'Expiration date is required';
            else if (cardDetails.expiryDate < new Date()) errors.expiryDate = 'Card has expired';
            if (!/^\d{3,4}$/.test(cardDetails.cvv)) errors.cvv = 'Invalid CVV (3-4 digits required)';
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
        if (!selectedCurrency || !exchangeRates) return amount;

        // Convert from cents to dollars first
        const amountInDollars = amount / 100;

        // Get the rate for the selected currency
        const rate = exchangeRates[selectedCurrency] || 1;

        // Apply discount if any
        const discountedAmount = calculateDiscountedAmount(amountInDollars * 100);

        // Convert to target currency and back to cents
        const convertedAmount = (discountedAmount / 100) * rate;

        // Round to nearest cent
        return Math.round(convertedAmount * 100);
    };

    const formatPrice = (amount: number): string => {
        const amountInCurrency = amount / 100; // Convert cents to currency units

        let fractionDigits = 2;
        try {
            // Some currencies don't have decimal places
            fractionDigits = ['JPY', 'KRW', 'VND'].includes(selectedCurrency) ? 0 : 2;

            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: selectedCurrency,
                currencyDisplay: 'symbol',
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits,
            }).format(amountInCurrency);
        } catch (err) {
            console.error('Error formatting price:', err);
            // Fallback formatting
            return `${amountInCurrency.toFixed(fractionDigits)} ${selectedCurrency}`;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setLoading(true);
            const paymentData = {
                paymentMethod,
                cardDetails: paymentMethod === 'credit-card' ? cardDetails : undefined,
                paypalEmail: paymentMethod === 'paypal' ? paypalEmail : undefined,
                bankDetails: paymentMethod === 'bank-transfer' ? bankDetails : undefined,
                selectedPlan: selectedPlan ? {
                    ...selectedPlan,
                    amount: convertAmount(selectedPlan.amount),
                    currency: selectedCurrency,
                } : null,
                coupon: appliedCoupon,
                currency: selectedCurrency,
            };

            console.log('Processing payment:', paymentData);
            alert('Payment processed successfully!');
        } catch (err) {
            setError('Payment processing failed. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalAmount = (planAmount: number): number => {
        // Calculate tax (18% GST)
        const taxAmount = Math.round(planAmount * 0.18);

        // Apply coupon discount if any
        let totalAmount = planAmount + taxAmount;

        if (appliedCoupon) {
            if (appliedCoupon.discountType === 'percentage') {
                totalAmount = Math.round(totalAmount * (1 - appliedCoupon.discountValue / 100));
            } else if (appliedCoupon.discountType === 'fixed') {
                totalAmount = Math.max(0, totalAmount - appliedCoupon.discountValue);
            }
        }

        return totalAmount;
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
                    .react-datepicker {
                        border: 1px solid #d1d5db;
                        border-radius: 0.5rem;
                        width: 100%;
                        font-family: inherit;
                    }
                    .react-datepicker__header {
                        background-color: #f97316;
                        color: white;
                        border-bottom: none;
                        border-radius: 0.5rem 0.5rem 0 0;
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
                                    {['credit-card', 'paypal', 'bank-transfer'].map((method) => (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => setPaymentMethod(method)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${paymentMethod === method
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
                                            className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${formErrors.fullName ? 'error-input' : ''
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
                                            htmlFor="card-number-input"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                        >
                                            Card Number*
                                        </label>
                                        <input
                                            type="text"
                                            id="card-number-input"
                                            name="cardNumber"
                                            value={cardDetails.cardNumber}
                                            onChange={handleInputChange}
                                            className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${formErrors.cardNumber ? 'error-input' : ''
                                                }`}
                                            placeholder="xxxx-xxxx-xxxx-xxxx"
                                            required
                                        />
                                        {formErrors.cardNumber && (
                                            <p className="error-text">{formErrors.cardNumber}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="card-expiration-input"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                        >
                                            Card Expiration*
                                        </label>
                                        <DatePicker
                                            selected={cardDetails.expiryDate}
                                            onChange={(date: Date) => setCardDetails((prev) => ({ ...prev, expiryDate: date }))}
                                            dateFormat="MM/yyyy"
                                            showMonthYearPicker
                                            minDate={new Date()}
                                            className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${formErrors.expiryDate ? 'error-input' : ''
                                                }`}
                                            placeholderText="MM/YYYY"
                                            required
                                        />
                                        {formErrors.expiryDate && (
                                            <p className="error-text">{formErrors.expiryDate}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="cvv-input"
                                            className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                        >
                                            CVV*
                                            <button
                                                data-tooltip-target="cvv-desc"
                                                className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white"
                                            >
                                                <svg
                                                    className="h-4 w-4"
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.408-5.5a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM10 10a1 1 0 10 0 2h1v3h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4a1 1 0 0 0-1-1h-2Z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                            <div
                                                id="cvv-desc"
                                                role="tooltip"
                                                className="absolute z-10 invisible inline-block opacity-0 transition-opacity duration-300 custom-tooltip"
                                            >
                                                The last 3 digits on back of card
                                                <div className="tooltip-arrow" data-popper-arrow></div>
                                            </div>
                                        </label>
                                        <input
                                            type="number"
                                            id="cvv-input"
                                            name="cvv"
                                            value={cardDetails.cvv}
                                            onChange={handleInputChange}
                                            className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${formErrors.cvv ? 'error-input' : ''
                                                }`}
                                            placeholder="•••"
                                            required
                                        />
                                        {formErrors.cvv && <p className="error-text">{formErrors.cvv}</p>}
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
                                        className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${formErrors.paypalEmail ? 'error-input' : ''
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
                                            className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${formErrors.accountHolder ? 'error-input' : ''
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
                                            className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${formErrors.bankName ? 'error-input' : ''
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
                                            className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${formErrors.accountNumber ? 'error-input' : ''
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
                                            className={`block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-[#f97316] focus:ring-[#f97316] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${formErrors.routingNumber ? 'error-input' : ''
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
                                disabled={loading}
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
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPlan?.id === plan.id
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
                                                Tax (18% GST)
                                            </dt>
                                            <dd className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatPrice(convertAmount(Math.round((selectedPlan?.amount || 0) * 0.18)))}
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
                                                {selectedPlan ? formatPrice(convertAmount(calculateTotalAmount(selectedPlan.amount))) : formatPrice(0)}
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
                            href="#"
                            className="font-medium text-[#f97316] hover:no-underline dark:text-[#f97316]"
                        >
                            Paddle
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

export default PaymentForm;