import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { handleUserLogout } from "../lib/auth-examples";

export default function Logout() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const performLogout = async () => {
    setError("");
    setLoading(true);

    try {
      // Use the new API client with CSRF handling
      const result = await handleUserLogout();

      if (result.success) {
        console.log("Logout successful");
      } else {
        console.warn("Logout API failed, but session cleared locally");
      }

      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      setError("Failed to logout. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    performLogout();
  }, []);

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
          <div className="mt-4 space-x-4">
            <button
              onClick={performLogout}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
