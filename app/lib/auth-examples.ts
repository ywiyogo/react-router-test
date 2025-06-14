// Example usage of the API client with CSRF token handling

import { registerUser, loginUser, verifyOTP, logoutUser } from "./api";
import { getCSRFToken, hasValidCSRFToken, clearCSRFToken } from "./csrf";

/**
 * Example: User Registration Flow
 */
export async function handleUserRegistration(email: string, password?: string) {
  console.log("Starting user registration...");

  const result = await registerUser(email, password);

  if (result.error) {
    console.error("Registration failed:", result.error);
    return { success: false, error: result.error };
  }

  if (result.data) {
    console.log("Registration successful:", result.data);

    // CSRF token is automatically stored by the API client
    console.log("CSRF token stored:", hasValidCSRFToken());

    if (result.data.requires_otp) {
      console.log("OTP verification required");
      return {
        success: true,
        requiresOTP: true,
        message: result.data.message,
      };
    }

    return { success: true, user: result.data.user };
  }

  return { success: false, error: "Unknown error occurred" };
}

/**
 * Example: OTP Verification Flow
 */
export async function handleOTPVerification(email: string, otp: string) {
  console.log("Verifying OTP...");

  // Check if we have a valid CSRF token
  const token = getCSRFToken();
  const hasValid = hasValidCSRFToken();

  console.log("CSRF Token Debug:", {
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 10)}...` : null,
    isValid: hasValid,
    localStorage: {
      csrf_token:
        typeof localStorage !== "undefined"
          ? localStorage.getItem("csrf_token")
          : null,
      csrf_expires_at:
        typeof localStorage !== "undefined"
          ? localStorage.getItem("csrf_expires_at")
          : null,
    },
  });

  if (!hasValid) {
    console.error("No valid CSRF token found - debugging info above");
    return { success: false, error: "Session expired. Please try again." };
  }

  const result = await verifyOTP(email, otp);

  if (result.error) {
    console.error("OTP verification failed:", result.error);
    return { success: false, error: result.error };
  }

  if (result.data) {
    console.log("OTP verification successful:", result.data);

    // Wait for session data to be stored by the API client
    // Give it a moment to ensure localStorage is updated
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Verify session data was stored correctly
    const { hasValidSession, getSessionInfo, getSessionUser } = await import(
      "./session-storage"
    );

    const sessionValid = hasValidSession();
    const sessionInfo = getSessionInfo();
    const user = getSessionUser();

    console.log("Session verification after OTP:", {
      sessionValid,
      sessionInfo,
      user,
      hasUserData: !!user,
      userEmail: user?.email,
      userId: user?.id,
    });

    if (!sessionValid || !user) {
      console.error("Session data not properly stored after OTP verification");
      return {
        success: false,
        error: "Session setup failed. Please try again.",
      };
    }

    return {
      success: true,
      user: result.data.user,
      sessionData: result.data,
      hasValidSession: sessionValid,
      storedUser: user,
    };
  }

  return { success: false, error: "Unknown error occurred" };
}

/**
 * Example: User Login Flow
 */
export async function handleUserLogin(email: string, password?: string) {
  console.log("Starting user login...");

  const result = await loginUser(email, password);

  if (result.error) {
    console.error("Login failed:", result.error);
    return { success: false, error: result.error };
  }

  if (result.data) {
    console.log("Login successful:", result.data);

    if (result.data.requires_otp) {
      console.log("OTP verification required");
      return {
        success: true,
        requiresOTP: true,
        message: result.data.message,
      };
    }

    return { success: true, user: result.data.user };
  }

  return { success: false, error: "Unknown error occurred" };
}

/**
 * Example: User Logout Flow
 */
export async function handleUserLogout() {
  console.log("Logging out user...");

  const { hasValidSession, clearSessionData } = await import(
    "./session-storage"
  );

  if (!hasValidSession()) {
    console.log("No active session found");
    return { success: true };
  }

  const result = await logoutUser();

  // Clear all session data regardless of result
  clearSessionData();

  if (result.error) {
    console.error("Logout request failed:", result.error);
    // Still return success since session data is cleared
  }

  console.log("Logout completed");
  return { success: true };
}

/**
 * Example: Check Authentication Status
 */
export async function isUserAuthenticated(): Promise<boolean> {
  const { hasValidSession } = await import("./session-storage");
  const hasSession = hasValidSession();
  console.log("User authentication status:", hasSession);
  return hasSession;
}

/**
 * Example: Get Current CSRF Token Info
 */
export function getCurrentTokenInfo() {
  const token = getCSRFToken();
  const hasValid = hasValidCSRFToken();

  return {
    hasToken: !!token,
    isValid: hasValid,
    token: token ? `${token.substring(0, 10)}...` : null, // Only show first 10 chars for security
  };
}

/**
 * Example: Complete Registration + OTP Flow
 */
export async function completeRegistrationFlow(
  email: string,
  password?: string
) {
  console.log("Starting complete registration flow...");

  // Step 1: Register user
  const registrationResult = await handleUserRegistration(email, password);

  if (!registrationResult.success) {
    return registrationResult;
  }

  if (!registrationResult.requiresOTP) {
    return registrationResult; // Registration complete
  }

  // Step 2: Wait for OTP input (this would be handled by UI)
  console.log("Waiting for OTP input...");

  return {
    success: true,
    requiresOTP: true,
    message: "Please enter the OTP sent to your email",
    nextStep: "otp_verification",
  };
}

/**
 * Example: Error Handling with Retry Logic
 */
export async function registerWithRetry(
  email: string,
  password?: string,
  maxRetries = 3
) {
  let attempt = 1;

  while (attempt <= maxRetries) {
    console.log(`Registration attempt ${attempt}/${maxRetries}`);

    const result = await handleUserRegistration(email, password);

    if (result.success) {
      return result;
    }

    // Check if it's a temporary error worth retrying
    if (
      result.error?.includes("network") ||
      result.error?.includes("timeout")
    ) {
      console.log(`Retrying due to network error: ${result.error}`);
      attempt++;

      // Wait before retry (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
      );
    } else {
      // Non-retryable error
      console.log(`Non-retryable error: ${result.error}`);
      return result;
    }
  }

  return {
    success: false,
    error: `Registration failed after ${maxRetries} attempts`,
  };
}
