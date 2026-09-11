/**
 * Custom operational error class for the Dairy Milk Farm API.
 * Differentiates between operational errors (expected business logic failures)
 * and programmer errors (unexpected 500 Internal Server Errors).
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {number} statusCode - HTTP status code (4xx for client, 5xx for server)
   * @param {string} [errorCode] - Machine-readable error code (e.g., 'MILK_DILUTION_DETECTED')
   * @param {Array} [details] - Optional array of detailed validation/field errors
   */
  constructor(message, statusCode, errorCode = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
