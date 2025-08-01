'use client'

import { API } from '@/config/api'

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) throw new Error('No access token found');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };
};

// 🟢 Login
export const login = async ({ email, password }) => {
  const response = await fetch(API.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Login failed')
  }

  return data
}

// 🟢 Signup
export const signup = async (formData) => {
  // Define base required fields (excluding conditional fields)
  const baseRequiredFields = [
    'first_name',
    'last_name',
    'email',
    'password',
    'password_confirmation',
  ];

  // Validate agreements
  if (!formData.accept_aggrements) {
    throw new Error('You must accept the terms and conditions');
  }

  // Validate password match
  if (formData.password !== formData.password_confirmation) {
    throw new Error('Passwords do not match');
  }

  // Determine additional required fields based on user_varient
  let requiredFields = [...baseRequiredFields];
  if (formData.user_varient === 'CREATOR') {
    requiredFields.push('creator_handle');
  } else if (formData.user_varient === 'BUSINESS') {
    requiredFields.push('business_name');
  }
  // For user_varient === '', no additional fields are required

  // Validate required fields
  for (const field of requiredFields) {
    if (!formData[field] || formData[field].toString().trim() === '') {
      throw new Error(`Missing or empty required field: ${field}`);
    }
  }

  // Prepare the payload
  const payload = {
    first_name: formData.first_name.trim(),
    last_name: formData.last_name.trim(),
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
    confirm_password: formData.password_confirmation,
    user_varient: formData.user_varient,
    creator_handle:
      formData.user_varient === 'CREATOR'
        ? formData.creator_handle?.trim().toLowerCase()
        : null,
    business_name:
      formData.user_varient === 'BUSINESS'
        ? formData.business_name?.trim().toLowerCase()
        : null,
  };

  console.log('Sending signup request to:', API.SIGNUP);
  console.log('Signup payload:', payload);

  try {
    const response = await fetch(API.SIGNUP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Signup response status:', response.status);
    const data = await response.json();
    console.log('Signup response data:', data);

    if (!response.ok) {
      if (response.status === 418) {
        console.error('Signup 418 Error Details:', data);
        throw new Error(
          "Signup server refused the request (418 I'm a Teapot). Please check the request payload or contact support."
        );
      }
      throw new Error(data.message || 'Signup failed. Please try again.');
    }

    // Check for access_token
    if (!data.data?.access_token) {
      console.error('Access token missing in response:', data);
      throw new Error('Signup succeeded but no access token was returned. Please contact support.');
    }

    // Shape the user object to match the desired structure
    const user = {
      user_id: data.user?.user_id || data.user_id,
      first_name: data.user?.first_name || formData.first_name.trim(),
      last_name: data.user?.last_name || formData.last_name.trim(),
      full_name: data.user?.full_name || `${formData.first_name.trim()} ${formData.last_name.trim()}`.toLowerCase(),
      email: data.user?.email || formData.email.trim().toLowerCase(),
      email_verified: data.user?.email_verified ?? false,
      phone_number: data.user?.phone_number ?? null,
      phone_number_verified: data.user?.phone_number_verified ?? false,
      about_me: data.user?.about_me ?? null,
      company_name: data.user?.company_name ?? null,
      cover_image: data.user?.cover_image ?? null,
      display_image: data.user?.display_image ?? null,
      opt_cdn: data.user?.opt_cdn ?? null,
      opt_cover_image: data.user?.opt_cover_image ?? null,
      opt_display_image: data.user?.opt_display_image ?? null,
      profile_images: data.user?.profile_images ?? null,
      profile_banner_details: data.user?.profile_banner_details ?? [],
      gender: data.user?.gender ?? null,
      hex_code: data.user?.hex_code ?? null,
      industry_type: data.user?.industry_type ?? null,
      job_title: data.user?.job_title ?? null,
      tag_name: data.user?.tag_name ?? null,
    };

    console.log('Signup successful, user data:', user);

    // Return the response in the desired structure
    return {
      access_token: data.data.access_token,
      user,
      message: data.message || 'You have successfully registered',
      ...data,
    };
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

// 🟢 Request Verification (email or phone)
export const requestVerification = async ({ verify_via, email }) => {
  const response = await fetch(API.FORGOT_PASSWORD, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verify_via, email }),
  })

  console.log(response, 'Verification request response')
  const data = await response.json()
  console.log(data.data.otp_token, 'Verification request response')
  if (!response.ok) {
    throw new Error(data.message || 'Verification request failed')
  }

  return {
    success: true,
    message: data.message || 'Verification sent',
    otp_token: data.data.otp_token,
  }
}

// 🟢 Reset Password
export const resetPassword = async ({ otp, email, password, security_token, verify_via, password_confirmation }) => {
  const res = await fetch(API.RESET_PASSWORD, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      otp,
      email,
      password,
      security_token,
      verify_via,
      password_confirmation,
    }),
  })

  console.log(res, 'Reset Password Response')
  const result = await res.json()
  console.log('Reset Password Result:', result)

  if (!res.ok) {
    throw new Error(result.message || 'Password reset failed')
  }

  return {
    success: true,
    message: 'Password reset successfully!',
  }
}


export const Logout = async () => {
  try {
    console.log('Sending logout request to:', API.LOGOUT);
    const response = await fetch(API.LOGOUT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      credentials: 'include', // Include credentials if tokens are managed via cookies
    });

    console.log('Logout response status:', response.status);
    const data = await response.json();
    console.log('Logout response data:', data);
    console.log(data.message, 'Logout Response Message')
    console.log(response.ok, 'Logout Response OK')

    // Clear localStorage on successful logout
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    localStorage.removeItem('aiAgentData')

    // if (!!response.ok) {
    //   throw new Error(data.message || 'Logout failed');
    // }

    return {
      success: true,
      message: data.message || 'Logged out successfully',
    };
  } catch (error) {
    // Clear localStorage even if the API call fails to ensure clean state
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('aiAgentData');

    console.error('Logout error:', error);
    throw error;
  }
}