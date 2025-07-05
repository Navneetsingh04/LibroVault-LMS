import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Utility to parse error messages consistently
const parseError = (error, defaultMessage) => {
  if (error.response) {
    if (error.response.status === 401) return "Unauthorized. Please log in.";
    if (error.response.status === 403) return "Forbidden. Access denied.";
    if (error.response.status === 404) return "Resource not found.";
    if (error.response.status === 422) return "Validation error. Please check your input.";
    if (error.response.status >= 500) return "Server error. Please try again later.";
    return error.response.data?.message || error.response.statusText || defaultMessage;
  }
  if (error.request) {
    return "Network error. Please check your connection.";
  }
  return error.message || defaultMessage;
};

const authSlice = createSlice({
    name: "auth",
    initialState: {
        loading: false,
        error: null,
        message: null,
        user: null,
        isAuthenticated: false,
    },
    reducers: {
        registerRequest(state) {
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        registerSuccess(state, action) {
            state.loading = false;
            state.message = action.payload.message;
            state.error = null;
        },
        registerFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
            state.message = null;
        },
        OTPVerificationRequest(state) {
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        OTPVerificationSuccess(state, action) {
            state.loading = false;
            state.message = action.payload.message;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.error = null;
        },
        OTPVerificationFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
            state.message = null;
        },

        loginRequest(state) {
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        loginSuccess(state, action) {
            state.loading = false;
            state.message = action.payload.message;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.error = null;
        },
        loginFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
            state.message = null;
        },
        
        logoutRequest(state){
            state.loading = true;
            state.message = null;
            state.error = null;
        },
        logoutSuccess(state, action){
            state.loading = false;
            state.message = action.payload;
            state.isAuthenticated = false;
            state.user = null;
            state.error = null;
        },
        logoutFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
            state.message = null;
        },

        getUserRequest(state){
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        getUserSuccess(state, action){
            state.loading = false;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.error = null;
        },
        getUserFailed(state, action){
            state.loading = false;
            state.error = action.payload;
            state.user = null;
            state.isAuthenticated = false;
            state.message = null;
        },

        forgotPasswordRequest(state){
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        forgotPasswordSuccess(state, action){
            state.loading = false;
            state.message = action.payload;
            state.error = null;
        },
        forgotPasswordFailed(state, action){
            state.loading = false;
            state.error = action.payload;
            state.message = null;
        },

        resetPasswordRequest(state){
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        resetPasswordSuccess(state, action){
            state.loading = false;
            state.message = action.payload.message;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.error = null;
        },
        resetPasswordFailed(state, action){
            state.loading = false;
            state.error = action.payload;
            state.message = null;
        },

        updatePasswordRequest(state){
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        updatePasswordSuccess(state, action){
            state.loading = false;
            state.message = action.payload;
            state.error = null;
        },
        updatePasswordFailed(state, action){
            state.loading = false;
            state.error = action.payload;
            state.message = null;
        },

        resetAuthSlice(state){
            state.error = null;
            state.loading = false;
            state.message = null;
        },
        
        clearMessages(state) {
            state.error = null;
            state.message = null;
        }
    },
});

export const resetSlice = () => (dispatch) => {
    dispatch(authSlice.actions.resetAuthSlice());
};

export const clearMessages = () => (dispatch) => {
    dispatch(authSlice.actions.clearMessages());
};

export const register = (data) => async (dispatch) => {
    // Input validation
    if (!data || !data.email || !data.password) {
        dispatch(authSlice.actions.registerFailed("Email and password are required"));
        return;
    }

    dispatch(authSlice.actions.registerRequest());
    try {
        const res = await axios.post(`https://librovault.onrender.com/api/v1/auth/register`, data, {
            withCredentials: true,
            timeout: 10000,
            headers: {
                "Content-Type": "application/json",
            },
        });
        dispatch(authSlice.actions.registerSuccess(res.data)); 
    } catch (error) {
        const errorMessage = parseError(error, "Registration failed");
        dispatch(authSlice.actions.registerFailed(errorMessage));
    }
};

export const OTPVerification = (email, otp) => async (dispatch) => {
    // Input validation
    if (!email || !otp) {
        dispatch(authSlice.actions.OTPVerificationFailed("Email and OTP are required"));
        return;
    }

    dispatch(authSlice.actions.OTPVerificationRequest());
    try {
        const res = await axios.post(`https://librovault.onrender.com/api/v1/auth/verifyOTP`, 
            { email, otp }, 
            {
                withCredentials: true,
                timeout: 10000,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        
        dispatch(authSlice.actions.OTPVerificationSuccess(res.data));
    } catch (error) {
        const errorMessage = parseError(error, "OTP verification failed");
        dispatch(authSlice.actions.OTPVerificationFailed(errorMessage));
    }
};

export const login = (data) => async (dispatch) => {
    // Input validation
    if (!data || !data.email || !data.password) {
        dispatch(authSlice.actions.loginFailed("Email and password are required"));
        return;
    }

    dispatch(authSlice.actions.loginRequest());
    try {
        const res = await axios.post(`https://librovault.onrender.com/api/v1/auth/login`, data, {
            withCredentials: true,
            timeout: 10000,
            headers: {
                "Content-Type": "application/json",
            },
        });

        dispatch(authSlice.actions.loginSuccess(res.data));
    } catch (error) {
        const errorMessage = parseError(error, "Login failed");
        dispatch(authSlice.actions.loginFailed(errorMessage));
    }
};

export const logout = () => async (dispatch) => {
    dispatch(authSlice.actions.logoutRequest());
    try {
        const res = await axios.get(`https://librovault.onrender.com/api/v1/auth/logout`, {
            withCredentials: true,
            timeout: 10000,
        });
        
        dispatch(authSlice.actions.logoutSuccess(res.data.message || "Logged out successfully"));
    } catch (error) {
        const errorMessage = parseError(error, "Logout failed");
        dispatch(authSlice.actions.logoutFailed(errorMessage));
    }
};

export const getUser = () => async (dispatch) => {
    dispatch(authSlice.actions.getUserRequest());
    try {
        const res = await axios.get(`https://librovault.onrender.com/api/v1/auth/me`, {
            withCredentials: true,
            timeout: 10000,
        });
        
        dispatch(authSlice.actions.getUserSuccess(res.data));
    } catch (error) {
        const errorMessage = parseError(error, "Failed to get user information");
        dispatch(authSlice.actions.getUserFailed(errorMessage));
    }
};

export const forgotPassword = (email) => async (dispatch) => {
    // Input validation
    if (!email || !email.trim()) {
        dispatch(authSlice.actions.forgotPasswordFailed("Email is required"));
        return;
    }

    dispatch(authSlice.actions.forgotPasswordRequest());
    try {
        const res = await axios.post(`https://librovault.onrender.com/api/v1/auth/password/forgot`, 
            { email }, 
            {
                withCredentials: true,
                timeout: 10000,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        
        dispatch(authSlice.actions.forgotPasswordSuccess(res.data.message || "Password reset email sent")); 
    } catch (error) {
        const errorMessage = parseError(error, "Password recovery request failed");
        dispatch(authSlice.actions.forgotPasswordFailed(errorMessage));
    }
};

export const resetPassword = (data, token) => async (dispatch) => {
    // Input validation
    if (!data || !data.password || !token) {
        dispatch(authSlice.actions.resetPasswordFailed("Password and token are required"));
        return;
    }

    dispatch(authSlice.actions.resetPasswordRequest());
    try {
        const res = await axios.put(`https://librovault.onrender.com/api/v1/auth/password/reset/${token}`, 
            data, 
            {
                withCredentials: true,
                timeout: 10000,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        dispatch(authSlice.actions.resetPasswordSuccess(res.data));
    } catch (error) {
        const errorMessage = parseError(error, "Password reset failed");
        dispatch(authSlice.actions.resetPasswordFailed(errorMessage));
    }
};

export const updatePassword = (data) => async (dispatch) => {
    // Input validation
    if (!data || !data.currentPassword || !data.newPassword) {
        dispatch(authSlice.actions.updatePasswordFailed("Current password and new password are required"));
        return;
    }

    dispatch(authSlice.actions.updatePasswordRequest());
    try {
        const res = await axios.put(`https://librovault.onrender.com/api/v1/auth/password/update`, 
            data, 
            {
                withCredentials: true,
                timeout: 10000,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        
        dispatch(authSlice.actions.updatePasswordSuccess(res.data.message || "Password updated successfully"));
    } catch (error) {
        const errorMessage = parseError(error, "Password update failed");
        dispatch(authSlice.actions.updatePasswordFailed(errorMessage));
    }
};

export default authSlice.reducer;