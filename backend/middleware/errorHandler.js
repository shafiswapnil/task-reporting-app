import createHttpError from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Handle Prisma errors
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      error: {
        message: 'Database operation failed',
        status: 400,
        code: err.code
      }
    });
  }

  // Handle HTTP errors
  if (createHttpError.isHttpError(err)) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        status: err.status
      }
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        message: err.message,
        status: 400,
        details: err.details
      }
    });
  }

  // Default error
  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message,
      status: 500
    }
  });
};
