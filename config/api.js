const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const API = {
  BASE_URL,
  STRIPE_PRODUCTS: `${BASE_URL}/v4/ai-agent/billing/products`,
  LOGIN: `${BASE_URL}/v4/ai-agent/login`,
  SIGNUP: `${BASE_URL}/v4/ai-agent/register`,
  RESET_PASSWORD: `${BASE_URL}/password/reset`,
  FORGOT_PASSWORD: `${BASE_URL}/v4/ai-agent/password/forgot`,
  LOGOUT : `${BASE_URL}/v4/ai-agent/logout`,
};
