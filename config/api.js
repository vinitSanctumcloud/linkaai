const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const API = {
  BASE_URL,
  LOGIN: `${BASE_URL}/v4/ai-agent/login`,
  SIGNUP: `${BASE_URL}/v4/ai-agent/register`,
  RESET_PASSWORD: `${BASE_URL}/password/reset`,
  FORGOT_PASSWORD: `${BASE_URL}/v4/ai-agent/password/forgot`,
  LOGOUT: `${BASE_URL}/v4/ai-agent/logout`,
  USER_API: `${BASE_URL}/v4/ai-agent/me`,
  CHANGE_PASSWORD: `${BASE_URL}/v4/ai-agent/settings/change/password`,

  // AI Agent
  UPLOAD_IMAGE: `${BASE_URL}/v4/ai-agent/upload/image`,
  UPLOAD_VIDEO: `${BASE_URL}/v4/ai-agent/upload/video`,
  BRAND_LIST: `${BASE_URL}/v4/ai-agent/get-agent/brands`,
  CATEGORY_LIST: `${BASE_URL}/v4/ai-agent/get-agent/categories`,
  AGENT_DETAILS: `${BASE_URL}/v4/ai-agent/get-agent/details`,
  PROGRESS_STEP: `${BASE_URL}/v4/ai-agent/agent/progress`,
  CREATE_AGENT_1: `${BASE_URL}/v4/ai-agent/create-agent`,
  ADD_AGENT_DETAILS_2: `${BASE_URL}/v4/ai-agent/add-agent-details`,
  ADD_PROMPTS_3: `${BASE_URL}/v4/ai-agent/add-prompts`,
  ADD_LINKS_4: `${BASE_URL}/v4/ai-agent/add-links`,
  DELETE_LINK: (linkId) => {
    return `${BASE_URL}/v4/ai-agent/delete-links/${linkId}`;
  },
  LINK_LIST: (link_type, page) => {
    return `${BASE_URL}/v4/ai-agent/agent/links/list?link_type=${link_type}&page=${page}`;
  },
  AI_AGENT_DATA_FROM_SLUG: (slug) => {
    return `${BASE_URL}/v4/ai-agent/get/active/slug?ai_agent_slug=${slug}`;
  },
  SLUG_AVAILABILITY: (customUrl) => {
    return `${BASE_URL}/v4/ai-agent/check/slug/availibility?ai_agent_slug=${customUrl}`;
  },
  UPDATE_SLUG: `${BASE_URL}/v4/ai-agent/update/slug`,

  // plans
  GET_FREE_TRIAL: `${BASE_URL}/v4/ai-agent/freetrial`,
  GET_PAYMENT_METHOD: `${BASE_URL}/v4/ai-agent/paymentmethod`,
  APPLY_COUPON: `${BASE_URL}/v4/ai-agent/coupons/apply`,
  SUBSCRIBE_PLAN: `${BASE_URL}/v4/ai-agent/subscribe`,
  GET_PLAN: (productId) => {
    return `${BASE_URL}/v4/ai-agent/billing/products/${productId}/plans`;
  },
  SUBSCRIPTION_DETIALS: `${BASE_URL}/v4/ai-agent/subscription/details`,

  // SETTING
  VERIFY_EMAIL: `${BASE_URL}/v4/ai-agent/settings/email`,
  VERIFY_MOBILE: `${BASE_URL}/v4/ai-agent/settings/phone`,
  EMAIL_VERIFY_OTP: `${BASE_URL}/v4/ai-agent/settings/verifyOtpForEmail`,
  MOBILE_VERIFY_OTP: `${BASE_URL}/v4/ai-agent/settings/verifyOtpForPhone`,

  // TOKEN
  PURCHASE_TOKEN: `${BASE_URL}/v4/ai-agent/credit/payment`,
  PAYMENT_METHOD: `${BASE_URL}/v4/ai-agent/credit/payment-method`,
  GET_TOKEN_PLAN: `${BASE_URL}/v4/ai-agent/credit/product`,

  // BILLING
  PLAN_LIST: `${BASE_URL}/v4/ai-agent/billing/products`,
  BILLING_HISTORY: `${BASE_URL}/v4/ai-agent/billing/history`,

};
