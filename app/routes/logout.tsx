import { redirect } from "react-router";
import type { LoaderArgs, ActionArgs  } from "./+types/logout";
import { logout } from "../lib/auth";
import { sessionCookie } from "../lib/session";

export async function action({ request }: ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const sessionId = await sessionCookie.parse(cookieHeader);
  
  if (sessionId) {
    logout(sessionId);
  }
  
  const headers = new Headers();
  headers.append("Set-Cookie", await sessionCookie.serialize("", { maxAge: 0 }));
  
  return redirect("/", { headers });
}

export async function loader() {
  return redirect("/");
}
