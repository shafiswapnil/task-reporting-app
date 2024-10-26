import createHttpError from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (createHttpError.isHttpError(err)) {
    res.status(err.status).json({
      error: {
        message: err.message,
        status: err.status
      }
    });
  } else {
    res.status(500).json({
      error: {
        message: 'An unexpected error occurred',
        status: 500
      }
    });
  }
};
