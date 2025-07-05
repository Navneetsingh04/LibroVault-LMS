import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toggleRecordBookPopup } from "./popUpSlice";

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

// Helper function to create headers (cookie-based auth)
const getRequestConfig = () => {
  return {
    withCredentials: true,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  };
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
      state.userBorrowedBooks = action.payload || [];
      state.error = null;
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
      state.error = null;
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
      state.allBorrowedBooks = action.payload || [];
      state.error = null;
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
      state.error = null;
      // Remove the returned book from user's borrowed books
      if (action.payload.bookId) {
        state.userBorrowedBooks = state.userBorrowedBooks.filter(
          book => book._id !== action.payload.bookId
        );
      }
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
    clearMessages: (state) => {
      state.error = null;
      state.message = null;
    },
  },
});

export const fetchUserBorrowedBooks = () => async (dispatch) => {
  dispatch(borrowSlice.actions.fetchBorrowingsRequest());
  try {
    const response = await axios.get(
      "https://librovault.onrender.com/api/v1/borrow/my-borrowed-books",
      getRequestConfig()
    );
    
    // Validate response structure
    if (response.data && Array.isArray(response.data.borrowedBooks)) {
      dispatch(
        borrowSlice.actions.fetchBorrowingsSuccess(response.data.borrowedBooks)
      );
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Fetch user borrowed books error:", error);
    
    // Handle 401 specifically for cookie auth
    if (error.response?.status === 401) {
      // Redirect to login for re-authentication
      window.location.href = '/login';
      return;
    }
    
    const errorMessage = parseError(error, "Failed to fetch borrowed books");
    dispatch(borrowSlice.actions.fetchBorrowingsFailure(errorMessage));
  }
};

export const fetchAllBorrowedBooks = () => async (dispatch) => {
  dispatch(borrowSlice.actions.fetchAllBorrowingsRequest());
  try {
    const response = await axios.get(
      "https://librovault.onrender.com/api/v1/borrow/borrowed-books-by-users",
      getRequestConfig()
    );
    
    // Validate response structure
    if (response.data && Array.isArray(response.data.borrowedBooks)) {
      dispatch(
        borrowSlice.actions.fetchAllBorrowingsSuccess(response.data.borrowedBooks)
      );
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Fetch all borrowed books error:", error);
    
    if (error.response?.status === 401) {
      window.location.href = '/login';
      return;
    }
    
    const errorMessage = parseError(error, "Failed to fetch all borrowed books");
    dispatch(borrowSlice.actions.fetchAllBorrowingsFailure(errorMessage));
  }
};

export const recordBorrowedBook = (email, id) => async (dispatch) => {
  // Input validation
  if (!email || !id) {
    dispatch(borrowSlice.actions.recordBookFailure("Email and book ID are required"));
    return;
  }

  dispatch(borrowSlice.actions.recordBookRequest());
  try {
    const response = await axios.post(
      `https://librovault.onrender.com/api/v1/borrow/record-borrow-book/${id}`,
      { email },
      getRequestConfig()
    );
    
    dispatch(
      borrowSlice.actions.recordBookSuccess({
        message: response.data.message || "Book borrowed successfully",
      })
    );
    dispatch(toggleRecordBookPopup());
  } catch (error) {
    console.error("Record borrowed book error:", error);
    
    if (error.response?.status === 401) {
      window.location.href = '/login';
      return;
    }
    
    const errorMessage = parseError(error, "Failed to record borrowed book");
    dispatch(borrowSlice.actions.recordBookFailure(errorMessage));
  }
};

export const returnBorrowedBook = (email, id) => async (dispatch) => {
  // Input validation
  if (!email || !id) {
    dispatch(borrowSlice.actions.returnBookFailure("Email and book ID are required"));
    return;
  }

  dispatch(borrowSlice.actions.returnBookRequest());
  try {
    const response = await axios.put(
      `https://librovault.onrender.com/api/v1/borrow/return-borrowed-book/${id}`,
      { email },
      getRequestConfig()
    );
    
    dispatch(
      borrowSlice.actions.returnBookSuccess({
        message: response.data.message || "Book returned successfully",
        bookId: id, // Pass the book ID for state update
      })
    );
  } catch (error) {
    console.error("Return borrowed book error:", error);
    
    if (error.response?.status === 401) {
      window.location.href = '/login';
      return;
    }
    
    const errorMessage = parseError(error, "Failed to return borrowed book");
    dispatch(borrowSlice.actions.returnBookFailure(errorMessage));
  }
};

export const resetBorrowSlice = () => (dispatch) => {
  dispatch(borrowSlice.actions.resetBorrowSlice());
};

export const clearMessages = () => (dispatch) => {
  dispatch(borrowSlice.actions.clearMessages());
};

export default borrowSlice.reducer;