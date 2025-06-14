import { Link, useNavigate, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import { handleOTPVerification } from "../lib/auth-examples";
import DebugCSRF from "../components/DebugCSRF";
import DebugSession from "../components/DebugSession";

export default function VerifyOTP() {
  const [searchParams] = useSearchParams();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const email = searchParams.get("email");
  const type = searchParams.get("type");

  useEffect(() => {
    console.log("VerifyOTP useEffect - email:", email, "type:", type);
    if (!email || !type) {
      console.log("Missing email or type, redirecting to login");
      navigate("/login");
    }
  }, [email, type, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("Starting OTP verification for:", email);

    if (!email || !otp) {
      setError("Email and OTP are required");
      return;
    }

    try {
      setLoading(true);
      const result = await handleOTPVerification(email, otp);

      console.log("OTP verification result:", result);

      if (result.success) {
        console.log("OTP verification successful");
        console.log("Session data from result:", {
          hasValidSession: result.hasValidSession,
          storedUser: result.storedUser,
        });

        if (!result.hasValidSession || !result.storedUser) {
          console.error(
            "Session not properly established after OTP verification"
          );
          setError("Authentication failed. Please try again.");
          return;
        }

        console.log("Session verified, navigating to dashboard");
        // Navigate to dashboard with replace to prevent back navigation to OTP page
        navigate("/dashboard", { replace: true });
      } else {
        console.log("OTP verification failed:", result.error);
        setError(result.error || "Verification failed");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!email || !type) {
    console.log("VerifyOTP: Missing email or type, returning null");
    return null;
  }

  console.log("VerifyOTP rendering with email:", email, "type:", type);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-200">Verify OTP</h2>
          <p className="mt-2 text-gray-300">
            We've sent a verification code to <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700"
            >
              Verification Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
              placeholder="123456"
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div className="text-center">
          <span className="text-gray-600">Didn't receive the code? </span>
          <Link
            to={type === "register" ? "/register" : "/login"}
            className="text-blue-600 hover:text-blue-500"
          >
            Try again
          </Link>
        </div>
      </div>
      <DebugCSRF />
      <DebugSession />
    </div>
  );
}
