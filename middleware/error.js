import ErrorHandler from '../utils/errorHandler.js';

/**
 * Error handler middleware
 * @param {Error} err - The error object
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
export default (err, req, res, next) => {
  console.log(err);
  // Set error status code
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal server error';

  // Set default status code to 500 if err.statusCode is undefined
  if (err.statusCode === undefined) {
    err.statusCode = 500;
  }

  // Handle wrong mongodb id error
  if (err.name === 'CastError') {
    const message = `Resource is not found with this id. Invalid ${req.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Handle duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate key ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  // Handle wrong jwt error
  if (err.name === 'JsonWebTokenError') {
    const message = `Your URL is invalid. Please try again later`;
    err = new ErrorHandler(message, 401);
  }

  // Handle expired jwt error
  if (err.name === 'TokenExpiredError') {
    const message = `Your URL is expired. Please try again later`;
    err = new ErrorHandler(message, 401);
  }

  //const errorObject = err.toObject();

  const errorObject =
    err instanceof ErrorHandler
      ? err.toObject()
      : { code: err.statusCode, message: err.message };

  res.status(errorObject.code).json({
    success: false,
    code: errorObject.code,
    message: errorObject.message,
  });
};
