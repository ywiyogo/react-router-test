import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import DebugSession from "../components/DebugSession";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Add a small delay to ensure localStorage is ready
        await new Promise((resolve) => setTimeout(resolve, 100));

        const { hasValidSession, getSessionUser, getSessionInfo } =
          await import("../lib/session-storage");

        // Check if we're in the browser
        if (typeof window === "undefined") {
          setLoading(false);
          return;
        }

        const sessionValid = hasValidSession();

        if (!sessionValid) {
          navigate("/login", { replace: true });
          return;
        }

        const sessionUser = getSessionUser();

        if (!sessionUser || !sessionUser.id) {
          navigate("/login", { replace: true });
          return;
        }
        setUser({
          email: sessionUser.email || "No email",
          isVerified: true,
          id: sessionUser.id,
        });
      } catch (error) {
        console.error("Dashboard auth check error:", error);
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
          <p className="text-sm text-gray-400 mt-2">
            Please wait while we verify your session
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-200">Dashboard</h1>
            <button
              onClick={() => navigate("/logout")}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Welcome to your dashboard!
              </h2>
              <p className="text-gray-600 mb-2">You are logged in as:</p>
              <p className="text-lg font-medium text-blue-600">{user.email}</p>
              <p className="text-sm text-gray-500 mt-2">
                Status: {user.isVerified ? "✅ Verified" : "❌ Not verified"}
              </p>
            </div>
          </div>
        </div>
      </main>
      <DebugSession />
    </div>
  );
}
