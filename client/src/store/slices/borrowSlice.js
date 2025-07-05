import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toggleRecordBookPopup } from "./popUpSlice";

// Helper function to get axios config with auth headers
const getAuthConfig = () => {
  const token = localStorage.getItem('authToken');
  return {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` })
    }
  };
};

// Utility to parse error messages consistently
const parseError = (error, defaultMessage) => {
  if (error.response) {
    if (error.response.status === 401) {
      // Clear any stored auth data
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      // Dispatch logout action if needed (you might want to import logout action)
      // dispatch(logout()); // Uncomment if you have access to logout action
      return "Session expired. Please log in again.";
    }
    if (error.response.status === 403) return "Forbidden. You don't have permission to perform this action.";
    if (error.response.status === 404) return "Resource not found.";
    if (error.response.status === 409) return "Conflict. This book may already be borrowed or returned.";
    if (error.response.status >= 500) return "Server error. Please try again later.";
    return error.response.data?.message || defaultMessage;
  }
  if (error.request) {
    return "Network error. Please check your connection.";
  }
  return defaultMessage;
};

const borrowSlice = createSlice({
  name: "borrow",
  initialState: {
    loading: false,
    error: null,
    message: null,
    userBorrowedBooks: [],
    allBorrowedBooks: [],
  },
  reducers: {
    fetchBorrowingsRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    fetchBorrowingsSuccess: (state, action) => {
      state.loading = false;
      state.userBorrowedBooks = action.payload;
    },
    fetchBorrowingsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },

    recordBookRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    recordBookSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
    },
    recordBookFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },

    fetchAllBorrowingsRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    fetchAllBorrowingsSuccess: (state, action) => {
      state.loading = false;
      state.allBorrowedBooks = action.payload;
    },
    fetchAllBorrowingsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },

    returnBookRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    returnBookSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
    },
    returnBookFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },
    resetBorrowSlice: (state) => {
      state.loading = false;
      state.error = null;
      state.message = null;
    },
    // Add action to handle authentication errors specifically
    authenticationError: (state) => {
      state.loading = false;
      state.error = "Authentication required. Please log in.";
      state.message = null;
    },
  },
});

export const fetchUserBorrowedBooks = () => async (dispatch) => {
  dispatch(borrowSlice.actions.fetchBorrowingsRequest());
  try {
    const response = await axios.get(
      "https://librovault.onrender.com/api/v1/borrow/my-borrowed-books",
      { 
        ...getAuthConfig(),
        timeout: 30000, // 30 second timeout
      }
    );
    dispatch(
      borrowSlice.actions.fetchBorrowingsSuccess(response.data.borrowedBooks)
    );
  } catch (error) {
    console.error("Fetch user borrowed books error:", error);
    const message = parseError(error, "Failed to fetch your borrowed books.");
    
    // Handle 401 errors specifically
    if (error.response?.status === 401) {
      dispatch(borrowSlice.actions.authenticationError());
      // You might want to redirect to login page here
      // window.location.href = '/login';
    } else {
      dispatch(borrowSlice.actions.fetchBorrowingsFailure(message));
    }
  }
};

export const fetchAllBorrowedBooks = () => async (dispatch) => {
  dispatch(borrowSlice.actions.fetchAllBorrowingsRequest());
  try {
    const response = await axios.get(
      "https://librovault.onrender.com/api/v1/borrow/borrowed-books-by-users",
      { 
        ...getAuthConfig(),
        timeout: 30000, // 30 second timeout
      }
    );
    dispatch(
      borrowSlice.actions.fetchAllBorrowingsSuccess(
        response.data.borrowedBooks
      )
    );
  } catch (error) {
    console.error("Fetch all borrowed books error:", error);
    const message = parseError(error, "Failed to fetch all borrowed books.");
    
    // Handle 401 errors specifically
    if (error.response?.status === 401) {
      dispatch(borrowSlice.actions.authenticationError());
    } else {
      dispatch(borrowSlice.actions.fetchAllBorrowingsFailure(message));
    }
  }
};

export const recordBorrowedBook = (email, id) => async (dispatch) => {
  dispatch(borrowSlice.actions.recordBookRequest());
  try {
    const response = await axios.post(
      `https://librovault.onrender.com/api/v1/borrow/record-borrow-book/${id}`,
      { email },
      {
        ...getAuthConfig(),
        timeout: 30000, // 30 second timeout
      }
    );
    dispatch(
      borrowSlice.actions.recordBookSuccess({
        message: response.data.message,
      })
    );
    dispatch(toggleRecordBookPopup());
  } catch (error) {
    console.error("Record borrowed book error:", error);
    const message = parseError(error, "Failed to record borrowed book.");
    
    // Handle 401 errors specifically
    if (error.response?.status === 401) {
      dispatch(borrowSlice.actions.authenticationError());
    } else {
      dispatch(borrowSlice.actions.recordBookFailure(message));
    }
  }
};

export const returnBorrowedBook = (email, id) => async (dispatch) => {
  dispatch(borrowSlice.actions.returnBookRequest());
  try {
    const response = await axios.put(
      `https://librovault.onrender.com/api/v1/borrow/return-borrowed-book/${id}`,
      { email },
      {
        ...getAuthConfig(),
        timeout: 30000, // 30 second timeout
      }
    );
    dispatch(
      borrowSlice.actions.returnBookSuccess({
        message: response.data.message,
      })
    );
  } catch (error) {
    console.error("Return borrowed book error:", error);
    const message = parseError(error, "Failed to return borrowed book.");
    
    // Handle 401 errors specifically
    if (error.response?.status === 401) {
      dispatch(borrowSlice.actions.authenticationError());
    } else {
      dispatch(borrowSlice.actions.returnBookFailure(message));
    }
  }
};

export const resetBorrowSlice = () => (dispatch) => {
  dispatch(borrowSlice.actions.resetBorrowSlice());
};

export default borrowSlice.reducer;
