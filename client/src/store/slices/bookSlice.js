import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toggleAddBookPopup } from "./popUpSlice";

// Utility to parse error messages consistently
const parseError = (error, defaultMessage) => {
  if (error.response) {
    if (error.response.status === 401) return "Unauthorized. Please log in.";
    if (error.response.status === 403) return "Forbidden. You don't have permission.";
    if (error.response.status === 404) return "Resource not found.";
    return error.response.data?.message || error.response.statusText || defaultMessage;
  }
  if (error.request) {
    return "Network error. Please check your connection.";
  }
  return error.message || defaultMessage;
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
      state.books = action.payload || []; // Ensure it's always an array
      state.error = null;
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
      state.error = null;
      // Add the new book to the beginning of the array if it exists
      if (action.payload.book) {
        state.books.unshift(action.payload.book);
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
      state.error = null;
      // Remove the book from the array
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
    clearMessages: (state) => {
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
      withCredentials: true,
      timeout: 10000, // 10 second timeout
    });
    
    // Validate response structure
    if (response.data && Array.isArray(response.data.books)) {
      dispatch(bookSlice.actions.fetchBooksSuccess(response.data.books));
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Fetch books error:", error);
    const message = parseError(error, "Failed to fetch books.");
    dispatch(bookSlice.actions.fetchBooksFailure(message));
  }
};

export const addBook = (bookData) => async (dispatch) => {
  // Validate input
  if (!bookData || typeof bookData !== 'object') {
    dispatch(bookSlice.actions.addBookFailure("Invalid book data provided."));
    return;
  }

  dispatch(bookSlice.actions.addBookRequest());
  try {
    const response = await axios.post(
      "https://librovault.onrender.com/api/v1/book/admin/add",
      bookData,
      {
        withCredentials: true,
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    // Validate response
    if (response.data) {
      dispatch(
        bookSlice.actions.addBookSuccess({
          message: response.data.message || "Book added successfully",
          book: response.data.book,
        })
      );
      // Only close popup on success
      dispatch(toggleAddBookPopup());
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Add book error:", error);
    const message = parseError(error, "Failed to add book.");
    dispatch(bookSlice.actions.addBookFailure(message));
  }
};

export const deleteBook = (bookId) => async (dispatch) => {
  // Validate input
  if (!bookId) {
    dispatch(bookSlice.actions.deleteBookFailure("Book ID is required."));
    return;
  }

  dispatch(bookSlice.actions.deleteBookRequest());
  try {
    const response = await axios.delete(
      `https://librovault.onrender.com/api/v1/book/delete/${bookId}`,
      {
        withCredentials: true,
        timeout: 10000,
      }
    );
    
    dispatch(
      bookSlice.actions.deleteBookSuccess({
        message: response.data?.message || "Book deleted successfully",
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

export const clearMessages = () => (dispatch) => {
  dispatch(bookSlice.actions.clearMessages());
};

export default bookSlice.reducer;