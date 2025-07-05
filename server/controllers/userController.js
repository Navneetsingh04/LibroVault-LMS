import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js"
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import { validateFields } from "../utils/validateFields.js";
import { validatePassword } from "../utils/validatePassword.js";

export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
    try {
        const users = await User.find({accountVerified: true});
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        next(error);
    }
});

export const registerNewAdmin = catchAsyncErrors(async (req, res, next) => {
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Admin avatar required. ", 400));
    }
    const { name, email, password } = req.body;


    const validateFieldsError = validateFields({ name, email, password });
    if (validateFieldsError) {
        return next(new ErrorHandler(validateFieldsError, 400));
    }

    const isRegistered = await User.findOne({ email, accountVerified: true });
    if(isRegistered){
        return next(new ErrorHandler("Account already exists.", 400));
    }

    const validatePasswordError = validatePassword({ password });
    if (validatePasswordError) {
        return next(new ErrorHandler(validatePasswordError, 400));
    }

    const {avatar} = req.files;
    const allowedFileTypes = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
    if(!allowedFileTypes.includes(avatar.mimetype)){
        return next(new ErrorHandler("Please upload an image file.", 400));
    }
    if (!avatar.tempFilePath) {
        return next(new ErrorHandler("File upload failed. Please try again.", 500));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const cloudinaryResponse = await cloudinary.uploader.upload(avatar.tempFilePath,{
        folder: "LIBRARY_MANAGEMENT_SYSTEM_ADMIN_AVATARS",
    });
    if(!cloudinaryResponse || cloudinaryResponse.error){
        return next(new ErrorHandler("Error uploading image. Please try again.", 500));
    }
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "Admin",
        accountVerified: true,
        avatar: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        }
    });
    res.status(200).json({
        success: true,
        message: "Admin registered successfully.",
        user,
    });
});