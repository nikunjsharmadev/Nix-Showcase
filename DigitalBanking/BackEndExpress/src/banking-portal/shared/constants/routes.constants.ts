export const API_ROUTES = {
  root: "/",
  auth: {
    root: "/auth",
    server: "/server",
    register: "/register",
    login: "/login",
    verifyEmail: "/verify-email",
  },
  users: {
    root: "/users",
    server: "/server",
  },
} as const;
