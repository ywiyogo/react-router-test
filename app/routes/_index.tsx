import { Link, useNavigate } from "react-router";
import { useEffect } from "react";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (typeof window === "undefined") return;

        const { hasValidSession } = await import("../lib/session-storage");

        if (hasValidSession()) {
          console.log(
            "Index: User already authenticated, redirecting to dashboard"
          );
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        console.error("Index: Error checking authentication:", error);
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-200 mb-2">Welcome</h1>
          <p className="text-gray-600 mb-8">
            Simple authentication app with React Router v7
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/login"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Sign In
          </Link>

          <Link
            to="/register"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
