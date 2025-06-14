// CSRF Token Management
interface CSRFTokenData {
  token: string;
  expiresAt: string;
}

const CSRF_TOKEN_KEY = "csrf_token";
const CSRF_EXPIRES_KEY = "csrf_expires_at";

/**
 * Check if we're running in the browser
 */
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

/**
 * Store CSRF token in localStorage
 */
export function storeCSRFToken(token: string, expiresAt: string): void {
  if (!isBrowser()) {
    console.warn("Cannot store CSRF token: localStorage not available (SSR)");
    return;
  }

  try {
    localStorage.setItem(CSRF_TOKEN_KEY, token);
    localStorage.setItem(CSRF_EXPIRES_KEY, expiresAt);
  } catch (error) {
    console.error("Failed to store CSRF token:", error);
  }
}

/**
 * Get CSRF token from localStorage
 */
export function getCSRFToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const token = localStorage.getItem(CSRF_TOKEN_KEY);
    const expiresAt = localStorage.getItem(CSRF_EXPIRES_KEY);

    if (!token || !expiresAt) {
      return null;
    }

    // Check if token is expired
    const expirationDate = new Date(expiresAt);
    const now = new Date();

    if (now >= expirationDate) {
      clearCSRFToken();
      return null;
    }

    return token;
  } catch (error) {
    console.error("Failed to get CSRF token:", error);
    return null;
  }
}

/**
 * Clear CSRF token from localStorage
 */
export function clearCSRFToken(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(CSRF_TOKEN_KEY);
    localStorage.removeItem(CSRF_EXPIRES_KEY);
  } catch (error) {
    console.error("Failed to clear CSRF token:", error);
  }
}

/**
 * Check if CSRF token exists and is valid
 */
export function hasValidCSRFToken(): boolean {
  return getCSRFToken() !== null;
}

/**
 * Get CSRF headers for API requests
 */
export function getCSRFHeaders(): Record<string, string> {
  const token = getCSRFToken();
  return token ? { "X-CSRF-Token": token } : {};
}

/**
 * Store CSRF token from API response
 */
export function handleCSRFResponse(response: {
  csrf_token?: string;
  expires_at?: string;
}): void {
  if (response.csrf_token && response.expires_at) {
    storeCSRFToken(response.csrf_token, response.expires_at);
    console.log("CSRF token stored successfully");
  }
}
