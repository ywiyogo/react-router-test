import { useState, useEffect } from "react";

interface SessionInfo {
  hasSession: boolean;
  isValid: boolean;
  expiresAt?: string;
  user?: {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
  } | null;
  isExpiringSoon?: boolean;
}

export default function DebugSession() {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    const updateSessionInfo = async () => {
      try {
        const { getSessionInfo, getSessionToken } = await import(
          "../lib/session-storage"
        );
        const info = getSessionInfo();
        const token = getSessionToken();

        setSessionInfo(info);
        setSessionToken(token);
      } catch (error) {
        console.error("Error getting session info:", error);
      }
    };

    updateSessionInfo();

    // Update every second to show real-time changes
    const interval = setInterval(updateSessionInfo, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClearSession = async () => {
    try {
      const { clearSessionData } = await import("../lib/session-storage");
      clearSessionData();

      // Update display
      setSessionInfo(null);
      setSessionToken(null);
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-[400px] text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Session Debug</h3>
        <button
          onClick={handleClearSession}
          className="text-red-400 hover:text-red-300 text-xs px-2 py-1 border border-red-400 rounded"
        >
          Clear
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-gray-400">Has Session:</span>{" "}
          <span
            className={
              sessionInfo?.hasSession ? "text-green-400" : "text-red-400"
            }
          >
            {sessionInfo?.hasSession ? "✅ Yes" : "❌ No"}
          </span>
        </div>

        <div>
          <span className="text-gray-400">Valid:</span>{" "}
          <span
            className={sessionInfo?.isValid ? "text-green-400" : "text-red-400"}
          >
            {sessionInfo?.isValid ? "✅ Yes" : "❌ No"}
          </span>
        </div>

        {sessionInfo?.expiresAt && (
          <div>
            <span className="text-gray-400">Expires:</span>{" "}
            <span className="text-blue-400">
              {new Date(sessionInfo.expiresAt).toLocaleString()}
            </span>
          </div>
        )}

        {sessionInfo?.isExpiringSoon && (
          <div className="text-yellow-400">⚠️ Expires soon!</div>
        )}

        {sessionInfo?.user && (
          <div>
            <span className="text-gray-400">User:</span>{" "}
            <span className="text-blue-400">{sessionInfo.user.email}</span>
          </div>
        )}

        {sessionToken && (
          <div>
            <span className="text-gray-400">Token:</span>{" "}
            <span className="text-green-400 break-all">
              {sessionToken.substring(0, 20)}...
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-gray-600">
          <div className="text-gray-500 text-xs">LocalStorage keys:</div>
          <ul className="text-xs space-y-1">
            <li>
              <span className="text-gray-400">session_data:</span>{" "}
              {typeof localStorage !== "undefined" &&
              localStorage.getItem("session_data")
                ? "✅"
                : "❌"}
            </li>
            <li>
              <span className="text-gray-400">session_token:</span>{" "}
              {typeof localStorage !== "undefined" &&
              localStorage.getItem("session_token")
                ? "✅"
                : "❌"}
            </li>
            <li>
              <span className="text-gray-400">csrf_token:</span>{" "}
              {typeof localStorage !== "undefined" &&
              localStorage.getItem("csrf_token")
                ? "✅"
                : "❌"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
