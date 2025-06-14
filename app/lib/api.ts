import { getApiUrl } from "./config";
import { getCSRFHeaders, handleCSRFResponse } from "./csrf";
import { getSessionHeaders } from "./session-storage";

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user?: {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
  csrf_token?: string;
  session_token?: string;
  expires_at?: string;
  requires_otp?: boolean;
  message?: string;
  sessionId?: string;
}

// HTTP Methods
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Request options
interface ApiRequestOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  includeCSRF?: boolean;
}

/**
 * Make API request with automatic CSRF token handling
 */
async function apiRequest<T = any>(
  endpoint: keyof typeof import("./config").API_CONFIG.ENDPOINTS,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, headers = {}, includeCSRF = true } = options;

  try {
    const url = getApiUrl(endpoint);

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    // Add CSRF token if required
    if (
      includeCSRF &&
      (method === "POST" ||
        method === "PUT" ||
        method === "PATCH" ||
        method === "DELETE")
    ) {
      const csrfHeaders = getCSRFHeaders();
      Object.assign(requestHeaders, csrfHeaders);
    }

    // Add session headers for authenticated requests
    const sessionHeaders = getSessionHeaders();
    Object.assign(requestHeaders, sessionHeaders);

    console.log("Making API request:", {
      url,
      method,
      headers: requestHeaders,
      hasBody: !!body,
    });

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseData = await response.json();

    console.log("API Response Data:", {
      url,
      method,
      status: response.status,
      responseData,
      hasSessionToken: !!responseData.session_token,
      hasCsrfToken: !!responseData.csrf_token,
      hasExpiresAt: !!responseData.expires_at,
      hasUser: !!responseData.user,
      userData: responseData.user,
    });

    // Handle CSRF token from response
    if (responseData.csrf_token && responseData.expires_at) {
      handleCSRFResponse(responseData);
    }

    // Handle session data from response (for OTP verification and login)
    if (
      responseData.session_token &&
      responseData.csrf_token &&
      responseData.expires_at
    ) {
      console.log("Storing session data from API response:", {
        session_token: responseData.session_token?.substring(0, 10) + "...",
        csrf_token: responseData.csrf_token?.substring(0, 10) + "...",
        expires_at: responseData.expires_at,
        user: responseData.user,
      });

      const { storeSessionData } = await import("./session-storage");
      const storageSuccess = storeSessionData({
        session_token: responseData.session_token,
        csrf_token: responseData.csrf_token,
        expires_at: responseData.expires_at,
        user: responseData.user,
      });

      console.log("Session data storage completed:", {
        success: storageSuccess,
      });

      if (!storageSuccess) {
        console.error("Failed to store session data in localStorage");
        return {
          error: "Session storage failed",
          data: responseData,
        };
      }
    }

    if (!response.ok) {
      return {
        error:
          responseData.message ||
          responseData.error ||
          `HTTP ${response.status}`,
        data: responseData,
      };
    }

    return {
      data: responseData,
      message: responseData.message,
    };
  } catch (error) {
    console.error("API request failed:", error);
    return {
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
}

/**
 * Register a new user
 */
export async function registerUser(
  email: string,
  password?: string
): Promise<ApiResponse<AuthResponse>> {
  return apiRequest<AuthResponse>("REGISTER", {
    method: "POST",
    body: { email, password },
    includeCSRF: false, // First request, no CSRF token yet
  });
}

/**
 * Login user
 */
export async function loginUser(
  email: string,
  password?: string
): Promise<ApiResponse<AuthResponse>> {
  return apiRequest<AuthResponse>("LOGIN", {
    method: "POST",
    body: { email, password },
    includeCSRF: false, // Login might not require CSRF initially
  });
}

/**
 * Verify OTP
 */
export async function verifyOTP(
  email: string,
  otp: string
): Promise<ApiResponse<AuthResponse>> {
  return apiRequest<AuthResponse>("VERIFY_OTP", {
    method: "POST",
    body: { email, otp },
    includeCSRF: true, // OTP verification requires CSRF token
  });
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<ApiResponse> {
  // Get session data to include in request body
  const { getSessionData } = await import("./session-storage");
  const sessionData = getSessionData();

  const body: any = {};

  if (sessionData) {
    body.session_token = sessionData.sessionToken;
    if (sessionData.user?.email) {
      body.email = sessionData.user.email;
    }
  }

  return apiRequest("LOGOUT", {
    method: "POST",
    body: Object.keys(body).length > 0 ? body : undefined,
    includeCSRF: true,
  });
}

/**
 * Generic API call function for custom endpoints
 */
export async function makeApiCall<T = any>(
  endpoint: keyof typeof import("./config").API_CONFIG.ENDPOINTS,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, options);
}

// Export the main request function for advanced use cases
export { apiRequest };
