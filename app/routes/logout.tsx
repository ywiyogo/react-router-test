import { redirect, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { sessionCookie } from "../lib/session";
import { getApiUrl } from "../lib/config";

export default function Logout() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        const cookieHeader = document.cookie;
        const sessionId = await sessionCookie.parse(cookieHeader);
        
        if (sessionId) {
          await fetch(getApiUrl("LOGOUT"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
        }

        // Clear session cookie
        document.cookie = await sessionCookie.serialize("", { maxAge: 0 });
        navigate("/");
      } catch (err) {
        setError("Failed to logout. Please try again.");
        setLoading(false);
      }
    };

    performLogout();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-200">Logging out...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-200">Error</h2>
          <p className="mt-2 text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return null;
}
