// Session Token Management
interface SessionData {
  sessionToken: string;
  csrfToken: string;
  expiresAt: string;
  user?: {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
}

const SESSION_TOKEN_KEY = "session_token";
const SESSION_DATA_KEY = "session_data";

/**
 * Check if we're running in the browser
 */
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

/**
 * Store complete session data in localStorage
 */
export function storeSessionData(data: {
  session_token: string;
  csrf_token: string;
  expires_at: string;
  user?: any;
}): boolean {
  if (!isBrowser()) {
    console.warn("Cannot store session data: localStorage not available (SSR)");
    return false;
  }

  try {
    const sessionData: SessionData = {
      sessionToken: data.session_token,
      csrfToken: data.csrf_token,
      expiresAt: data.expires_at,
      user: data.user,
    };

    console.log("Storing session data:", {
      hasSessionToken: !!data.session_token,
      hasCsrfToken: !!data.csrf_token,
      expiresAt: data.expires_at,
      user: data.user,
      userKeys: data.user ? Object.keys(data.user) : null,
    });

    // Store data
    localStorage.setItem(SESSION_DATA_KEY, JSON.stringify(sessionData));
    localStorage.setItem(SESSION_TOKEN_KEY, data.session_token);

    // Immediately verify storage worked
    const storedData = localStorage.getItem(SESSION_DATA_KEY);
    const storedToken = localStorage.getItem(SESSION_TOKEN_KEY);

    if (!storedData || !storedToken) {
      console.error("Session data storage verification failed");
      return false;
    }

    const parsedData = JSON.parse(storedData);
    const isValid =
      parsedData.sessionToken === data.session_token &&
      parsedData.user &&
      parsedData.user.id &&
      parsedData.expiresAt;

    console.log("Session data stored and verified:", {
      success: isValid,
      storedUser: parsedData.user,
      tokenMatch: parsedData.sessionToken === data.session_token,
    });

    return isValid;
  } catch (error) {
    console.error("Failed to store session data:", error);
    return false;
  }
}

/**
 * Get session token from localStorage
 */
export function getSessionToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const sessionData = getSessionData();
    return sessionData?.sessionToken || null;
  } catch (error) {
    console.error("Failed to get session token:", error);
    return null;
  }
}

/**
 * Get complete session data from localStorage
 */
export function getSessionData(): SessionData | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const dataStr = localStorage.getItem(SESSION_DATA_KEY);
    if (!dataStr) {
      return null;
    }

    const sessionData: SessionData = JSON.parse(dataStr);

    // Check if session is expired
    const expirationDate = new Date(sessionData.expiresAt);
    const now = new Date();

    if (now >= expirationDate) {
      clearSessionData();
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error("Failed to get session data:", error);
    return null;
  }
}

/**
 * Get user data from session
 */
export function getSessionUser(): SessionData["user"] | null {
  const sessionData = getSessionData();
  console.log("Getting session user:", {
    hasSessionData: !!sessionData,
    user: sessionData?.user,
    userKeys: sessionData?.user ? Object.keys(sessionData.user) : null,
  });
  return sessionData?.user || null;
}

/**
 * Clear all session data from localStorage
 */
export function clearSessionData(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(SESSION_DATA_KEY);
    localStorage.removeItem(SESSION_TOKEN_KEY);
    // Also clear CSRF token since it's part of the session
    localStorage.removeItem("csrf_token");
    localStorage.removeItem("csrf_expires_at");
    console.log("Session data cleared");
  } catch (error) {
    console.error("Failed to clear session data:", error);
  }
}

/**
 * Check if user has a valid session
 */
export function hasValidSession(): boolean {
  const sessionData = getSessionData();
  const hasSession = sessionData !== null;
  const hasValidUser =
    hasSession && !!sessionData?.user && !!sessionData?.user.id;

  console.log("Checking valid session:", {
    hasSession,
    hasUser: !!sessionData?.user,
    hasValidUser,
    userId: sessionData?.user?.id,
    userEmail: sessionData?.user?.email,
    sessionData: sessionData,
  });

  return hasSession && hasValidUser;
}

/**
 * Get session headers for API requests
 */
export function getSessionHeaders(): Record<string, string> {
  const sessionData = getSessionData();
  if (!sessionData) {
    return {};
  }

  return {
    Authorization: `Bearer ${sessionData.sessionToken}`,
    "X-CSRF-Token": sessionData.csrfToken,
  };
}

/**
 * Check if session expires soon (within 5 minutes)
 */
export function isSessionExpiringSoon(): boolean {
  const sessionData = getSessionData();
  if (!sessionData) {
    return false;
  }

  const expirationDate = new Date(sessionData.expiresAt);
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  return expirationDate <= fiveMinutesFromNow;
}

/**
 * Get session expiration info
 */
export function getSessionInfo() {
  const sessionData = getSessionData();
  if (!sessionData) {
    return {
      hasSession: false,
      isValid: false,
      user: null,
    };
  }

  return {
    hasSession: true,
    isValid: true,
    expiresAt: sessionData.expiresAt,
    user: sessionData.user,
    isExpiringSoon: isSessionExpiringSoon(),
  };
}
