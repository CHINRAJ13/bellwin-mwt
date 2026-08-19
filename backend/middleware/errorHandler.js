const ApiError = require('../utils/ApiError');

/**
 * 404 Not Found Middleware
 * Catch-all for unknown routes
 */
const notFoundHandler = (req, res, next) => {
    next(new ApiError(404, "API Route Not Found"));
};

/**
 * Global Error Handler Middleware
 */
const globalErrorHandler = (err, req, res, next) => {
    let error = err;
    console.error('GLOBAL ERROR:', err);

    // If it's not our custom ApiError, wrap it
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal Server Error";
        error = new ApiError(statusCode, message);
    }

    // Prepare response
    const response = {
        success: false,
        message: error.message,
        statusCode: error.statusCode,
    };

    // Include stack trace only in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(error.statusCode).json(response);
};

module.exports = {
    notFoundHandler,
    globalErrorHandler
};
