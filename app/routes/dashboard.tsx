import { Form, redirect, useLoaderData } from "react-router";
import type { LoaderArgs, ActionArgs } from "./+types/dashboard";
import { getUser, logout } from "../lib/auth";
import { sessionCookie } from "../lib/session";

export async function loader({ request }: LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const sessionId = await sessionCookie.parse(cookieHeader);
  
  if (!sessionId) {
    return redirect("/login");
  }
  
  const user = getUser(sessionId);
  if (!user) {
    return redirect("/login");
  }
  
  return { user };
}

// export async function action({ request }: ActionArgs) {
//   const cookieHeader = request.headers.get("Cookie");
//   const sessionId = await sessionCookie.parse(cookieHeader);
  
//   if (sessionId) {
//     logout(sessionId);
//   }
  
//   const headers = new Headers();
//   headers.append("Set-Cookie", await sessionCookie.serialize("", { maxAge: 0 }));
  
//   return redirect("/", { headers });
// }

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();
//   const user ={    email: "test@gmail.com",
//     isVerified: true,
//     id: "12345"
//   };
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-200">Dashboard</h1>
            <Form method="post">
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </Form>
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
    </div>
  );
}