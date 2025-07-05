import { catchAsyncErrors } from "./catchAsyncErrors.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "./errorMiddlewares.js"
import { User } from "../models/userModel.js";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  console.log("=== Authentication Debug ===");
  console.log("All Cookies:", req.cookies);
  console.log("Authorization Header:", req.headers.authorization);
  console.log("Origin:", req.headers.origin);
  
  // Try to get token from cookies first, then from Authorization header
  let token = req.cookies.token;
  
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
    console.log("🔍 Token found in Authorization header");
  }
  
  if (!token) {
    console.log("❌ No token found in cookies or headers");
    return next(new ErrorHandler("User is not authenticated. Please log in.", 401));
  }
  
  try {
    console.log("🔍 Token found, verifying...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("✅ Token verified, user ID:", decoded.id);
    
    const user = await User.findById(decoded.id).select("-verificationCode -verificationCodeExpire -resetPasswordToken -resetPasswordExpire");
    
    if (!user) {
      console.log("❌ User not found in database");
      return next(new ErrorHandler("User not found", 404));
    }
    
    console.log("✅ User authenticated:", user.email);
    req.user = user;
    next();
  } catch (error) {
    console.log("❌ Token verification failed:", error.message);
    return next(new ErrorHandler("Invalid or expired token. Please log in again.", 401));
  }
});


export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(`Role (${req.user.role}) is not authorized to access this resource`, 403));
    }
    next();
  };
};