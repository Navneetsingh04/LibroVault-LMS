import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplates.js";

import crypto from "crypto";
import { validatePassword } from "../utils/validatePassword.js";
import { validateFields } from "../utils/validateFields.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    // Validate required fields
    const validationError = validateFields({ name, email, password });
    if (validationError) {
      return next(new ErrorHandler(validationError, 400));
    }

    const isRegistered = await User.findOne({ email, accountVerified: true });
    if (isRegistered) {
      return next(new ErrorHandler("Account already exists.", 400));
    }

    const registrationAttemptByUser = await User.find({
      email,
      accountVerified: false,
    });
    if (registrationAttemptByUser.length >= 5) {
      return next(
        new ErrorHandler(
          "You have excedeed the number of registration attempts. please contact to support",
          400
        )
      );
    }

    const passwordValidationError = validatePassword(password);

    if (passwordValidationError) {
      return next(new ErrorHandler(passwordValidationError, 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const verificationCode = await user.generateVerificationCode();
    await user.save();
    sendVerificationCode(user.verificationCode, email, res);
  } catch (error) {
    next(error);
  }
});

export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return next(new ErrorHandler("Email or OTP is missing.", 400));
    }

    const userAllEntries = await User.find({
      email,
      accountVerified: false,
    }).sort({ createdAt: -1 });
    if (userAllEntries.length === 0) {
      return next(new ErrorHandler("User Not Found", 404));
    }
    let user;
    if (userAllEntries.length > 1) {
      user = userAllEntries[0];
      await User.deleteMany({
        _id: { $ne: user._id },
        email,
        accountVerified: false,
      });
    } else {
      user = userAllEntries[0];
    }
    if (user.verificationCode !== Number(otp)) {
      return next(new ErrorHandler("Invalid OTP", 400));
    }
    const currentTime = Date.now();

    const verificationCodeExpire = new Date(
      user.verificationCodeExpire
    ).getTime();

    if (currentTime > verificationCodeExpire) {
      return next(new ErrorHandler("OTP has been expired", 400));
    }
    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;
    await user.save({ validateModifiedOnly: true });

    sendToken(user, 200, "Account Verified.", res);
  } catch (error) {
    return next(new ErrorHandler("Internal server error", 500));
  }
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  const validationError = validateFields({ email, password });
  if (validationError) {
    return next(new ErrorHandler(validationError, 400));
  }

  const user = await User.findOne({
    email,
    accountVerified: true,
  }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  sendToken(user, 200, "Login Successful", res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out Successfully",
  });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  if (!req.body.email) {
    return next(new ErrorHandler("Please enter email", 400));
  }
  const user = await User.findOne({
    email: req.body.email,
    accountVerified: true,
  });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  const resetToken = user.generatePasswordResetToken();

  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `http://localhost:5173/password/reset/${resetToken}`;
  // console.log(resetPasswordUrl)

  const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "LibroValut Library Password Recovery",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} sucessfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler("Email could not be sent", 500));
  }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorHandler("Invalid reset token", 400));
  }
  const passwordValidationError = validatePassword(
    req.body.password,
    req.body.confirmPassword
  );
  if (passwordValidationError) {
    return next(new ErrorHandler(passwordValidationError, 400));
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendToken(user, 200, "Password reset successful", res);
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  console.log("Request Body:", req.body);
  console.log("User from req:", req.user);
  const user = await User.findById(req.user).select("+password");
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const validationError = validateFields({
    currentPassword,
    newPassword,
    confirmNewPassword,
  });

  if (validationError) {
    return next(new ErrorHandler(validationError, 400));
  }

  const isPasswordMatched = await bcrypt.compare(
    currentPassword,
    user.password
  );
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Current password is Incorrect", 400));
  }

  const passwordValidationError = validatePassword(
    newPassword,
    confirmNewPassword
  );
  if (passwordValidationError) {
    return next(new ErrorHandler(passwordValidationError, 400));
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});
