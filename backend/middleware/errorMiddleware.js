// backend/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
    // Determine the status code
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    // Send a JSON response with the error message and stack trace (if not in production)
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = {
    errorHandler,
};