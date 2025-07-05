import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import OTP from "./pages/OTP";
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { getUser } from "./store/slices/authSlice";
import { fetchAllUsers } from "./store/slices/userSlice";
import { fetchAllBooks } from "./store/slices/bookSlice";
import {
  fetchAllBorrowedBooks,
  fetchUserBorrowedBooks,
} from "./store/slices/borrowSlice";

const AppContent = () => {
  const location = useLocation();
  const { user, isAuthenticated, loading, authChecked } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const publicRoutes = ["/login", "/register", "/password/forgot", "/password/reset"];
  const isPublicRoute = publicRoutes.some((route) => location.pathname.startsWith(route));

  // Always check authentication on app load
  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  // Fetch data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchAllBooks());

      if (user.role === "Admin") {
        dispatch(fetchAllUsers());
        dispatch(fetchAllBorrowedBooks());
      }

      if (user.role === "User") {
        dispatch(fetchUserBorrowedBooks());
      }
    }
  }, [isAuthenticated, user, dispatch]);

  // Show loading while checking authentication
  if (!authChecked && loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If not authenticated and trying to access protected route, redirect to login
  if (!isAuthenticated && authChecked && !isPublicRoute) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated and trying to access public route, redirect to home
  if (isAuthenticated && authChecked && isPublicRoute) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/otp-verification/:email" element={<OTP />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />
      </Routes>
      <ToastContainer theme="dark" />
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;