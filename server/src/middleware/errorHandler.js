const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    const statusCode = error.status || 500;
    const message = error.message || 'Something went wrong.';

    return res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;