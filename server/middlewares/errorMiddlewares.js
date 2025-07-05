class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Handling MongoDB duplicate key errors
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }

    // Handling invalid JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 400;
        message = "Json Web Token is invalid. Try Again";
    }

    // Handling expired JWT errors
    if (err.name === "TokenExpiredError") { 
        statusCode = 400;
        message = "Json Web Token has expired. Try Again";
    }
    if (err.name === "CastError") { 
        statusCode = 400;
        message = `Resource not found. Invalid: ${err.path}`;
    }

    // Handling validation errors from Mongoose
    if (err.errors) {
        message = Object.values(err.errors)
            .map((error) => error.message)
            .join(", ");
    }

    return res.status(statusCode).json({
        success: false,
        message,
    });
};

export default ErrorHandler;
