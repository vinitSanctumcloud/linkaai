import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API } from '@/config/api';
import { resetAgent } from './agentSlice'; // Import resetAgent action

// Define the shape of the auth state
interface AuthState {
  user: any | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  aiAgentData: any | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,
  aiAgentData: null,
};

// 🟢 Async Thunk to Initialize Auth State
export const initializeAuthState = createAsyncThunk(
  'auth/initializeAuthState',
  async (_, { dispatch }) => {
    const accessToken = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    const aiAgentData = localStorage.getItem('aiAgentData');

    const parsedUser = user ? JSON.parse(user) : null;
    const parsedAiAgentData = aiAgentData ? JSON.parse(aiAgentData).data : null;

    if (accessToken && !parsedAiAgentData) {
      await dispatch(fetchAiAgentData(accessToken));
    }

    // console.log(aiAgentData,"ddddd")

    return {
      accessToken,
      user: parsedUser,
      aiAgentData: parsedAiAgentData,
    };
  }
);

// 🟢 Async Thunk for Login
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(API.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  }
);

// 🟢 Async Thunk for Signup
export const signup = createAsyncThunk(
  'auth/signup',
  async (formData: any, { rejectWithValue }) => {
    const baseRequiredFields = [
      'first_name',
      'last_name',
      'email',
      'password',
      'password_confirmation',
    ];

    if (!formData.accept_aggrements) {
      return rejectWithValue('You must accept the terms and conditions');
    }

    if (formData.password !== formData.password_confirmation) {
      return rejectWithValue('Passwords do not match');
    }

    let requiredFields = [...baseRequiredFields];
    if (formData.user_varient === 'CREATOR') {
      requiredFields.push('creator_handle');
    } else if (formData.user_varient === 'BUSINESS') {
      requiredFields.push('business_name');
    }

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        return rejectWithValue(`Missing or empty required field: ${field}`);
      }
    }

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

    try {
      const response = await fetch(API.SIGNUP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 418) {
          return rejectWithValue(
            "Signup server refused the request (418 I'm a Teapot). Please check the request payload or contact support."
          );
        }
        return rejectWithValue(data.message || 'Signup failed. Please try again.');
      }

      if (!data.data?.access_token) {
        return rejectWithValue('Signup succeeded but no access token was returned. Please contact support.');
      }

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

      return {
        access_token: data.data.access_token,
        user,
        message: data.message || 'You have successfully registered',
        ...data,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  }
);

// 🟢 Async Thunk for Request Verification
export const requestVerification = createAsyncThunk(
  'auth/requestVerification',
  async ({ verify_via, email }: { verify_via: string; email: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(API.FORGOT_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verify_via, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Verification request failed');
      }

      return {
        success: true,
        message: data.message || 'Verification sent',
        otp_token: data.data.otp_token,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  }
);

// 🟢 Async Thunk for Reset Password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (
    {
      otp,
      email,
      password,
      security_token,
      verify_via,
      password_confirmation,
    }: {
      otp: string;
      email: string;
      password: string;
      security_token: string;
      verify_via: string;
      password_confirmation: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(API.RESET_PASSWORD, {
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
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.message || 'Password reset failed');
      }

      return {
        success: true,
        message: 'Password reset successfully!',
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  }
);

// 🟢 Async Thunk for Logout
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue, dispatch }) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(API.LOGOUT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
      credentials: 'include',
    });

    const data = await response.json();

    // Clear localStorage
    localStorage.clear();

    // Reset agent slice
    dispatch(resetAgent());

    if (!response.ok) {
      return rejectWithValue(data.message || 'Logout failed');
    }

    return {
      success: true,
      message: data.message || 'Logged out successfully',
    };
  } catch (error) {
    // Clear localStorage and reset agent slice even if API call fails
    localStorage.clear();
    dispatch(resetAgent());
    return rejectWithValue(error instanceof Error ? error.message : 'An unexpected error occurred');
  }
});

// 🟢 Async Thunk for Fetching AI Agent Data
export const fetchAiAgentData = createAsyncThunk(
  'auth/fetchAiAgentData',
  async (accessToken: string, { rejectWithValue }) => {
    try {
      const cachedAiAgentData = localStorage.getItem('aiAgentData');
      if (cachedAiAgentData) {
        return JSON.parse(cachedAiAgentData).data;
      }

      const response = await fetch(API.USER_API, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return rejectWithValue('Failed to fetch AI agent data');
      }

      const aiAgentData = await response.json();
      localStorage.setItem('aiAgentData', JSON.stringify(aiAgentData));
      return aiAgentData.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  }
);

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initializeAuthState.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.aiAgentData = action.payload.aiAgentData;
    });

    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.data.access_token;
        state.user = action.payload.data.user;
        localStorage.setItem('accessToken', action.payload.data.access_token);
        localStorage.setItem('user', JSON.stringify(action.payload.data.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.access_token;
        state.user = action.payload.user;
        localStorage.setItem('accessToken', action.payload.access_token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(requestVerification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestVerification.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(requestVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.aiAgentData = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.aiAgentData = null;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchAiAgentData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAiAgentData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.aiAgentData = action.payload;
      })
      .addCase(fetchAiAgentData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;