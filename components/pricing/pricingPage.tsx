'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Plan } from './types';
import { fetchFreeTrialStatus, fetchPricingData } from '@/services/pricingService';
import PaymentForm from './paymentForm';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const responseData = await fetchPricingData();
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
        }));
        setPlans(processedPlans);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedPlan && isModalOpen) {
      const accountId = selectedPlan.accountId;
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        console.error('Stripe publishable key is not defined');
        return;
      }
      setStripePromise(loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, {
        stripeAccount: accountId,
      }));
    }
  }, [selectedPlan, isModalOpen]);

  const handlePlanSelect = async (plan: Plan) => {
    try {
      setLoading(true);
      setSubscriptionMessage(null);
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setSubscriptionMessage('No access token found. Please log in and try again.');
        return;
      }
      const allowFreeTrial = await fetchFreeTrialStatus();
      setFreeSubscriptionStatus(allowFreeTrial);
      if (!allowFreeTrial) {
        setSubscriptionMessage('You already have an active free subscription. Please cancel it or contact support to proceed.');
        return;
      }
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
                        {[...plan.standardPerks, ...plan.extra_perks].map((perk, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{perk}</span>
                          </li>
                        ))}
                      </ul>
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
16.1.1
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