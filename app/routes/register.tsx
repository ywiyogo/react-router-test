import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { handleUserRegistration } from "../lib/auth-examples";
import DebugCSRF from "../components/DebugCSRF";

export default function Register() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (typeof window === "undefined") return;

        const { hasValidSession } = await import("../lib/session-storage");

        if (hasValidSession()) {
          console.log(
            "Register: User already authenticated, redirecting to dashboard"
          );
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        console.error("Register: Error checking authentication:", error);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await handleUserRegistration(email);

      if (result.success) {
        console.log("Registration successful:", result);

        if (result.requiresOTP) {
          // Redirect to OTP verification page
          navigate(
            `/verify-otp?email=${encodeURIComponent(email)}&type=register`
          );
        } else {
          // Registration complete without OTP
          navigate("/dashboard");
        }
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-200">Create Account</h2>
          <p className="mt-2 text-gray-600">Enter your email to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Create Account"}
          </button>
        </form>

        <div className="text-center">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </div>
      </div>
      <DebugCSRF />
    </div>
  );
}
