export interface Plan {
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
}

export interface PlanDetails {
  id: string;
  amount: number;
  interval: string;
  currency: string;
}

export interface Product {
  name: string;
  description: string;
  image: string;
  features: string[];
}

export interface ApiResponse {
  message: string;
  data: {
    plans: PlanDetails[];
    extra_perks: string[];
    products: Product[];
    connected_account_id: string;
  };
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_trial' | 'custom';
  discountValue: number;
  description?: string;
  duration?: number;
  customDetails?: string;
  message?: string;
}