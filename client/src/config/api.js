const isDevelopment =
  import.meta.env.DEV ||
  window.location.hostname.includes("localhost") ||
  window.location.hostname === "127.0.0.1";

export const API_BASE_URL = isDevelopment
  ? import.meta.env.VITE_API_BASE_URL_DEV || "http://localhost:4000/api/v1"
  : import.meta.env.VITE_API_BASE_URL_PROD;

export const AUTH_URL = `${API_BASE_URL}/auth`;
export const BOOK_URL = `${API_BASE_URL}/book`;
export const USER_URL = `${API_BASE_URL}/user`;
export const BORROW_URL = `${API_BASE_URL}/borrow`;
