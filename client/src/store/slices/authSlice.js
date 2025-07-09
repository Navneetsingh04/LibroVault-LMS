import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Helper function to get cookie value
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};

// Helper function to get axios config with auth headers
const getAuthConfig = () => {
    // Try to get token from localStorage first, then from cookies
    let token = localStorage.getItem('authToken');
    if (!token) {
        token = getCookie('token');
        if (token) {
            localStorage.setItem('authToken', token); // Store for future use
        }
    }
    return {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` })
        }
    };
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
        },
        registerFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
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
            // Store token in localStorage for cross-origin requests
            if (action.payload.token) {
                localStorage.setItem('authToken', action.payload.token);
            }
        },
        OTPVerificationFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
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
            // Store token in localStorage for cross-origin requests
            if (action.payload.token) {
                localStorage.setItem('authToken', action.payload.token);
            } else {
                // Try to get token from cookies if not in response
                const cookieToken = getCookie('token');
                if (cookieToken) {
                    localStorage.setItem('authToken', cookieToken);
                }
            }
        },
        loginFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
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
            // Clear token from localStorage
            localStorage.removeItem('authToken');
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
        },
        getUserFailed(state, action){
            state.loading = false;
            state.error = action.payload;
            state.user = null;
            state.isAuthenticated = false;
            // Clear token from localStorage on auth failure
            if (action.payload && action.payload.includes("Session expired")) {
                localStorage.removeItem('authToken');
            }
        },

        forgotPasswordRequest(state){
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        forgotPasswordSuccess(state, action){
            state.loading = false;
            state.message = action.payload;
        },
        forgotPasswordFailed(state, action){
            state.loading = false;
            state.error = action.payload;
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
        },
        resetPasswordFailed(state, action){
            state.loading = false;
            state.error = action.payload;
        },

        updatePasswordRequest(state){
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        updatePasswordSuccess(state, action){
            state.loading = false;
            state.message = action.payload;
        },
        updatePasswordFailed(state, action){
            state.loading = false;
            state.error = action.payload;
        },

        resetAuthSlice(state){
            state.error = null;
            state.loading = false;
            state.message = null;
        }
    },
});

export const resetSlice = () => (dispatch) => {
    dispatch(authSlice.actions.resetAuthSlice());
};

export const register = (data) => async (dispatch) => {
    dispatch(authSlice.actions.registerRequest());
    await axios.post(`https://librovault.onrender.com/api/v1/auth/register`, data, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => {
        dispatch(authSlice.actions.registerSuccess(res.data)); 
    }).catch((error) => {
        dispatch(authSlice.actions.registerFailed(error.response?.data?.message || "Registration failed"));
    });
};

export const OTPVerification = (email, otp) => async (dispatch) => {
    try {
        dispatch(authSlice.actions.OTPVerificationRequest());
        const res = await axios.post(`https://librovault.onrender.com/api/v1/auth/verifyOTP`, {email, otp}, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        if (res.status === 200 || res.status === 201) {
            dispatch(authSlice.actions.OTPVerificationSuccess(res.data));
        } else {
            dispatch(authSlice.actions.OTPVerificationFailed("Unexpected response from server"));
        }
    } catch (error) {
        dispatch(authSlice.actions.OTPVerificationFailed(error.response?.data?.message || "OTP verification failed"));
    }
};

export const login = (data) => async (dispatch) => {
    try {
      dispatch(authSlice.actions.loginRequest());
      const res = await axios.post(`https://librovault.onrender.com/api/v1/auth/login`, data, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (res.status === 200 || res.status === 201) {
        dispatch(authSlice.actions.loginSuccess(res.data));
      } else {
        dispatch(authSlice.actions.loginFailed("Unexpected response from server"));
      }
    } catch (error) {
      console.error("Login error:", error);
      dispatch(authSlice.actions.loginFailed(error.response?.data?.message || "Login failed"));
    }
  };
  

export const logout = () => async (dispatch) => {
    try {
        dispatch(authSlice.actions.logoutRequest());
        const res = await axios.get(`https://librovault.onrender.com/api/v1/auth/logout`, getAuthConfig());
        
        if (res.status === 200 || res.status === 201) {
            dispatch(authSlice.actions.logoutSuccess(res.data.message));
        } else {
            dispatch(authSlice.actions.logoutFailed("Unexpected response from server"));
        }
    } catch (error) {
        // Even if logout fails on server, clear local data
        localStorage.removeItem('authToken');
        dispatch(authSlice.actions.logoutFailed(error.response?.data?.message || "Logout failed"));
    }
};

export const getUser = () => async (dispatch) => {
    try {
        dispatch(authSlice.actions.getUserRequest());
        const res = await axios.get(`https://librovault.onrender.com/api/v1/auth/me`, {
            ...getAuthConfig(),
            timeout: 30000, // 30 second timeout
        });
        
        if (res.status === 200 || res.status === 201) {
            dispatch(authSlice.actions.getUserSuccess(res.data));
        } else {
            dispatch(authSlice.actions.getUserFailed("Unexpected response from server"));
        }
    } catch (error) {
        console.error("Get user error:", error);
        
        // Handle 401 errors specifically (user not authenticated)
        if (error.response?.status === 401) {
            // Clear any stored auth data
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('user');
            dispatch(authSlice.actions.getUserFailed("Session expired. Please log in again."));
        } else {
            const message = error.response?.data?.message || "Failed to get user information";
            dispatch(authSlice.actions.getUserFailed(message));
        }
    }
};

export const forgotPassword = (email) => async (dispatch) => {
    try {
        dispatch(authSlice.actions.forgotPasswordRequest());
        const res = await axios.post(`https://librovault.onrender.com/api/v1/auth/password/forgot`, {email}, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        if (res.status === 200 || res.status === 201) {
            dispatch(authSlice.actions.forgotPasswordSuccess(res.data.message)); 
        } else {
            dispatch(authSlice.actions.forgotPasswordFailed(res.response?.data?.message || "Unexpected response from server"));
        }
    } catch (error) {
        dispatch(authSlice.actions.forgotPasswordFailed(error.response?.data?.message || "Password recovery request failed"));
    }
};

export const resetPassword = (data, token) => async (dispatch) => {
    try {
        dispatch(authSlice.actions.resetPasswordRequest());

        const res = await axios.put(`https://librovault.onrender.com/api/v1/auth/password/reset/${token}`, data, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.status === 200 || res.status === 201) {
            dispatch(authSlice.actions.resetPasswordSuccess(res.data));
        } else {
            dispatch(authSlice.actions.resetPasswordFailed("Unexpected response from server"));
        }
    } catch (error) {
        // console.error("Full error response:", error.response);
        // console.error("Error message:", error.response?.data?.message);
        dispatch(authSlice.actions.resetPasswordFailed(error.response?.data?.message || "Password reset failed"));
    }
};


export const updatePassword = (data) => async (dispatch) => {
    try {
        dispatch(authSlice.actions.updatePasswordRequest());
        const res = await axios.put(`https://librovault.onrender.com/api/v1/auth/password/update`, data, getAuthConfig());
        
        if (res.status === 200 || res.status === 201) {
            dispatch(authSlice.actions.updatePasswordSuccess(res.data.message));
        } else {
            dispatch(authSlice.actions.updatePasswordFailed("Unexpected response from server"));
        }
    } catch (error) {
        dispatch(authSlice.actions.updatePasswordFailed(error.response?.data?.message || "Password update failed"));
    }
};

export default authSlice.reducer;