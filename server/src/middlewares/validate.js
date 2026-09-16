import { sendError } from '../utils/apiResponse.js';

const validate = (schemas) => {
  return (req, res, next) => {
    const errors = [];

    for (const [source, schema] of Object.entries(schemas)) {
      const { error, value } = schema.validate(req[source], {
        abortEarly: false,     // Report ALL errors, not just the first one
        stripUnknown: true,    // Remove unknown fields (mass assignment prevention)
        convert: true,         // Auto-convert types (e.g., string "1" → number 1 for query params)
      });

      if (error) {
        const fieldErrors = error.details.map((detail) => ({
          field: detail.path.join('.') || source,
          message: detail.message,
          source,
        }));
        errors.push(...fieldErrors);
      } else {
        // For body, replace directly (writable in Express v5).
        // For query/params (read-only in Express v5), store on custom namespace.
        if (source === 'body') {
          req.body = value;
        } else {
          if (!req._validated) req._validated = {};
          req._validated[source] = value;
        }
      }
    }

    if (errors.length > 0) {
      return sendError(res, 400, 'Validation failed', 'VALIDATION_ERROR', errors);
    }

    next();
  };
};

export default validate;
