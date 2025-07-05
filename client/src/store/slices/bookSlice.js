import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toggleAddBookPopup } from "./popUpSlice";

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

// Helper function for multipart form data with auth
const getAuthConfigMultipart = () => {
  const token = localStorage.getItem('authToken');
  return {
    withCredentials: true,
    headers: {
      ...(token && { "Authorization": `Bearer ${token}` })
    }
  };
};

// Utility to parse error messages consistently
const parseError = (error, defaultMessage) => {
  if (error.response) {
    if (error.response.status === 401) {
      // Clear any stored auth data and redirect to login
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      return "Unauthorized. Please log in.";
    }
    if (error.response.status === 403) return "Forbidden. You don't have permission.";
    if (error.response.status === 404) return "Resource not found.";
    if (error.response.status >= 500) return "Server error. Please try again later.";
    return error.response.data?.message || defaultMessage;
  }
  if (error.request) {
    return "Network error. Please check your connection.";
  }
  return defaultMessage;
};

const bookSlice = createSlice({
  name: "book",
  initialState: {
    loading: false,
    error: null,
    message: null,
    books: [],
  },
  reducers: {
    fetchBooksRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    fetchBooksSuccess: (state, action) => {
      state.loading = false;
      state.books = action.payload;
    },
    fetchBooksFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },
    addBookRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    addBookSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      if (action.payload.book) {
        state.books.push(action.payload.book);
      }
    },
    addBookFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },
    deleteBookRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    deleteBookSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      state.books = state.books.filter(
        (book) => book._id !== action.payload.bookId
      );
    },
    deleteBookFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },
    resetBookSlice: (state) => {
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
});

// Async Thunks

export const fetchAllBooks = () => async (dispatch) => {
  dispatch(bookSlice.actions.fetchBooksRequest());
  try {
    const response = await axios.get("https://librovault.onrender.com/api/v1/book/all", {
      ...getAuthConfig(),
      timeout: 30000, // 30 second timeout
    });
    dispatch(bookSlice.actions.fetchBooksSuccess(response.data.books));
  } catch (error) {
    console.error("Fetch books error:", error);
    const message = parseError(error, "Failed to fetch books.");
    dispatch(bookSlice.actions.fetchBooksFailure(message));
  }
};

export const addBook = (bookData) => async (dispatch) => {
  dispatch(bookSlice.actions.addBookRequest());
  try {
    // Determine content type based on data type
    const isFormData = bookData instanceof FormData;
    const headers = isFormData 
      ? {} // Let axios set Content-Type for FormData automatically
      : { "Content-Type": "application/json" };

    const response = await axios.post(
      "https://librovault.onrender.com/api/v1/book/admin/add",
      bookData,
      {
        ...(isFormData ? getAuthConfigMultipart() : getAuthConfig()),
        timeout: 30000, // 30 second timeout
      }
    );
    dispatch(
      bookSlice.actions.addBookSuccess({
        message: response.data.message,
        book: response.data.book, // Make sure your backend returns the new book
      })
    );
    dispatch(toggleAddBookPopup());
  } catch (error) {
    console.error("Add book error:", error);
    const message = parseError(error, "Failed to add book.");
    dispatch(bookSlice.actions.addBookFailure(message));
  }
};

export const deleteBook = (bookId) => async (dispatch) => {
  dispatch(bookSlice.actions.deleteBookRequest());
  try {
    const response = await axios.delete(
      `https://librovault.onrender.com/api/v1/book/delete/${bookId}`,
      {
        ...getAuthConfig(),
        timeout: 30000, // 30 second timeout
      }
    );
    dispatch(
      bookSlice.actions.deleteBookSuccess({
        message: response.data.message,
        bookId,
      })
    );
  } catch (error) {
    console.error("Delete book error:", error);
    const message = parseError(error, "Failed to delete book.");
    dispatch(bookSlice.actions.deleteBookFailure(message));
  }
};

export const resetBookSlice = () => (dispatch) => {
  dispatch(bookSlice.actions.resetBookSlice());
};

export default bookSlice.reducer;
