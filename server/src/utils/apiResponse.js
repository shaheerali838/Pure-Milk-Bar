/**
 * Standardized API Response formatter following the JSend/JSON envelope.
 * Every endpoint must use these helpers to ensure consistent response shapes.
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {number} statusCode - HTTP status code (200, 201, etc.)
 * @param {string} message - Human-readable success message
 * @param {object} [data] - Response payload
 * @param {object} [meta] - Pagination metadata { page, limit, total }
 */
export const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const response = {
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {number} statusCode - HTTP status code (400, 404, 500, etc.)
 * @param {string} message - Human-readable error message
 * @param {string} [errorCode] - Machine-readable error code
 * @param {Array} [details] - Optional array of detailed field errors
 */
export const sendError = (res, statusCode, message, errorCode = null, details = null) => {
  const response = {
    success: false,
    statusCode,
    error: {
      code: errorCode || 'ERROR',
      message,
    },
    timestamp: new Date().toISOString(),
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};
