/**
 * Custom error class that extends the base Error class.
 * Represents an error with a specific message, status code, and optional data.
 */
class ErrorHandler extends Error {
  /**
   * Creates a new instance of the ErrorHandler class.
   *
   * @param {string} message - The error message.
   * @param {number} statusCode - The status code associated with the error.
   */
  constructor(message, statusCode, data = null) {
    super(message);
    this.statusCode = statusCode;

    // Capture the stack trace of the error
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Converts the error object to a plain object representation.
   *
   * @returns {object} - The error object as a plain object.
   */
  toObject() {
    return {
      status: false,
      code: this.statusCode,
      message: this.message,
    };
  }
}

export default ErrorHandler;
