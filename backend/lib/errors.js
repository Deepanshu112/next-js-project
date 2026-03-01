// Custom error class for API errors
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
  }
}

// Standard error responses
export const errorResponses = {
  badRequest: (message = 'Bad request') => ({
    statusCode: 400,
    message
  }),
  
  unauthorized: (message = 'Unauthorized') => ({
    statusCode: 401,
    message
  }),
  
  forbidden: (message = 'Forbidden') => ({
    statusCode: 403,
    message
  }),
  
  notFound: (message = 'Not found') => ({
    statusCode: 404,
    message
  }),
  
  conflict: (message = 'Resource already exists') => ({
    statusCode: 409,
    message
  }),
  
  serverError: (message = 'Internal server error') => ({
    statusCode: 500,
    message
  })
}

// Validation error formatter
export const formatValidationError = (error) => {
  if (error.errors && Array.isArray(error.errors)) {
    const messages = error.errors.map(err => err.message).join(', ')
    return {
      statusCode: 400,
      message: messages,
      errors: error.errors
    }
  }
  return errorResponses.badRequest(error.message)
}

// Safe async handler for routes
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
