import { ApiResponse, Coupon } from '@/components/pricing/types';
import { API } from '@/config/api';

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) throw new Error('No access token found');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };
};

export const fetchPricingData = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API.BASE_URL}/billing/products`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch pricing data');
  }
  return response.json();
};

export const fetchProductData = async (productId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API.BASE_URL}/billing/products/${productId}/plans`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const fetchFreeTrialStatus = async (): Promise<boolean> => {
  const response = await fetch(`${API.BASE_URL}/freetrial`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch free trial status');
  }
  const data = await response.json();
  return data.data.allow_platform_free_trial;
};

export const applyCoupon = async (couponCode: string, planId: string | undefined): Promise<Coupon> => {
  const response = await fetch(`${API.BASE_URL}/coupons/apply`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ promotional_code: couponCode, plan_id: planId }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Invalid coupon code');
  }
  return response.json();
};

export const createSubscription = async (paymentMethodId: string | null, planId: string, isFreeTrialEnabled: boolean) => {
  const response = await fetch(`${API.BASE_URL}/subscribe`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      payment_method: paymentMethodId,
      plan_id: planId,
      is_free_trial_enable: isFreeTrialEnabled,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Subscription creation failed');
  }
  return response.json();
};