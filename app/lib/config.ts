// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8090",
  ENDPOINTS: {
    REGISTER: "/register",
    LOGIN: "/login",
    LOGOUT: "/logout",
    VERIFY_OTP: "/verify-otp",
  },
} as const;

// Helper function to build full API URLs
export const getApiUrl = (
  endpoint: keyof typeof API_CONFIG.ENDPOINTS
): string => {
  console.log(`Fetching API URL for endpoint: ${API_CONFIG.BASE_URL}`);
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[endpoint]}`;
};
