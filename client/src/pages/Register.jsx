import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import logo from "../assets/black-logo.png";
import logo_with_title from "../assets/logo-with-title.png";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { register, resetSlice } from "../store/slices/authSlice"; 

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationEmail, setRegistrationEmail] = useState(""); // Store email for navigation

  const dispatch = useDispatch();
  const { loading, error, message, user, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const navigateTo = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    
    // Validate fields before submitting
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    // Clean and prepare data
    const cleanedEmail = email.trim().toLowerCase();
    const userData = {
      name: name.trim(),
      email: cleanedEmail,
      password
    };
    
    console.log("Registering user with data:", { name: userData.name, email: userData.email });
    
    // Store cleaned email for navigation
    setRegistrationEmail(cleanedEmail);
    dispatch(register(userData));
  };

  useEffect(() => {
    if (message && registrationEmail) {
      console.log("Registration successful, navigating to OTP page");
      console.log("Email for navigation:", registrationEmail);
      toast.success(message);
      
      // Small delay to ensure toast is shown before navigation
      const timer = setTimeout(() => {
        try {
          const encodedEmail = encodeURIComponent(registrationEmail);
          console.log("Navigating to:", `/otp-verification/${encodedEmail}`);
          navigateTo(`/otp-verification/${encodedEmail}`);
          dispatch(resetSlice());
        } catch (navError) {
          console.error("Navigation error:", navError);
          // Fallback: try without encoding
          try {
            navigateTo(`/otp-verification/${registrationEmail}`);
            dispatch(resetSlice());
          } catch (fallbackError) {
            console.error("Fallback navigation also failed:", fallbackError);
            toast.error("Navigation error. Please manually go to OTP verification page.");
          }
        }
      }, 1000); // Increased delay slightly
      
      // Cleanup timer
      return () => clearTimeout(timer);
    }
    if (error) {
      console.error("Registration error:", error);
      toast.error(error);
      dispatch(resetSlice());
    }
  }, [dispatch, error, message, navigateTo, registrationEmail]);

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="flex flex-col justify-center md:flex-row h-screen">
      {/* Left Side */}
      <div className="hidden w-full md:w-1/2 bg-black text-white md:flex flex-col justify-center items-center p-8 rounded-tr-[80px] rounded-br-[80px]">
        <div className="text-center h-[376px]">
          <div className="flex justify-center items-center mb-12">
            <img src={logo_with_title} alt="logo" className="mb-12 h-44 w-auto" />
          </div>
          <p className="text-gray-300 mb-12">Already have an account? Sign in now</p>
          <Link
            to={"/login"}
            className="border-2 rounded-lg font-semibold border-white py-2 px-8 hover:bg-white hover:text-black transition"
          >
            Sign in
          </Link>
        </div>
      </div>
      {/* Right Side */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white p-8">
        <div className="w-full max-w-sm">
          <div className="flex justify-center items-center mb-12">
            <div className="flex flex-col-reverse justify-center items-center gap-5">
              <h3 className="font-medium text-4xl overflow-hidden">Sign Up</h3>
              <img src={logo} alt="logo" className="h-auto w-24 object-cover" />
            </div>
          </div>
          <p className="text-gray-800 text-center mb-12">Please provide your information to sign up.</p>
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Your Name"
                required
                className="w-full border-2 border-black rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                required
                className="w-full border-2 border-black rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
                className="w-full border-2 border-black rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="block md:hidden font-medium">
              <p>
                Already have an account?{" "}
                <Link to={"/login"} className="text-small text-gray-500 hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="border-2 mt-5 border-black w-full font-semibold bg-black text-white py-2 rounded-lg hover:bg-white hover:text-black transition"
            >
              {loading ? "Processing..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;