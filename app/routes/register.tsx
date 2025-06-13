import { Form, redirect, useActionData, Link } from "react-router";
import type {  ActionArgs } from "./+types/register";
import { createUser } from "../lib/auth";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  
  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address" };
  }
  
  const result = createUser(email);
  
  if (result.success) {
    return redirect(`/verify-otp?email=${encodeURIComponent(email)}&type=register`);
  }
  
  return { error: result.message };
}

export default function Register() {
  const actionData = useActionData<typeof action>();
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-200">Create Account</h2>
          <p className="mt-2 text-gray-600">Enter your email to get started</p>
        </div>
        
        <Form method="post" className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>
          
          {actionData?.error && (
            <div className="text-red-600 text-sm">{actionData.error}</div>
          )}
          
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Account
          </button>
        </Form>
        
        <div className="text-center">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}