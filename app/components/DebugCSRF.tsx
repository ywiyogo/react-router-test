import { useState, useEffect } from "react";
import { getCSRFToken, hasValidCSRFToken } from "../lib/csrf";

export default function DebugCSRF() {
  const [tokenInfo, setTokenInfo] = useState({
    hasToken: false,
    isValid: false,
    token: null as string | null,
    rawToken: null as string | null,
    expiresAt: null as string | null,
  });
  const [isMounted, setIsMounted] = useState(false);

  const refreshTokenInfo = () => {
    if (typeof window === "undefined") return;

    const token = getCSRFToken();
    const hasValid = hasValidCSRFToken();
    const expiresAt =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("csrf_expires_at")
        : null;

    setTokenInfo({
      hasToken: !!token,
      isValid: hasValid,
      token: token ? `${token.substring(0, 20)}...` : null,
      rawToken: token,
      expiresAt: expiresAt,
    });
  };

  useEffect(() => {
    setIsMounted(true);
    refreshTokenInfo();

    // Refresh every 5 seconds
    const interval = setInterval(refreshTokenInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const clearToken = () => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("csrf_token");
      localStorage.removeItem("csrf_expires_at");
    }
    refreshTokenInfo();
  };

  const testApiCall = async () => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const token = getCSRFToken();
      if (token) {
        headers["X-CSRF-Token"] = token;
      }

      console.log("Test API call headers:", headers);

      const response = await fetch("/api/test", {
        method: "POST",
        headers,
        body: JSON.stringify({ test: "data" }),
      });

      console.log("Test API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Test API response data:", data);
      } else {
        console.log("Test API failed:", await response.text());
      }
    } catch (error) {
      console.error("Test API error:", error);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-yellow-400">CSRF Debug</h3>
        <button
          onClick={refreshTokenInfo}
          className="text-blue-400 hover:text-blue-300"
        >
          🔄
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Has Token:</span>
          <span
            className={tokenInfo.hasToken ? "text-green-400" : "text-red-400"}
          >
            {tokenInfo.hasToken ? "✅" : "❌"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Is Valid:</span>
          <span
            className={tokenInfo.isValid ? "text-green-400" : "text-red-400"}
          >
            {tokenInfo.isValid ? "✅" : "❌"}
          </span>
        </div>

        {tokenInfo.token && (
          <div>
            <span>Token:</span>
            <div className="bg-gray-800 p-1 rounded mt-1 break-all">
              {tokenInfo.token}
            </div>
          </div>
        )}

        {tokenInfo.expiresAt && (
          <div>
            <span>Expires:</span>
            <div className="text-gray-300">
              {new Date(tokenInfo.expiresAt).toLocaleString()}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <button
            onClick={clearToken}
            className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
          >
            Clear Token
          </button>
          <button
            onClick={testApiCall}
            className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
          >
            Test API
          </button>
        </div>

        {isMounted && (
          <div className="mt-2 text-gray-400">
            <div>LocalStorage Keys:</div>
            <div>
              • csrf_token:{" "}
              {typeof localStorage !== "undefined" &&
              localStorage.getItem("csrf_token")
                ? "✅"
                : "❌"}
            </div>
            <div>
              • csrf_expires_at:{" "}
              {typeof localStorage !== "undefined" &&
              localStorage.getItem("csrf_expires_at")
                ? "✅"
                : "❌"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
