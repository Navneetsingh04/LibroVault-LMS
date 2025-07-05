import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toggleAddBookPopup } from "./popUpSlice";

// Utility to parse error messages consistently
const parseError = (error, defaultMessage) => {
  if (error.response) {
    if (error.response.status === 401) return "Unauthorized. Please log in.";
    return error.response.data?.message || defaultMessage;
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
      withCredentials: true,
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
    const response = await axios.post(
      "https://librovault.onrender.com/api/v1/book/admin/add",
      bookData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
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
        withCredentials: true,
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
