import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { resetPassword, resetSlice } from "../store/slices/authSlice";
import logo from "../assets/black-logo.png";
import logo_with_title from "../assets/logo-with-title.png";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { token } = useParams();
  const dispatch = useDispatch();
  const { loading, error, message, isAuthenticated } = useSelector((state) => state.auth);

  const handleResetPassword = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
  
    if (password.length < 8 || password.length > 20) {
      toast.error("Password must be between 8 and 20 characters");
      return;
    }
    const formData = new FormData();
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);
  

    dispatch(resetPassword(formData, token));
  };

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(resetSlice());
    }
    if (error) {
      toast.error(error);
      dispatch(resetSlice());
    }
  }, [dispatch, message, error]);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col md:flex-row">
      {/* Left Section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-gray-900 to-black text-white flex-col justify-center items-center p-8 relative overflow-hidden rounded-r-4xl">
        <div className="relative z-10 text-center">
          <img
            src={logo_with_title}
            alt="logo"
            className="h-44 w-auto mb-12 mx-auto drop-shadow-lg"
          />
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Create New Password
          </h2>
          <p className="text-lg text-gray-300 px-8 leading-relaxed">
            Your new password must be different from your previous password. Choose a strong password to keep your account secure.
          </p>
          
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-12 relative">
        {/* Back Button */}
        <Link
          to="/password/forgot"
          className="absolute top-6 left-6 group flex items-center space-x-2 bg-white border-2 border-gray-200 hover:border-black rounded-full px-6 py-3 text-sm font-semibold hover:bg-black hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </Link>

        <div className="w-full max-w-md mt-12 md:mt-0">
          {/* Logo for mobile */}
          <div className="flex justify-center mb-8 md:hidden">
            <img src={logo} alt="logo" className="h-16 w-auto" />
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="hidden md:flex justify-center mb-8">
              <img src={logo} alt="logo" className="h-20 w-auto" />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Reset Password
              </h1>
              <p className="text-gray-600 text-lg">
                Enter your new password below
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your new password"
                    required
                    className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 text-gray-700 placeholder-gray-400 focus:border-black focus:ring-0 focus:outline-none transition-colors duration-200"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Password must be 8-20 characters long
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    required
                    className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 text-gray-700 placeholder-gray-400 focus:border-black focus:ring-0 focus:outline-none transition-colors duration-200"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold text-lg transition-all duration-300 transform ${
                  loading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Resetting Password...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Reset Password</span>
                  </div>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-black font-semibold hover:underline transition-all duration-200"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
