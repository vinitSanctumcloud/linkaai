const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const API = {
  BASE_URL,
  STRIPE_PRODUCTS: `${BASE_URL}/v4/ai-agent/billing/products`,
  LOGIN: `${BASE_URL}/v4/ai-agent/login`,
  SIGNUP: `${BASE_URL}/v4/ai-agent/register`,
  RESET_PASSWORD: `${BASE_URL}/password/reset`,
  FORGOT_PASSWORD: `${BASE_URL}/v4/ai-agent/password/forgot`,
  LOGOUT : `${BASE_URL}/v4/ai-agent/logout`,
  NEXT_PUBLIC_EXCHANGERATES_API_KEY: 'pk_test_51OGwtdGoz9TIRExtLl3aG7GMO2hiaYjeWLZRudSWvMvL1I1TUWjoe42CqE4RNecJ87ULtVph7hdkaRj4UX2Js4vA00J14Srf5A'
};
