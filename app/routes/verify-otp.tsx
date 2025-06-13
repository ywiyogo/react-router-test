import { redirect, Link, useNavigate, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import { sessionCookie } from "../lib/session";
import { getApiUrl } from "../lib/config";

export default function VerifyOTP() {
  const [searchParams] = useSearchParams();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const email = searchParams.get("email");
  const type = searchParams.get("type");

  useEffect(() => {
    if (!email || !type) {
      navigate("/login");
    }
  }, [email, type, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !otp) {
      setError("Email and OTP are required");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(getApiUrl("VERIFY_OTP"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      
      if (response.ok && data.sessionId) {
        // Set session cookie
        document.cookie = await sessionCookie.serialize(data.sessionId);
        navigate("/dashboard");
      } else {
        setError(data.message || "Verification failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!email || !type) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-200">Verify OTP</h2>
          <p className="mt-2 text-gray-600">
            We've sent a verification code to <strong>{email}</strong>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
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
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
        
        <div className="text-center">
          <span className="text-gray-600">Didn't receive the code? </span>
          <Link to={type === "register" ? "/register" : "/login"} className="text-blue-600 hover:text-blue-500">
            Try again
          </Link>
        </div>
      </div>
    </div>
  );
}