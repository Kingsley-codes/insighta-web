// lib/error-handler.ts
export interface ApiErrorResponse {
  status: string;
  message: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message?: string;
  response?: {
    data?: ApiErrorResponse;
    status?: number;
  };
  status?: number;
  code?: string;
  isAxiosError?: boolean;
}

// Type guard for Axios-like errors
function isAxiosLikeError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    ("isAxiosError" in error || "response" in error)
  );
}

// Updated to accept a default message as second argument
export function getErrorMessage(
  error: unknown,
  defaultMessage: string = "An error occurred",
): string {
  // Handle Axios-like errors
  if (isAxiosLikeError(error)) {
    // Check for nested message in response data
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // Check for validation errors
    if (error.response?.data?.errors) {
      const validationErrors = Object.values(error.response.data.errors).flat();
      if (validationErrors.length > 0) {
        return validationErrors.join(", ");
      }
    }

    // Check for status-specific messages
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          return "Bad request. Please check your input.";
        case 401:
          return "Authentication failed. Please check your credentials.";
        case 403:
          return "You don't have permission to perform this action.";
        case 404:
          return "Resource not found.";
        case 409:
          return "Conflict: The resource already exists.";
        case 422:
          return "Validation error. Please check your input.";
        case 429:
          return "Too many requests. Please try again later.";
        case 500:
          return "Server error. Please try again later.";
        default:
          return defaultMessage;
      }
    }

    // Check for direct message property
    if (error.message) {
      return error.message;
    }

    // Check for network error codes
    if (error.code === "ECONNABORTED") {
      return "Request timeout. Please try again.";
    }

    if (error.code === "ERR_NETWORK") {
      return "Network error. Please check your connection.";
    }
  }

  // Handle Error instances
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  return defaultMessage;
}

// Specific error handlers with default messages
export function getAuthErrorMessage(error: unknown): string {
  return getErrorMessage(error, "Authentication failed. Please try again.");
}

export function getValidationErrorMessage(error: unknown): string {
  return getErrorMessage(error, "Validation failed. Please check your input.");
}

export function getNetworkErrorMessage(error: unknown): string {
  const message = getErrorMessage(
    error,
    "Network error. Please check your connection.",
  );

  // Add retry suggestion for network errors
  if (message.includes("Network") || message.includes("connection")) {
    return `${message} Please check your internet connection and try again.`;
  }

  if (message.includes("timeout")) {
    return `${message} The server took too long to respond.`;
  }

  return message;
}

// Log error to console in development
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === "development") {
    const prefix = context ? `[Error: ${context}]` : "[Error]";
    console.error(prefix, error instanceof Error ? error.message : error);

    // Log full error object in development for debugging
    if (error instanceof Error && error.stack) {
      console.debug("Stack trace:", error.stack);
    }
  }
}

// Format error for logging (no any types)
export function formatErrorForLogging(error: unknown): Record<string, unknown> {
  const baseLog = {
    timestamp: new Date().toISOString(),
    type: typeof error,
  };

  if (error instanceof Error) {
    return {
      ...baseLog,
      type: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === "object" && error !== null) {
    return {
      ...baseLog,
      error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    };
  }

  return {
    ...baseLog,
    error: String(error),
  };
}
