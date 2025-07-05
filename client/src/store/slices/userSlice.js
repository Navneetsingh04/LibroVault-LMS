import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axios from "axios";
import { toggleAddNewAdminPopup } from "./popUpSlice";

// Utility to parse error messages consistently
const parseError = (error, defaultMessage) => {
  if (error.response) {
    if (error.response.status === 401) {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      return "Session expired. Please log in again.";
    }
    if (error.response.status === 403) return "Forbidden. You don't have permission.";
    if (error.response.status === 404) return "Resource not found.";
    if (error.response.status >= 500) return "Server error. Please try again later.";
    return error.response.data?.message || defaultMessage;
  }
  if (error.request) {
    // Check for CORS errors
    if (error.message && error.message.includes('CORS')) {
      return "CORS error. Please contact support.";
    }
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      return "Network error. Please check your connection or try again later.";
    }
    return "Network error. Please check your connection.";
  }
  return defaultMessage;
};

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    fetchAllUsersRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    fetchAllUsersSuccess: (state, action) => {
      state.loading = false;
      state.users = action.payload;
      state.error = null;
    },
    fetchAllUsersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },
    addNewAdminRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    addNewAdminSuccess: (state, action) => {
      state.loading = false;
      state.users.push(action.payload);
      state.message = "Admin added successfully";
      state.error = null;
    },
    addNewAdminFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },
    resetUserSlice: (state) => {
      state.loading = false;
      state.error = null;
      state.message = null;
    },
    authenticationError: (state) => {
      state.loading = false;
      state.error = "Authentication required. Please log in.";
      state.message = null;
    },
  },
});

export const fetchAllUsers = () => async (dispatch) => {
  dispatch(userSlice.actions.fetchAllUsersRequest());
  try {
    const response = await axios.get(
      "https://librovault.onrender.com/api/v1/user/all",
      { 
        withCredentials: true,
        timeout: 30000,
      }
    );
    dispatch(userSlice.actions.fetchAllUsersSuccess(response.data.users));
  } catch (error) {
    console.error("Fetch users error:", error);
    const message = parseError(error, "Failed to fetch users.");
    
    if (error.response?.status === 401) {
      dispatch(userSlice.actions.authenticationError());
      toast.error("Session expired. Please log in again.");
    } else {
      dispatch(userSlice.actions.fetchAllUsersFailure(message));
      toast.error(message);
    }
  }
};

export const addNewAdmin = (data) => async (dispatch) => {
  if (!data) {
    toast.error("Admin data is required");
    dispatch(userSlice.actions.addNewAdminFailure("Admin data is required"));
    return;
  }

  dispatch(userSlice.actions.addNewAdminRequest());
  try {
    const response = await axios.post(
      "https://librovault.onrender.com/api/v1/user/add/new-admin", 
      data, 
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      }
    );
    dispatch(userSlice.actions.addNewAdminSuccess(response.data.user));
    toast.success("Admin Added Successfully");
    dispatch(toggleAddNewAdminPopup());
  } catch (error) {
    console.error("Add admin error:", error);
    const message = parseError(error, "Failed to add admin.");
    
    if (error.response?.status === 401) {
      dispatch(userSlice.actions.authenticationError());
      toast.error("Session expired. Please log in again.");
    } else {
      dispatch(userSlice.actions.addNewAdminFailure(message));
      toast.error(message);
    }
  }
};

export const resetUserSlice = () => (dispatch) => {
  dispatch(userSlice.actions.resetUserSlice());
};

export default userSlice.reducer;