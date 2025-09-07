$version: "2"

namespace com.madmall.api

/// Standard validation error for invalid input
@error("client")
@httpError(400)
structure ValidationError {
    @required
    message: String
    
    /// Field-specific validation errors
    fieldErrors: FieldErrorMap
    
    /// Error code for programmatic handling
    code: String = "VALIDATION_ERROR"
}

/// Unauthorized access error
@error("client")
@httpError(401)
structure UnauthorizedError {
    @required
    message: String = "Authentication required"
    
    code: String = "UNAUTHORIZED"
}

/// Forbidden access error
@error("client")
@httpError(403)
structure ForbiddenError {
    @required
    message: String = "Access forbidden"
    
    code: String = "FORBIDDEN"
}

/// Resource not found error
@error("client")
@httpError(404)
structure NotFoundError {
    @required
    message: String
    
    /// Type of resource that was not found
    resourceType: String
    
    /// ID of the resource that was not found
    resourceId: String
    
    code: String = "NOT_FOUND"
}

/// Resource conflict error
@error("client")
@httpError(409)
structure ConflictError {
    @required
    message: String
    
    /// Type of conflict
    conflictType: String
    
    code: String = "CONFLICT"
}

/// Rate limit exceeded error
@error("client")
@httpError(429)
structure TooManyRequestsError {
    @required
    message: String = "Rate limit exceeded"
    
    /// Seconds until rate limit resets
    retryAfter: Integer
    
    code: String = "RATE_LIMIT_EXCEEDED"
}

/// Internal server error
@error("server")
@httpError(500)
structure InternalServerError {
    @required
    message: String = "Internal server error"
    
    /// Request ID for tracking
    requestId: String
    
    code: String = "INTERNAL_ERROR"
}

/// Map of field names to error messages
map FieldErrorMap {
    key: String
    value: String
}