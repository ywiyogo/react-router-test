import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("logout", "routes/logout.tsx"),
  route("verify-otp", "routes/verify-otp.tsx")
] satisfies RouteConfig;
