import createHttpError from 'http-errors';

export const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        error: {
            message,
            status,
        },
        // In development, you might want to include stack trace
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
