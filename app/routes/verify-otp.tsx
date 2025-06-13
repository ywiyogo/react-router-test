import { Form, redirect, useActionData, useLoaderData, Link } from "react-router";
import type { LoaderArgs, ActionArgs } from "./+types/verify-otp";
import { verifyOTP } from "../lib/auth";
import { sessionCookie } from "../lib/session";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const type = url.searchParams.get("type");
  
  if (!email || !type) {
    return redirect("/login");
  }
  
  return { email, type };
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;
  
  if (!email || !otp) {
    return { error: "Email and OTP are required" };
  }
  
  const result = verifyOTP(email, otp);
  
  if (result.success && result.sessionId) {
    const headers = new Headers();
    headers.append("Set-Cookie", await sessionCookie.serialize(result.sessionId));
    return redirect("/dashboard", { headers });
  }
  
  return { error: result.message };
}

export default function VerifyOTP() {
  const { email, type } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-200">Verify OTP</h2>
          <p className="mt-2 text-gray-600">
            We've sent a verification code to <strong>{email}</strong>
          </p>
        </div>
        
        <Form method="post" className="space-y-6">
          <input type="hidden" name="email" value={email} />
          
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
              placeholder="123456"
            />
          </div>
          
          {actionData?.error && (
            <div className="text-red-600 text-sm">{actionData.error}</div>
          )}
          
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Verify Code
          </button>
        </Form>
        
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