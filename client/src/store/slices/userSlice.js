import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import axios from "axios";
import { toggleAddNewAdminPopup } from "./popUpSlice";

// Helper function to get request config
const getRequestConfig = (isMultipart = false) => {
  const config = {
    withCredentials: true,
    headers: {}
  };
  
  // Don't set Content-Type for multipart, let axios handle it
  if (!isMultipart) {
    config.headers['Content-Type'] = 'application/json';
  }
  
  return config;
};

// Helper function to handle 401 errors
const handle401Error = () => {
  toast.error('Session expired. Please login again.');
  window.location.href = '/login';
};

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchAllUsersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAllUsersSuccess: (state, action) => {
      state.loading = false;
      state.users = action.payload;
      state.error = null;
    },
    fetchAllUsersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addNewAdminRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    addNewAdminSuccess: (state, action) => {
      state.loading = false;
      state.users.push(action.payload);
      state.error = null;
    },
    addNewAdminFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const fetchAllUsers = () => async (dispatch) => {
  dispatch(userSlice.actions.fetchAllUsersRequest());
  
  try {
    const response = await axios.get(
      "https://librovault.onrender.com/api/v1/user/all",
      getRequestConfig()
    );
    
    dispatch(userSlice.actions.fetchAllUsersSuccess(response.data.users));
  } catch (error) {
    // Handle 401 specifically
    if (error.response?.status === 401) {
      handle401Error();
      return;
    }
    
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users';
    dispatch(userSlice.actions.fetchAllUsersFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export const addNewAdmin = (data) => async (dispatch) => {
  dispatch(userSlice.actions.addNewAdminRequest());
  
  try {
    const response = await axios.post(
      "https://librovault.onrender.com/api/v1/user/add/new-admin",
      data,
      getRequestConfig(true) // true for multipart data
    );
    
    dispatch(userSlice.actions.addNewAdminSuccess(response.data.user));
    toast.success("Admin Added Successfully");
    dispatch(toggleAddNewAdminPopup());
  } catch (error) {
    // Handle 401 specifically
    if (error.response?.status === 401) {
      handle401Error();
      return;
    }
    
    const errorMessage = error.response?.data?.message || error.message || 'Failed to add admin';
    dispatch(userSlice.actions.addNewAdminFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export default userSlice.reducer;