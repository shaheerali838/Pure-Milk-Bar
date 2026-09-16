
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
