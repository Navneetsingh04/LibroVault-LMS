import { catchAsyncErrors } from "./catchAsyncErrors.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "./errorMiddlewares.js"
import { User } from "../models/userModel.js";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  // Try to get token from cookies first, then from Authorization header
  let token = req.cookies.token;
  
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
  }
  
  if (!token) {
    return next(new ErrorHandler("User is not authenticated. Please log in.", 401));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    const user = await User.findById(decoded.id).select("-verificationCode -verificationCodeExpire -resetPasswordToken -resetPasswordExpire");
    
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    req.user = user;
    next();
  } catch (error) {
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